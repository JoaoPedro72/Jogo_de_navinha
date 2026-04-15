#version 300 es
precision mediump float;

in vec2 vUV;
uniform sampler2D uTexture;
uniform vec2 uOffsetTex; // posição do sprite
uniform vec2 uScale;  // tamanho do sprite

out vec4 outColor;

void main() {
    vec2 uv = vUV * uScale + uOffsetTex;
    outColor = texture(uTexture, uv);
}