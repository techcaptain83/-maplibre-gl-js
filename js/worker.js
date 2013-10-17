importScripts('/gl/js/lib/underscore.js',
              '/gl/js/protobuf.js',
              '/gl/js/util.js',
              '/gl/js/vectortile.js',
              '/gl/js/fillbuffer.js',
              '/gl/js/vertexbuffer.js',
              '/gl/js/geometry.js');

addEventListener('message', function(e) {
    var data = e.data;
    var callback;
    if (typeof data.id !== 'undefined') {
        var id = data.id;
        callback = function(err, data, buffers) {
            postMessage({
                type: '<response>',
                id: id,
                error: err ? String(err) : null,
                data: data
            }, buffers);
        };
    }

    self[data.type](data.data, callback);
}, false);


function send(type, error, data, buffers) {
    postMessage({ type: type, error: error, data: data }, buffers);
}

// Debug
if (typeof console === 'undefined') {
    console = {};
    console.log = console.warn = function() {
        send('debug', null, _.toArray(arguments));
    };
}

if (typeof alert === 'undefined') {
    alert = function() {
        send('alert', null, _.toArray(arguments));
    };
}


// Stores the mapping of tile layer => bucket
var mappings = {};

// Stores tiles that are currently loading.
var loading = {};


/*
 * Updates the layer => bucket mappings.
 *
 * @param {Mappings} data
 */
self['set mapping'] = function(data) {
    mappings = data;
};


/*
 * Load and parse a tile at `url`, and call `callback` with
 * (err, response)
 *
 * @param {string} url
 * @param {function} callback
 */
self['load tile'] = function(url, callback) {
    loading[url] = loadBuffer(url, function(err, buffer) {
        delete loading[url];
        if (err) {
            callback(err);
        } else {
            parseTile(buffer, callback);
        }
    });
};

/*
 * Abort the request keyed under `url`
 *
 * @param {string} url
 */
self['abort tile'] = function(url) {
    if (loading[url]) {
        loading[url].abort();
        delete loading[url];
    }
};

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
    xhr.onload = function(e) {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            callback(null, xhr.response);
        } else {
            callback(xhr.statusText);
        }
    };
    xhr.send();
    return xhr;
}

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
    for (var key in mapping.sort) {
        buckets[key] = [];
    }

    for (var i = 0; i < layer.length; i++) {
        var feature = layer.feature(i);
        for (key in mapping.sort) {
            if (mapping.sort[key] === true ||
                mapping.sort[key].indexOf(feature[mapping.field]) >= 0) {
                buckets[key].push(feature);
                break;
            }
        }
    }

    return buckets;
}

/*
 * Given tile data, parse raw vertices and data, create a vector
 * tile and parse it into ready-to-render vertices.
 *
 * @param {object} data
 * @param {function} respond
 */
function parseTile(data, callback) {
    var tile = new VectorTile(new Protobuf(new Uint8Array(data)));
    var layers = {};
    var geometry = new Geometry();

    for (var k = 0; k < mappings.length; k++) {
        var mapping = mappings[k];
        var layer = tile.layers[mapping.layer];
        if (!layer) continue;

        var buckets = sortFeaturesIntoBuckets(layer, mapping);

        // All features are sorted into buckets now. Add them to the geometry
        // object and remember the position/length
        for (var key in buckets) {
            var bucket = layers[key] = {
                buffer: geometry.bufferIndex,
                vertexIndex: geometry.vertex.index,
                fillIndex: geometry.fill.index
            };
            if (mapping.label) {
                bucket.labels = [];
            }

            // Add all the features to the geometry
            var features = buckets[key];
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];

                var lines = feature.loadGeometry();
                for (var j = 0; j < lines.length; j++) {
                    // TODO: respect join and cap styles
                    if (mapping.markers) {
                        geometry.addMarkers(lines[j], mapping.spacing || 100);
                    } else {
                        geometry.addLine(lines[j], mapping.linejoin, mapping.linecap,
                                mapping.miterLimit, mapping.roundLimit);
                    }


                    if (mapping.label) {
                        bucket.labels.push({ text: feature[mapping.label], vertices: lines[j] });
                    }
                }
            }

            bucket.bufferEnd = geometry.bufferIndex;
            bucket.vertexIndexEnd = geometry.vertex.index;
            bucket.fillIndexEnd = geometry.fill.index;
            bucket.shaping = layer.shaping;
            bucket.faces = layer._faces;
        }
    }

    // Collect all buffers to mark them as transferable object.
    var buffers = [ data ];
    for (var l = 0; l < geometry.buffers.length; l++) {
        buffers.push(geometry.buffers[l].fill.array, geometry.buffers[l].vertex.array);
    }

    callback(null, {
        geometry: geometry,
        layers: layers,
        faces: tile.faces
    }, buffers);
}
