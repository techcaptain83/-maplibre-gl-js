precision mediump float;

uniform lowp vec4 u_color;
uniform lowp float u_blur;

varying vec2 v_extrude;

void main() {
    float t = smoothstep(1.0 - u_blur, 1.0, length(v_extrude));
    gl_FragColor = u_color * (1.0 - t);
}
