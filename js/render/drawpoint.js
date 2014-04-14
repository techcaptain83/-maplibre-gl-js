'use strict';

var mat2 = require('../lib/glmatrix.js').mat2;

module.exports = function drawPoint(gl, painter, bucket, layerStyle, params, imageSprite) {

    var imagePos = imageSprite && imageSprite.getPosition(layerStyle['point-image']),
        begin = bucket.indices.pointVertexIndex,
        count = bucket.indices.pointVertexIndexEnd - begin,
        shader = imagePos ? painter.pointShader : painter.dotShader;

    bucket.geometry.pointVertex.bind(gl);

    gl.switchShader(shader, painter.translatedMatrix || painter.tile.posMatrix, painter.tile.exMatrix);
    gl.uniform4fv(shader.u_color, layerStyle['point-color'] || [0, 0, 0, 0]);

    if (!imagePos) {
        var diameter = (layerStyle['point-radius'] * 2.0 || 8.0) * window.devicePixelRatio;
        gl.uniform1f(shader.u_size, diameter);
        gl.uniform1f(shader.u_blur, (layerStyle['point-blur'] || 1.5) / diameter);

        gl.vertexAttribPointer(shader.a_pos, 4, gl.SHORT, false, 8, 0);

        gl.drawArrays(gl.POINTS, begin, count);

    } else {
        gl.uniform1i(shader.u_invert, layerStyle['point-invert']);
        gl.uniform2fv(shader.u_size, imagePos.size);
        gl.uniform2fv(shader.u_tl, imagePos.tl);
        gl.uniform2fv(shader.u_br, imagePos.br);
        gl.uniform1f(shader.u_zoom, (painter.transform.zoom - params.z) * 10.0);

        var rotate = layerStyle['point-alignment'] && layerStyle['point-alignment'] !== 'screen';

        var rotationMatrix = rotate ? mat2.clone(painter.tile.rotationMatrix) : mat2.create();
        if (layerStyle['point-rotate']) {
            mat2.rotate(rotationMatrix, rotationMatrix, layerStyle['point-rotate']);
        }
        gl.uniformMatrix2fv(shader.u_rotationmatrix, false, rotationMatrix);

        // if icons are drawn rotated, or of the map is rotating use linear filtering for textures
        imageSprite.bind(gl, rotate || params.rotating || params.zooming);

        gl.vertexAttribPointer(shader.a_pos, 4, gl.SHORT, false, 8, 0);
        gl.vertexAttribPointer(shader.a_minzoom, 1, gl.BYTE, false, 8, 4);
        gl.vertexAttribPointer(shader.a_angle, 1, gl.BYTE, false, 8, 5);

        gl.drawArrays(gl.POINTS, begin, count);
    }
};
