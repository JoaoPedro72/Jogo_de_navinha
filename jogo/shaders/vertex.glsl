#version 300 es
in vec2 position;
in vec2 uv;

uniform vec2 uRedimensionamento;
uniform vec2 uOffset;
uniform float angulo;

out vec2 vUV;

void main() {
    float c = cos(angulo);
    float s = sin(angulo);

    mat2 rot = mat2(
        c, -s,
        s,  c
    );

    vec2 pos = ((rot * position) + uOffset) * uRedimensionamento - 1.0;

    vUV = uv; // passa pro fragment
    gl_Position = vec4(pos, 0.0, 1.0);
}