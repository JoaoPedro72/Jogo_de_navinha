#version 300 es
in vec2 position;
in vec2 uv;

uniform vec2 uRedimensionamento;
uniform vec2 uOffset;
uniform float angulo;
uniform vec2 uCentro; // 👈 novo

out vec2 vUV;

void main() {
    float c = cos(angulo);
    float s = sin(angulo);

    mat2 rot = mat2(
        c, -s,
        s,  c
    );

    // Move para origem → rotaciona → volta
    vec2 pos = position - uCentro;
    pos = rot * pos;
    pos = pos + uCentro;

    pos = (pos + uOffset) * uRedimensionamento - 1.0;

    vUV = uv;
    gl_Position = vec4(pos, 0.0, 1.0);
}