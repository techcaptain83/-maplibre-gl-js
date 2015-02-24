'use strict';

var util = require('../../util/util');
var Buffer = require('./buffer');

module.exports = GlyphVertexBuffer;

function GlyphVertexBuffer(buffer) {
    Buffer.call(this, buffer);
}

// Converts the 0..2pi to an int16 range
GlyphVertexBuffer.angleFactor = 128 / Math.PI;

GlyphVertexBuffer.prototype = util.inherit(Buffer, {
    defaultLength: 2048 * 16,
    itemSize: 16,

    add: function(x, y, ox, oy, tx, ty, angle, minzoom, maxzoom, labelminzoom) {
        var pos = this.pos,
            pos2 = pos / 2,
            angleFactor = GlyphVertexBuffer.angleFactor;

        this.resize();

        this.shorts[pos2 + 0] = x;
        this.shorts[pos2 + 1] = y;
        this.shorts[pos2 + 2] = Math.round(ox * 64); // use 1/64 pixels for placement
        this.shorts[pos2 + 3] = Math.round(oy * 64);

        // a_data1
        this.ubytes[pos + 8] /* tex */ = Math.floor(tx / 4);
        this.ubytes[pos + 9] /* tex */ = Math.floor(ty / 4);
        this.ubytes[pos + 10] /* labelminzoom */ = Math.floor((labelminzoom) * 10);

        // a_data2
        this.ubytes[pos + 12] /* minzoom */ = Math.floor((minzoom) * 10); // 1/10 zoom levels: z16 == 160.
        this.ubytes[pos + 13] /* maxzoom */ = Math.floor(Math.min(maxzoom, 25) * 10); // 1/10 zoom levels: z16 == 160.

        this.pos += this.itemSize;
    },

    bind: function(gl, shader) {
        Buffer.prototype.bind.call(this, gl);

        var stride = this.itemSize;

        gl.vertexAttribPointer(shader.a_pos, 2, gl.SHORT, false, stride, 0);
        gl.vertexAttribPointer(shader.a_offset, 2, gl.SHORT, false, stride, 4);

        gl.vertexAttribPointer(shader.a_data1, 4, gl.UNSIGNED_BYTE, false, stride, 8);
        gl.vertexAttribPointer(shader.a_data2, 2, gl.UNSIGNED_BYTE, false, stride, 12);
    }
});
