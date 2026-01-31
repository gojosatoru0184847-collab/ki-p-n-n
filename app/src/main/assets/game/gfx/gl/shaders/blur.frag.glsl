#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_tex;
uniform vec2 u_dir;
void main(){
  vec2 texel = 1.0/vec2(textureSize(u_tex,0));
  vec3 c = texture(u_tex, v_uv).rgb * 0.227027;
  c += texture(u_tex, v_uv + u_dir*texel*1.384615).rgb * 0.316216;
  c += texture(u_tex, v_uv - u_dir*texel*1.384615).rgb * 0.316216;
  c += texture(u_tex, v_uv + u_dir*texel*3.230769).rgb * 0.070270;
  c += texture(u_tex, v_uv - u_dir*texel*3.230769).rgb * 0.070270;
  outColor = vec4(c,1.0);
}
