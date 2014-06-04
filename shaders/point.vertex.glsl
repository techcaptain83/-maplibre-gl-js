precision mediump float;

#define scale 63.0
#define root2 1.42
#define PI 3.1415926535897932384626

uniform mat4 u_posmatrix;
uniform vec2 u_size;
uniform mat2 u_rotationmatrix;
uniform float u_zoom;
uniform vec2 u_texsize;

attribute vec2 a_pos;
attribute vec2 a_tl;
attribute vec2 a_br;
attribute float a_angle;
attribute float a_minzoom;

varying mat2 v_rotationmatrix;
varying vec2 v_tl;
varying vec2 v_br;

void main(void) {

    gl_Position = u_posmatrix * vec4(a_pos, 0, 1);
    gl_PointSize = u_size.x * root2;

    // if u_zoom < a_minzoom hide this point
    gl_Position.z += 1.0 - step(a_minzoom, u_zoom);

    float angle = a_angle * 2.0 * PI / 256.0;

    v_rotationmatrix = mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    ) * u_rotationmatrix;

    v_tl = a_tl/u_texsize;
    v_br = a_br/u_texsize;
}
