export class Touch{
  constructor(el){
    this.down=false; this.x=0; this.y=0;
    const on=(e)=>{
      const t=(e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      if(!t) return;
      const r=el.getBoundingClientRect();
      this.x=(t.clientX-r.left)*(el.width/r.width);
      this.y=(t.clientY-r.top)*(el.height/r.height);
    };
    el.addEventListener("touchstart",(e)=>{this.down=true; on(e);},{passive:true});
    el.addEventListener("touchmove",(e)=>{on(e);},{passive:true});
    el.addEventListener("touchend",()=>{this.down=false;},{passive:true});
  }
}
