precision mediump float;

uniform float u_brightness_low;
uniform float u_brightness_high;
uniform float u_spin;
uniform float u_saturation;
uniform float u_contrast;
uniform float u_mix;
uniform sampler2D u_image0;
uniform sampler2D u_image1;
varying vec2 v_pos0;
varying vec2 v_pos1;

void main() {

    vec3 u_high_vec = vec3(u_brightness_low, u_brightness_low, u_brightness_low);
    vec3 u_low_vec = vec3(u_brightness_high, u_brightness_high, u_brightness_high);

    vec4 color0 = texture2D(u_image0, v_pos0);
    vec4 color1 = texture2D(u_image1, v_pos1);
    vec4 color = mix(color1, color0, u_mix);

    float angle = u_spin * 3.14159265;
    float s = sin(angle), c = cos(angle);
    vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
    float len = length(color.rgb);

    color.rgb = vec3(
        dot(color.rgb, weights.xyz),
        dot(color.rgb, weights.zxy),
        dot(color.rgb, weights.yzx));

    float average = (color.r + color.g + color.b) / 3.0;

    if (u_saturation > 0.0) {
        color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - u_saturation));
    } else {
        color.rgb += (average - color.rgb) * (-u_saturation);
    }

    if (u_contrast > 0.0) {
        color.rgb = (color.rgb - 0.5) / (1.0 - u_contrast) + 0.5;
    } else {
        color.rgb = (color.rgb - 0.5) * (1.0 + u_contrast) + 0.5;
    }

    gl_FragColor = vec4(
        mix(
            u_high_vec,
            u_low_vec,
            color.rgb
        ), color.a);
}
