export class Player{
  constructor(){
    this.x=90; this.y=0;
    this.w=46; this.h=46;
    this.vx=0;
    this.cool=0;
    this.hp=10;
  }
  update(dt, world){
    const t=world.touch;
    // follow finger horizontally a bit for mobile feel
    const targetX = t.down ? (t.x - this.w/2) : this.x;
    this.x += (targetX - this.x) * Math.min(1, dt*10);
    this.x = Math.max(10, Math.min(world.w - this.w - 10, this.x));

    this.y = world.h*0.62 - this.h;

    this.cool = Math.max(0, this.cool - dt);
  }
  canShoot(){ return this.cool<=0; }
  shot(){
    this.cool = 0.14; // fast fire for "high action"
  }
}
