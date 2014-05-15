'use strict';

var Geometry = require('../geometry/geometry.js');
var Bucket = require('../geometry/bucket.js');
var FeatureTree = require('../geometry/featuretree.js');
var Protobuf = require('pbf');
var VectorTile = require('../format/vectortile.js');
var VectorTileFeature = require('../format/vectortilefeature.js');
var Placement = require('../text/placement.js');
var Shaping = require('../text/shaping.js');

// if (typeof self.console === 'undefined') {
//     self.console = require('./console.js');
// }

var actor = require('./worker.js');

/*
 * Request a resources as an arraybuffer
 *
 * @param {string} url
 * @param {function} callback
 */
function loadBuffer(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            callback(null, xhr.response);
        } else {
            callback(xhr.statusText);
        }
    };
    xhr.send();
    return xhr;
}

module.exports = WorkerTile;
function WorkerTile(url, id, zoom, tileSize, callback) {
    var tile = this;
    this.url = url;
    this.id = id;
    this.zoom = zoom;
    this.tileSize = tileSize;

    WorkerTile.loading[id] = loadBuffer(url, function(err, data) {
        delete WorkerTile.loading[id];
        if (err) {
            callback(err);
        } else {
            WorkerTile.loaded[id] = tile;
            tile.data = new VectorTile(new Protobuf(new Uint8Array(data)));
            tile.parse(tile.data, callback);
        }
    });
}

WorkerTile.cancel = function(id) {
    if (WorkerTile.loading[id]) {
        WorkerTile.loading[id].abort();
        delete WorkerTile.loading[id];
    }
};

// Stores tiles that are currently loading.
WorkerTile.loading = {};

// Stores tiles that are currently loaded.
WorkerTile.loaded = {};

// Stores the style information.
WorkerTile.buckets = {};

/*
 * Sorts features in a layer into different buckets, according to the maping
 *
 * Layers in vector tiles contain many different features, and feature types,
 * e.g. the landuse layer has parks, industrial buildings, forests, playgrounds
 * etc. However, when styling, we need to separate these features so that we can
 * render them separately with different styles.
 *
 * @param {VectorTileLayer} layer
 * @param {Mapping} mapping
 */
function sortFeaturesIntoBuckets(layer, mapping) {
    var buckets = {};

    for (var i = 0; i < layer.length; i++) {
        var feature = layer.feature(i);
        for (var key in mapping) {
            // Filter features based on the filter function if it exists.
            if (!mapping[key].fn || mapping[key].fn(feature)) {

                // Only load features that have the same geometry type as the bucket.
                var type = VectorTileFeature.mapping[feature._type];
                if (type === mapping[key].filter.feature_type || mapping[key][type]) {
                    if (!(key in buckets)) buckets[key] = [];
                    buckets[key].push(feature);
                }
            }
        }
    }

    return buckets;
}

WorkerTile.prototype.parseBucket = function(bucket_name, features, info, faces, layer, callback) {
    var geometry = this.geometry;

    var bucket = new Bucket(info, geometry, this.placement);


    if (info.text) {
        var workertile = this;
        Shaping.whenLoaded(info['text-font'], function(err) {
            if (err) return done(err);
            workertile.parseTextBucket(features, bucket, info, faces, layer, done);
        });

    } else {
        bucket.start();
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            bucket.addFeature(feature.loadGeometry());

            this.featureTree.insert(feature.bbox(), bucket_name, feature);
        }
        bucket.end();
        setTimeout(done, 0);
    }

    function done(err) {
        callback(err, bucket);
    }
};

WorkerTile.prototype.parseTextBucket = function(features, bucket, info, faces, layer, callback) {
    // TODO: currently hardcoded to use the first font stack.
    // Get the list of shaped labels for this font stack.
    var stack = Object.keys(layer.shaping)[0];
    var shapingDB = layer.shaping[stack];
    if (!shapingDB) return;

    //console.time('placement');
    var shapings = [];

    var fontName = info['text-font'];
    var feature;
    for (var i = 0; i < features.length; i++) {
        feature = features[i];

        var text = feature[info['text-field']];
        if (!text) continue;

        var shaping;
        if (Shaping.fonts[fontName]) {
            // shape client-side
            shaping = Shaping.shape(text, fontName, faces);
        } else {
            // use shaping included in vector tiles
            shaping = shapingDB[text];
        }

        shapings[i] = shaping;
    }

    if (Shaping.fonts[fontName]) {
        Shaping.loadRects(fontName, faces, rectsLoaded);
    } else {
        rectsLoaded();
    }

    function rectsLoaded(err) {
        if (err) return callback(err);

        bucket.start();
        for (var k = 0; k < shapings.length; k++) {
            if (!shapings[k]) continue;
            feature = features[k];
            var lines = feature.loadGeometry();
            bucket.addFeature(lines, faces, shapings[k]);

        }
        bucket.end();

        return callback();
    }
};

var geometryTypeToName = [null, 'point', 'line', 'fill'];

function getGeometry(feature) {
    return feature.loadGeometry();
}

function getType(feature) {
    return geometryTypeToName[feature._type];
}

/*
 * Given tile data, parse raw vertices and data, create a vector
 * tile and parse it into ready-to-render vertices.
 *
 * @param {object} data
 * @param {function} respond
 */
WorkerTile.prototype.parse = function(tile, callback) {
    var self = this;
    var buckets = WorkerTile.buckets;
    var layers = {};

    this.geometry = new Geometry();
    this.placement = new Placement(this.geometry, this.zoom, this.tileSize);
    this.featureTree = new FeatureTree(getGeometry, getType);

    actor.send('add glyphs', {
        id: self.id,
        faces: tile.faces
    }, function(err, rects) {
        if (err) {
            // Stop processing this tile altogether if we failed to add the glyphs.
            return;
        }

        // Merge the rectangles of the glyph positions into the face object
        for (var name in rects) {
            if (!tile.faces[name]) tile.faces[name] = {};
            tile.faces[name].rects = rects[name];
        }

        // Find all layers that we need to pull information from.
        var sourceLayers = {},
            layerName;

        for (var bucket in buckets) {
            layerName = buckets[bucket].filter.layer;
            if (!sourceLayers[layerName]) sourceLayers[layerName] = {};
            sourceLayers[layerName][bucket] = buckets[bucket];
        }

        var remaining = 0;

        for (layerName in sourceLayers) {
            var layer = tile.layers[layerName];
            if (!layer) continue;

            var featuresets = sortFeaturesIntoBuckets(layer, sourceLayers[layerName]);

            // Build an index of font faces used in this layer.
            var faceIndex = [];
            for (var i = 0; i < layer.faces.length; i++) {
                faceIndex[i] = tile.faces[layer.faces[i]];
            }

            // All features are sorted into buckets now. Add them to the geometry
            // object and remember the position/length
            for (var key in featuresets) {
                var features = featuresets[key];
                var info = buckets[key];
                if (!info) {
                    alert("missing bucket information for bucket " + key);
                } else {
                    remaining++;
                    self.parseBucket(key, features, info, faceIndex, layer, layerDone(key));
                }
            }
        }

        function layerDone(key) {
            return function (err, bucket) {
                remaining--;
                if (err) return; // TODO how should this be handled?
                layers[key] = bucket;
                if (!remaining) done();
            };
        }

        function done() {
            // Collect all buffers to mark them as transferable object.
            var buffers = self.geometry.bufferList();

            // Convert buckets to a transferable format
            var bucketJSON = {};
            for (var b in layers) bucketJSON[b] = layers[b].toJSON();

            callback(null, {
                geometry: self.geometry,
                buckets: bucketJSON
            }, buffers);

            // we don't need anything except featureTree at this point, so we mark it for GC
            self.geometry = null;
            self.placement = null;
        }
    });
};
