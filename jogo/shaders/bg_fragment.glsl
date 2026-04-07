#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898,78.233))) * 43758.5453123);
}

float layer(vec2 uv, float scale, float speed, float density, float blinkOn) {
    uv.y = fract(uv.y + u_time * speed);
    vec2 grid = floor(uv * scale);

    float r = random(grid);
    float star = step(density, r);

    float phase = random(grid + 1.0) * 6.28318;
    float freq  = mix(2.0, 3.0, random(grid + 2.0));

    float blink = sin(u_time * freq + phase) * 0.5 + 0.5;

    float finalBlink = mix(1.0, blink, blinkOn);

    return star * finalBlink;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    float l1 = layer(uv, 800.0, 0.02, 0.995, 1.0);
    float l2 = layer(uv, 40.0, 0.05, 0.996,0.0);
    float l3 = layer(uv, 20.0, 0.1, 0.99,0.0);

    vec3 color =
        l1 * vec3(0.95, 0.9, 0.86) +
        l2 * vec3(0.97, 0.83, 0.44) +
        l3 * vec3(0.91, 0.56, 0.28);

    outColor = vec4(color, 1.0);
}