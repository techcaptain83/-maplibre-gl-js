'use strict';

// Should be idempotent.

var ref = require('mapbox-gl-style-spec/reference/v6');

function eachLayer(layer, callback) {
    for (var k in layer.layers) {
        callback(layer.layers[k]);
        eachLayer(layer.layers[k], callback);
    }
}

function eachPaint(layer, callback) {
    for (var k in layer) {
        if (k.indexOf('paint') === 0) {
            callback(layer[k], k);
        }
    }
}

module.exports = function(style) {
    style.version = 6;

    eachLayer(style, function (layer) {
        rename(layer, 'render', 'layout');

        for (var k in layer) {
            if (k.indexOf('style') === 0) {
                rename(layer, k, k.replace(/^style/, 'paint'));
            }
        }

        eachPaint(layer, function(paint) {
            if (paint['line-offset']) {
                var w = paint['line-width'] ? paint['line-width'] : ref.class_line['line-width'].default;
                if (typeof w === 'string') w = style.constants[w];

                if (w && !w.stops) {
                    if (typeof paint['line-offset'] === 'number') {
                        paint['line-offset'] = paint['line-offset'] - w;
                    } else if (paint['line-offset'].stops) {
                        var stops = paint['line-offset'].stops;
                        for (var s in paint['line-offset'].stops) {
                            stops[s][1] = stops[s][1] - w;
                        }
                    }
                }
            }
            rename(paint, 'line-offset', 'line-gap-width');
        });

        if (layer.layout) {
            rename(layer.layout, 'text-horizontal-align', 'text-anchor');
            rename(layer.layout, 'text-vertical-align', 'text-anchor');
        }

        rename(layer, 'min-zoom', 'minzoom');
        rename(layer, 'max-zoom', 'maxzoom');

        if (layer.filter && !Array.isArray(layer.filter)) {
            layer.filter = require('./v6-filter')(layer.filter);
        }
    });

    return style;
};

function rename(o, from, to) {
    if (from in o) {
        o[to] = o[from];
        delete o[from];
    }
}
