'use strict';

// var actor = require('../worker/worker.js');
var GlyphTile = require('../worker/glyphtile.js');

module.exports = {
    whenLoaded: ready
};

var stacks = module.exports.stacks = {};
var loading = {};
var onload = {};

// After a required range is loaded, trigger callback if all required
// ranges have been loaded.
function rangeLoaded(fontstack, ranges, callback) {
    return function() {
        var numRanges = ranges.length;

        for (var i = 0; i < ranges.length; i++) {
            if (stacks[fontstack] &&
                stacks[fontstack].ranges[ranges[i]]) {
                numRanges = numRanges - 1;
            }
        }

        // All required glyph ranges have been loaded.
        if (numRanges === 0) callback();
    };
}

function glyphUrl(fontstack, range, template, subdomains) {
    subdomains = subdomains || 'abc';

    var split = range.split("-");
    var min = split[0];
    var max = split[1];

    return template
        .replace('{s}', subdomains[Math.floor((min + max) % subdomains.length)])
        .replace(/(\/v[0-9]*)\/.*$/, '$1/glyph/' + fontstack + '/' + range + '.pbf');
}

function loadGlyphRange(tile, fontstack, range, callback) {
    loading[fontstack] = loading[fontstack] || {};
    loading[fontstack][range] = true;

    onload[fontstack] = onload[fontstack] || {};
    onload[fontstack][range] = [callback];

    var url = glyphUrl(fontstack, range, tile.template);

    new GlyphTile(url, function(err, glyphs) {
        if (!err) {
            stacks[fontstack] = stacks[fontstack] || { 
                ranges: {},
                glyphs: {}
            };

            stacks[fontstack].ranges[range] = true;

            for (var id in glyphs) {
                stacks[fontstack].glyphs[id] = glyphs[id];
            }
        }

        onload[fontstack][range].forEach(function(cb) {
            cb(err);
        });

        delete loading[fontstack][range];
        if (Object.keys(loading[fontstack]).length === 0) delete loading[fontstack];

        delete onload[fontstack][range];
        if (Object.keys(onload[fontstack]).length === 0) delete onload[fontstack];
    });
}

// Callback called when the font has been loaded.
function ready(tile, fontstack, ranges, callback) {
    var loaded = rangeLoaded(fontstack, ranges, callback);
    var range;

    for (var i = 0; i < ranges.length; i++) {
        range = ranges[i];

        if (stacks[fontstack] && stacks[fontstack].ranges[range]) {
            loaded();
        } else if (loading[fontstack] && loading[fontstack][range]) {
            onload[fontstack][range].push(loaded);
        } else {
            loadGlyphRange(tile, fontstack, range, loaded);
        }
    }
}
