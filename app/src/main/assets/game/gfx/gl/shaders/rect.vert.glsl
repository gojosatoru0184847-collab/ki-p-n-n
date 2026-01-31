#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
layout(location=1) in vec4 a_color;
uniform vec2 u_res;
out vec4 v_color;
void main(){
  vec2 p = a_pos / u_res * 2.0 - 1.0;
  // flip Y because canvas pixel coords top-left
  gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
  v_color = a_color;
}
