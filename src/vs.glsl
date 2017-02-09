precision highp float;
attribute vec2 a_position;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_scale;
varying vec2 v_root;

float sq(float value) {
    return value*value;
}

float cb(float value) {
    return value*value*value;
}

void main() {
    // Find point location in clip space
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;

    // Set origin to top-left
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    // Point size
    gl_PointSize = 1.0;

    // Convert pixel location to point
    vec2 point = (a_position - u_offset) / u_scale;

    // Iterate
    v_root = point;

    for (int i = 0; i < ITERATIONS; ++i) {
        v_root[0] = X_ITERATION;
        v_root[1] = Y_ITERATION;
    }
}
