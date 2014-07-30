'use strict';

var mat3 = require('../lib/glmatrix.js').mat3;

module.exports = drawBackground;

function drawBackground(gl, painter, bucket, layerStyle, posMatrix, params, imageSprite) {
    var color = layerStyle['background-color'];
    var image = layerStyle['background-image'];
    var opacity = layerStyle['background-opacity'] || 1;
    var shader;

    if (image) {
        // Draw texture fill
        var imagePos = imageSprite.getPosition(image, true);
        if (!imagePos) return;

        shader = painter.patternShader;
        gl.switchShader(shader, posMatrix);
        gl.uniform1i(shader.u_image, 0);
        gl.uniform2fv(shader.u_pattern_tl, imagePos.tl);
        gl.uniform2fv(shader.u_pattern_br, imagePos.br);
        gl.uniform1f(shader.u_mix, painter.transform.zoomFraction);
        gl.uniform1f(shader.u_opacity, opacity);

        var transform = painter.transform;
        var size = imagePos.size;
        var center = transform.locationCoordinate(transform.center);
        var scale = 1 / Math.pow(2, transform.zoomFraction);
        var matrix = mat3.create();

        mat3.scale(matrix, matrix, [1 / size[0], 1 / size[1], 1]);
        mat3.translate(matrix, matrix, [
            (center.column * transform.tileSize) % size[0],
            (center.row    * transform.tileSize) % size[1],
            0
        ]);
        mat3.rotate(matrix, matrix, -transform.angle);
        mat3.scale(matrix, matrix, [
            scale * transform.width  / 2,
           -scale * transform.height / 2,
            1
        ]);

        gl.uniformMatrix3fv(shader.u_patternmatrix, false, matrix);

        imageSprite.bind(gl, true);

    } else {
        // Draw filling rectangle.
        shader = painter.fillShader;
        gl.switchShader(shader, params.padded || posMatrix);
        gl.uniform4fv(shader.u_color, color);
    }

    gl.disable(gl.STENCIL_TEST);
    gl.bindBuffer(gl.ARRAY_BUFFER, painter.backgroundBuffer);
    gl.vertexAttribPointer(shader.a_pos, painter.backgroundBuffer.itemSize, gl.SHORT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, painter.backgroundBuffer.itemCount);
    gl.enable(gl.STENCIL_TEST);

    gl.stencilMask(0x00);
    gl.stencilFunc(gl.EQUAL, 0x80, 0x80);
}
