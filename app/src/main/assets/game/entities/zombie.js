export class Zombie{
  constructor(x,y){
    this.x=x; this.y=y;
    this.w=42; this.h=56;
    this.vx=-(50+Math.random()*80);
    this.hp=3;
  }
  update(dt, world){
    this.x += this.vx*dt;
  }
  hit(dmg=1){
    this.hp-=dmg;
    return this.hp<=0;
  }
}
