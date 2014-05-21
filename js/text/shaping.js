'use strict';

// var opentype = require('opentype.js');
var glyphToSDF = require('./sdf.js');
var actor = require('../worker/worker.js');
var Loader = require('./loader.js');

module.exports = {
    shape: shape,
    loadRects: loadRects
};

var fonts = Loader.fonts;

var globalFaces = {};

function shape(text, name, faces) {
    if (faces[name] === undefined) {
        if (globalFaces[name] === undefined) {
            globalFaces[name] = { glyphs: {}, rects: {}, missingRects: {}, waitingRects: {} };
        }
        faces[name] = globalFaces[name];
    }

    var font = fonts[name];
    var face = faces[name];
    var shaping = [];

    var x = 0;
    var y = 0;
    var fontSize = 24;
    var fontScale = fontSize / font.unitsPerEm;

    font.forEachGlyph(text, x, y, fontSize, undefined, function(glyph, x) {
        var id = glyph.index;

        if (id === 0) return;

        // sdf for this glyph has not yet been created
        if (!face.rects[id]) face.missingRects[id] = true;

        face.glyphs[id] = {
            id: id,
            glyph: glyph,
            advance: Math.round(glyph.advanceWidth * fontScale),

            left: Math.round(glyph.xMin * fontScale),
            top: Math.ceil(glyph.yMax * fontScale) - fontSize,
            width: Math.round((glyph.xMax - glyph.xMin) * fontScale),
            height: Math.ceil((glyph.yMax - glyph.yMin) * fontScale)

        };

        shaping.push({
            face: name,
            glyph: id,
            x: x,
            y: 0,
        });
    });

    return shaping;
}

function loadRects(name, faces, callback) {
    var face = faces[name];

    var missingGlyphs = {};
    var missingRects = face.missingRects;
    var waitingRects = face.waitingRects;
    var font = fonts[name];
    var fontScale = 24 / font.unitsPerEm;

    // Create sdfs for missing glyphs
    for (var glyphID in missingRects) {
        if (face.rects[glyphID] || waitingRects[glyphID]) continue;
        var glyph = face.glyphs[glyphID];
        var buffer = 3;
        var sdf = glyphToSDF(glyph.glyph, fontScale, 6, buffer);
        glyph.width = sdf.width - 2 * buffer;
        glyph.height = sdf.height - 2 * buffer;
        glyph.bitmap =  new Uint8Array(sdf.buffer);
        missingGlyphs[glyphID] = glyph;
        waitingRects[glyphID] = true;

        // We never check if some other work is rendering these glyphs.
        // This is fine, except it might be slower.
    }

    face.missingRects = {};

    var f = {};
    f[name] = { glyphs: missingGlyphs };

    actor.send('add glyphs', {
        faces: f,
        id: -1
    }, function(err, rects) {
        if (err) return callback(err);
        Loader.setRects(rects);
        callback();
    });
}
