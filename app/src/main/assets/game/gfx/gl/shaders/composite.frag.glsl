#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform float u_bloomStrength;
void main(){
  vec3 s = texture(u_scene, v_uv).rgb;
  vec3 b = texture(u_bloom, v_uv).rgb;
  outColor = vec4(s + b*u_bloomStrength, 1.0);
}
