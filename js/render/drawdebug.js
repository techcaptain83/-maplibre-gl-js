'use strict';

var textVertices = require('../lib/debug_text.js');

module.exports = drawDebug;

function drawDebug(gl, painter, tile, stats, params) {
    // Blend to the front, not the back.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.switchShader(painter.debugShader, painter.posMatrix, painter.exMatrix);

    // draw bounding rectangle
    gl.bindBuffer(gl.ARRAY_BUFFER, painter.debugBuffer);
    gl.vertexAttribPointer(painter.debugShader.a_pos, painter.bufferProperties.debugItemSize, gl.SHORT, false, 0, 0);
    gl.uniform4f(painter.debugShader.u_color, 1, 0, 0, 1);
    gl.lineWidth(4);
    gl.drawArrays(gl.LINE_STRIP, 0, painter.bufferProperties.debugNumItems);

    // draw tile coordinate
    var coord = params.z + '/' + params.x + '/' + params.y;

    var vertices = [];
    vertices = vertices.concat(textVertices(coord, 50, 200, 5));
    var top = 400;
    for (var name in stats) {
        if (stats[name].lines || stats[name].triangles) {
            var text = name + ': ';
            if (stats[name].lines) text += ' ' + stats[name].lines + ' lines';
            if (stats[name].triangles) text += ' ' + stats[name].triangles + ' tris';
            vertices = vertices.concat(textVertices(text, 50, top, 3));
            top += 100;
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, painter.textBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Int16Array(vertices), gl.STREAM_DRAW);
    gl.vertexAttribPointer(painter.debugShader.a_pos, painter.bufferProperties.textItemSize, gl.SHORT, false, 0, 0);
    gl.lineWidth(8 * window.devicePixelRatio);
    gl.uniform4f(painter.debugShader.u_color, 1, 1, 1, 1);
    gl.drawArrays(gl.LINES, 0, vertices.length / painter.bufferProperties.textItemSize);
    gl.lineWidth(2 * window.devicePixelRatio);
    gl.uniform4f(painter.debugShader.u_color, 0, 0, 0, 1);
    gl.drawArrays(gl.LINES, 0, vertices.length / painter.bufferProperties.textItemSize);

    // Revert blending mode to blend to the back.
    gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
}
