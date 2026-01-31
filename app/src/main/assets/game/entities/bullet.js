export class Bullet{
  constructor(x,y,dir=1){
    this.x=x; this.y=y;
    this.w=10; this.h=4;
    this.vx=dir*(420+Math.random()*80);
    this.life=1.4;
  }
  update(dt){
    this.life-=dt;
    this.x += this.vx*dt;
  }
}
