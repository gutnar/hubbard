precision highp float;
uniform vec2 u_roots[4];
uniform vec3 u_colors[4];
varying vec2 v_root;

float sq(float value) {
    return value*value;
}

float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0/2.0) return q;
    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
    return p;
}

vec3 hsv2rgb(float h, float s, float v) {
    vec3 c = vec3(0.0, 0.0, 0.0);

    if (s == 0.0) {
        c[0] = c[1] = c[2] = v;
    } else {
        float q = (v < 0.5) ? (v * (1.0 + s)) : (v + s - v * s);
        float p = 2.0 * v - q;

        c[0] = hue2rgb(p, q, h + 1.0/3.0);
        c[1] = hue2rgb(p, q, h);
        c[2] = hue2rgb(p, q, h - 1.0/3.0);
    }

    return c;
}

void main() {
    // Find closest root
    int closest = -1;
    float closestDist;

    for (int i = 0; i < 4; ++i) {
        float dist = sq(v_root[0] - u_roots[i][0]) + sq(v_root[1] - u_roots[i][1]);

        if (closest == -1 || dist < closestDist) {
            closest = i;
            closestDist = dist;
        }
    }

    // Generate hue based on closest root
    float hue = 1.0/4.0 * float(closest);

    // Generate lighting based on distance to closest root
    float lighting = 0.5 - sqrt(closestDist)/10.0;

    // Discard if not close enough
    if (lighting <= 0.0) {
        discard;
    }

    gl_FragColor = vec4(hsv2rgb(hue, 1.0, lighting), 1.0);
}