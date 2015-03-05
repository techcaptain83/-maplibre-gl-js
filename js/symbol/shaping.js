'use strict';

module.exports = {
    shape: shape
};

function shape(text, name, stacks, maxWidth, lineHeight, horizontalAlign, verticalAlign, justify, spacing, translate) {
    var glyphs = stacks[name].glyphs;
    var glyph;

    var positionedGlyphs = [];
    var shaping = new Shaping(positionedGlyphs, translate[1], translate[1], translate[0], translate[0]);

    var x = translate[0];
    var y = translate[1];
    var codePoint;

    for (var i = 0; i < text.length; i++) {
        codePoint = text.charCodeAt(i);
        glyph = glyphs[codePoint];

        if (codePoint === 0 || !glyph) continue;

        positionedGlyphs.push(new PositionedGlyph(codePoint, x, y, name));

        x += glyph.advance + spacing;
    }

    if (!positionedGlyphs.length) return false;

    linewrap(shaping, glyphs, lineHeight, maxWidth, horizontalAlign, verticalAlign, justify);

    return shaping;
}

var breakable = { 32: true }; // Currently only breaks at regular spaces

function linewrap(shaping, glyphs, lineHeight, maxWidth, horizontalAlign, verticalAlign, justify) {
    var lastSafeBreak = null;

    var lengthBeforeCurrentLine = 0;
    var lineStartIndex = 0;
    var line = 0;

    var maxLineLength = 0;

    var positionedGlyphs = shaping.positionedGlyphs;

    if (maxWidth) {
        for (var i = 0; i < positionedGlyphs.length; i++) {
            var positionedGlyph = positionedGlyphs[i];

            positionedGlyph.x -= lengthBeforeCurrentLine;
            positionedGlyph.y += lineHeight * line;

            if (positionedGlyph.x > maxWidth && lastSafeBreak !== null) {

                var lineLength = positionedGlyphs[lastSafeBreak + 1].x;
                maxLineLength = Math.max(lineLength, maxLineLength);

                for (var k = lastSafeBreak + 1; k <= i; k++) {
                    positionedGlyphs[k].y += lineHeight;
                    positionedGlyphs[k].x -= lineLength;
                }

                if (justify) {
                    justifyLine(positionedGlyphs, glyphs, lineStartIndex, lastSafeBreak - 1, justify);
                }

                lineStartIndex = lastSafeBreak + 1;
                lastSafeBreak = null;
                lengthBeforeCurrentLine += lineLength;
                line++;
            }

            if (breakable[positionedGlyph.codePoint]) {
                lastSafeBreak = i;
            }
        }
    }

    var lastPositionedGlyph = positionedGlyphs[positionedGlyphs.length - 1];
    var lastLineLength = lastPositionedGlyph.x + glyphs[lastPositionedGlyph.codePoint].advance;
    maxLineLength = Math.max(maxLineLength, lastLineLength);

    var height = (line + 1) * lineHeight;

    justifyLine(positionedGlyphs, glyphs, lineStartIndex, positionedGlyphs.length - 1, justify);
    align(positionedGlyphs, justify, horizontalAlign, verticalAlign, maxLineLength, lineHeight, line);

    // Calculate the bounding box
    shaping.top += -verticalAlign * height;
    shaping.bottom = shaping.top + height;
    shaping.left += -horizontalAlign * maxLineLength;
    shaping.right = shaping.left + maxLineLength;
}

function justifyLine(positionedGlyphs, glyphs, start, end, justify) {
    var lastAdvance = glyphs[positionedGlyphs[end].codePoint].advance;
    var lineIndent = (positionedGlyphs[end].x + lastAdvance) * justify;

    for (var j = start; j <= end; j++) {
        positionedGlyphs[j].x -= lineIndent;
    }

}

function align(positionedGlyphs, justify, horizontalAlign, verticalAlign, maxLineLength, lineHeight, line) {
    var shiftX = (justify - horizontalAlign) * maxLineLength;
    var shiftY = (-verticalAlign * (line + 1) + 0.5) * lineHeight;

    for (var j = 0; j < positionedGlyphs.length; j++) {
        positionedGlyphs[j].x += shiftX;
        positionedGlyphs[j].y += shiftY;
    }
}

// The position of a glyph relative to the text's anchor point.
function PositionedGlyph(codePoint, x, y, fontstack) {
    this.codePoint = codePoint;
    this.x = x;
    this.y = y;
    this.fontstack = fontstack;
}

// A collection of positioned glyphs and some metadata
function Shaping(positionedGlyphs, top, bottom, left, right) {
    this.positionedGlyphs = positionedGlyphs;
    this.top = top;
    this.bottom = bottom;
    this.left = left;
    this.right = right;
}
