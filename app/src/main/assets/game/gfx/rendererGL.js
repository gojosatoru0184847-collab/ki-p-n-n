function compile(gl, type, src){
  const s=gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
    const info=gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(info||"shader compile failed");
  }
  return s;
}
function program(gl, vsSrc, fsSrc){
  const p=gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
    const info=gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error(info||"program link failed");
  }
  return p;
}
function tex2d(gl, w, h){
  const t=gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

export class RendererGL{
  constructor(canvas, ui, quality="high"){
    this.canvas=canvas;
    this.ui=ui;
    this.quality=quality;
    this.isGL=true;

    const gl=canvas.getContext("webgl2",{alpha:false, antialias:quality!=="low", depth:false, stencil:false, preserveDrawingBuffer:false});
    if(!gl) throw new Error("WebGL2 not supported");
    this.gl=gl;

    // --- Shaders (inline) ---
    this.vsRect = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
layout(location=1) in vec4 a_color;
uniform vec2 u_res;
out vec4 v_color;
void main(){
  vec2 p = a_pos / u_res * 2.0 - 1.0;
  gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
  v_color = a_color;
}`;
    this.fsRect = `#version 300 es
precision highp float;
in vec4 v_color;
out vec4 outColor;
void main(){ outColor = v_color; }`;

    this.vsPost = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main(){ v_uv=a_pos*0.5+0.5; gl_Position=vec4(a_pos,0.0,1.0);} `;
    this.fsBlur = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_tex;
uniform vec2 u_dir;
void main(){
  vec2 texel=1.0/vec2(textureSize(u_tex,0));
  vec3 c=texture(u_tex,v_uv).rgb*0.227027;
  c+=texture(u_tex,v_uv+u_dir*texel*1.384615).rgb*0.316216;
  c+=texture(u_tex,v_uv-u_dir*texel*1.384615).rgb*0.316216;
  c+=texture(u_tex,v_uv+u_dir*texel*3.230769).rgb*0.070270;
  c+=texture(u_tex,v_uv-u_dir*texel*3.230769).rgb*0.070270;
  outColor=vec4(c,1.0);
}`;
    this.fsComposite = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform float u_bloomStrength;
void main(){
  vec3 s=texture(u_scene,v_uv).rgb;
  vec3 b=texture(u_bloom,v_uv).rgb;
  outColor=vec4(s + b*u_bloomStrength, 1.0);
}`;

    this.progRect = program(gl, this.vsRect, this.fsRect);
    this.uRes = gl.getUniformLocation(this.progRect, "u_res");

    this.progBlur = program(gl, this.vsPost, this.fsBlur);
    this.uBlurTex = gl.getUniformLocation(this.progBlur, "u_tex");
    this.uBlurDir = gl.getUniformLocation(this.progBlur, "u_dir");

    this.progComp = program(gl, this.vsPost, this.fsComposite);
    this.uScene = gl.getUniformLocation(this.progComp, "u_scene");
    this.uBloom = gl.getUniformLocation(this.progComp, "u_bloom");
    this.uBloomStrength = gl.getUniformLocation(this.progComp, "u_bloomStrength");

    // geometry for rects (dynamic)
    this.vbo=gl.createBuffer();
    this.vao=gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 8);
    gl.bindVertexArray(null);

    // fullscreen quad
    this.fsVbo=gl.createBuffer();
    this.fsVao=gl.createVertexArray();
    gl.bindVertexArray(this.fsVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.fsVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.bindVertexArray(null);

    this._allocTargets();
    this._particles=[];
  }

  _allocTargets(){
    const gl=this.gl;
    const w=this.canvas.width, h=this.canvas.height;
    this.w=w; this.h=h;

    // Scene target (full res)
    this.sceneTex=tex2d(gl,w,h);
    this.sceneFbo=gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.sceneFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.sceneTex, 0);

    // Bloom chain (half res)
    const bw=Math.max(1, (w/2)|0), bh=Math.max(1,(h/2)|0);
    this.bw=bw; this.bh=bh;

    this.bloomA=tex2d(gl,bw,bh);
    this.bloomB=tex2d(gl,bw,bh);
    this.bloomFboA=gl.createFramebuffer();
    this.bloomFboB=gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.bloomFboA);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.bloomA, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.bloomFboB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.bloomB, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  }

  beginFrame(){
    const gl=this.gl;
    if(this.w!==this.canvas.width || this.h!==this.canvas.height){
      // re-alloc on resize / dpr changes
      this._allocTargets();
    }

    // UI overlay clear
    const u=this.ui;
    u.save(); u.setTransform(1,0,0,1,0,0);
    u.clearRect(0,0,this.canvas.width,this.canvas.height);
    u.restore();

    // Scene draw target
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFbo);
    gl.viewport(0,0,this.w,this.h);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  clear(r=0.02,g=0.02,b=0.05,a=1){
    const gl=this.gl;
    gl.clearColor(r,g,b,a);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  // glowing rect: draw base + additive glow pass
  rect(x,y,w,h,color="#ff3333", glow=18){
    const gl=this.gl;
    const c = this._parse(color);
    // base
    this._drawQuad(x,y,w,h, c[0],c[1],c[2],1.0);
    if(glow>0 && this.quality!=="low"){
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive
      const gA = Math.min(0.9, 0.14 + glow/120);
      // 2-3 expanded quads for "soft" glow
      this._drawQuad(x-2,y-2,w+4,h+4, c[0],c[1],c[2], gA*0.55);
      this._drawQuad(x-6,y-6,w+12,h+12, c[0],c[1],c[2], gA*0.25);
      if(this.quality==="high") this._drawQuad(x-12,y-12,w+24,h+24, c[0],c[1],c[2], gA*0.12);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
  }

  particleBurst(x,y,color="#ffd24d", count=24, speed=220){
    if(this.quality==="low") return;
    const c=this._parse(color);
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2;
      const v=(0.35+Math.random()*0.65)*speed;
      this._particles.push({
        x,y, vx:Math.cos(a)*v, vy:Math.sin(a)*v,
        life:0.6+Math.random()*0.55,
        r:c[0],g:c[1],b:c[2],
        size:2+Math.random()*3
      });
    }
  }

  updateParticles(dt){
    const p=this._particles;
    for(let i=p.length-1;i>=0;i--){
      const it=p[i];
      it.life-=dt;
      if(it.life<=0){ p.splice(i,1); continue; }
      it.vy += 520*dt;
      it.x += it.vx*dt;
      it.y += it.vy*dt;
    }
  }

  drawParticles(){
    const gl=this.gl;
    if(this._particles.length===0) return;
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive
    for(const it of this._particles){
      const a=Math.max(0, Math.min(1, it.life/1.1));
      this._drawQuad(it.x, it.y, it.size, it.size, it.r,it.g,it.b, 0.9*a);
    }
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  parallax(t, w, h){
    // Procedural "city" background with parallax layers
    const baseY = h*0.72;
    const scroll = t*60;
    // far haze
    this.rect(0,0,w,h, "#05060f", 0);
    // moon glow
    if(this.quality==="high") this.rect(w*0.72, h*0.16, 26,26, "#7c7cff", 80);
    // layers of buildings
    const layers = this.quality==="high" ? 4 : 3;
    for(let L=0; L<layers; L++){
      const depth= (L+1)/layers;
      const y = baseY + (L*28);
      const speed = 0.20 + 0.18*L;
      const step = 60 - L*8;
      for(let x=-step; x<w+step; x+=step){
        const bx = (x - (scroll*speed)%step);
        const bh = 40 + ((x*97 + L*1337) % 65);
        const bw = 26 + ((x*31 + L*77) % 22);
        const col = (L===layers-1) ? "#0d1022" : (L===0 ? "#0a0b1a" : "#0b0d1d");
        this.rect(bx, y-bh, bw, bh, col, 0);
        if(this.quality==="high" && L===layers-1 && ((x+L*9)%3===0)){
          // window lights (tiny glow)
          this.rect(bx+6, y-bh+10, 2, 2, "#ffd24d", 14);
          this.rect(bx+12, y-bh+18, 2, 2, "#ffcc66", 14);
        }
      }
    }
  }

  text(str,x,y,color="#fff",size=16){
    const u=this.ui;
    u.save();
    u.fillStyle=color;
    u.font=`700 ${size}px system-ui,-apple-system,Segoe UI,Roboto,Arial`;
    u.fillText(str,x,y);
    u.restore();
  }

  endFrame(){
    const gl=this.gl;

    // render particles into scene
    this.drawParticles();

    // If bloom disabled (low), just blit
    const doBloom = (this.quality!=="low");
    if(doBloom){
      // Downsample scene -> bloomA
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFboA);
      gl.viewport(0,0,this.bw,this.bh);
      this._drawFullscreen(this.progComp, {scene:this.sceneTex, bloom:this.sceneTex, bloomStrength:0.0}); // copy pass

      // Blur horizontal bloomA -> bloomB
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFboB);
      gl.viewport(0,0,this.bw,this.bh);
      this._blur(this.bloomA, 1.0, 0.0);

      // Blur vertical bloomB -> bloomA
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFboA);
      gl.viewport(0,0,this.bw,this.bh);
      this._blur(this.bloomB, 0.0, 1.0);

      // Composite to screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0,0,this.w,this.h);
      gl.disable(gl.BLEND);
      const strength = (this.quality==="high") ? 0.85 : 0.55;
      this._composite(this.sceneTex, this.bloomA, strength);
      gl.enable(gl.BLEND);
    }else{
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0,0,this.w,this.h);
      gl.disable(gl.BLEND);
      this._composite(this.sceneTex, this.sceneTex, 0.0);
      gl.enable(gl.BLEND);
    }
  }

  _blur(tex, dx, dy){
    const gl=this.gl;
    gl.useProgram(this.progBlur);
    gl.bindVertexArray(this.fsVao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(this.uBlurTex, 0);
    gl.uniform2f(this.uBlurDir, dx, dy);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  _composite(sceneTex, bloomTex, strength){
    const gl=this.gl;
    gl.useProgram(this.progComp);
    gl.bindVertexArray(this.fsVao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.uniform1i(this.uScene, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, bloomTex);
    gl.uniform1i(this.uBloom, 1);
    gl.uniform1f(this.uBloomStrength, strength);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  _drawFullscreen(prog, {scene, bloom, bloomStrength}){
    const gl=this.gl;
    gl.useProgram(prog);
    gl.bindVertexArray(this.fsVao);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, scene);
    gl.uniform1i(this.uScene, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bloom);
    gl.uniform1i(this.uBloom, 1);
    gl.uniform1f(this.uBloomStrength, bloomStrength);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  _drawQuad(x,y,w,h,r,g,b,a){
    const gl=this.gl;
    gl.useProgram(this.progRect);
    gl.bindVertexArray(this.vao);
    gl.uniform2f(this.uRes, this.w, this.h);

    // 2 triangles, each vertex: pos(x,y) color(r,g,b,a)
    const x0=x, y0=y, x1=x+w, y1=y+h;
    const v = new Float32Array([
      x0,y0, r,g,b,a,
      x1,y0, r,g,b,a,
      x0,y1, r,g,b,a,
      x0,y1, r,g,b,a,
      x1,y0, r,g,b,a,
      x1,y1, r,g,b,a,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  _parse(hex){
    // #rgb or #rrggbb
    if(hex[0]==="#"){
      if(hex.length===4){
        const r=parseInt(hex[1]+hex[1],16)/255;
        const g=parseInt(hex[2]+hex[2],16)/255;
        const b=parseInt(hex[3]+hex[3],16)/255;
        return [r,g,b];
      }
      if(hex.length===7){
        const r=parseInt(hex.slice(1,3),16)/255;
        const g=parseInt(hex.slice(3,5),16)/255;
        const b=parseInt(hex.slice(5,7),16)/255;
        return [r,g,b];
      }
    }
    return [1,1,1];
  }
}
