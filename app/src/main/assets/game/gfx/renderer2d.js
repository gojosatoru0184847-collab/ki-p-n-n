export class Renderer2D{
  constructor(canvas, ui){
    this.canvas=canvas;
    this.ctx=canvas.getContext("2d",{alpha:false});
    this.ui=ui;
    this.w=canvas.width; this.h=canvas.height;
    this.isGL=false;
  }
  beginFrame(){
    this.w=this.canvas.width; this.h=this.canvas.height;
    // clear UI overlay
    const u=this.ui;
    u.save(); u.setTransform(1,0,0,1,0,0);
    u.clearRect(0,0,this.canvas.width,this.canvas.height);
    u.restore();
  }
  clear(r=0,g=0,b=0,a=1){
    const ctx=this.ctx;
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle=`rgba(${(r*255)|0},${(g*255)|0},${(b*255)|0},${a})`;
    ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    ctx.restore();
  }
  rect(x,y,w,h,color="#f00", glow=0){
    const ctx=this.ctx;
    ctx.fillStyle=color;
    if(glow>0){
      ctx.save();
      ctx.shadowColor=color;
      ctx.shadowBlur=glow;
      ctx.fillRect(x,y,w,h);
      ctx.restore();
    }else{
      ctx.fillRect(x,y,w,h);
    }
  }
  text(str,x,y,color="#fff",size=16){
    const u=this.ui;
    u.save();
    u.fillStyle=color;
    u.font=`600 ${size}px system-ui,-apple-system,Segoe UI,Roboto,Arial`;
    u.fillText(str,x,y);
    u.restore();
  }
  endFrame(){}
}
