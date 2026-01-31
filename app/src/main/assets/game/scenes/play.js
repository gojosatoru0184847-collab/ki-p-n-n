import {Player} from "../entities/player.js";
import {Zombie} from "../entities/zombie.js";
import {Bullet} from "../entities/bullet.js";
import {clear, rect, text} from "../gfx/draw.js";

export class PlayScene{
  constructor(state){
    this.state=state;
    this.player=new Player();
    this.zombies=[];
    this.bullets=[];
    this.t=0;
    this.spawnT=0;
  }

  update(dt, world){
    this.t += dt;

    this.player.update(dt, world);

    // autofire when holding touch
    const t=world.touch;
    if(t.down && this.player.canShoot()){
      this.player.shot();
      const bx=this.player.x+this.player.w-2;
      const by=this.player.y+this.player.h*0.55;
      this.bullets.push(new Bullet(bx, by, 1));
      // muzzle flash
      if(world.renderer && world.renderer.particleBurst){
        world.renderer.particleBurst(bx+8, by, "#ffcc66", 10, 220);
      }
    }

    // spawn zombies
    this.spawnT -= dt;
    if(this.spawnT<=0){
      this.spawnT = 0.55 + Math.random()*0.55;
      const zx = world.w + 40 + Math.random()*120;
      const zy = world.h*0.62 - 56;
      this.zombies.push(new Zombie(zx, zy));
    }

    // update bullets
    for(let i=this.bullets.length-1;i>=0;i--){
      const b=this.bullets[i];
      b.update(dt);
      if(b.life<=0 || b.x>world.w+80) this.bullets.splice(i,1);
    }

    // update zombies
    for(let i=this.zombies.length-1;i>=0;i--){
      const z=this.zombies[i];
      z.update(dt, world);
      if(z.x<-120) this.zombies.splice(i,1);
    }

    // collisions
    for(let bi=this.bullets.length-1; bi>=0; bi--){
      const b=this.bullets[bi];
      for(let zi=this.zombies.length-1; zi>=0; zi--){
        const z=this.zombies[zi];
        if(aabb(b,z)){
          this.bullets.splice(bi,1);
          const dead=z.hit(1);
          // hit spark
          if(world.renderer && world.renderer.particleBurst){
            world.renderer.particleBurst(b.x, b.y, dead ? "#52ffa8" : "#ffd24d", dead?30:14, dead?260:220);
          }
          if(dead){
            this.zombies.splice(zi,1);
            this.state.gold += 3;
          }
          break;
        }
      }
    }

    // particles simulation if GL renderer
    if(world.renderer && world.renderer.updateParticles){
      world.renderer.updateParticles(dt);
    }
  }

  render(renderer, world){
    // allow update() to access renderer without circular imports
    world.renderer = renderer;

    // background
    if(renderer.parallax) renderer.parallax(this.t, world.w, world.h);
    else clear(renderer, world.w, world.h);

    // ground glow line
    rect(renderer, 0, world.h*0.62, world.w, 4, "#2a2a36", 0);

    // zombies
    for(const z of this.zombies){
      rect(renderer, z.x, z.y, z.w, z.h, "#7cff7c", 22);
      // eyes
      rect(renderer, z.x+10, z.y+14, 3, 3, "#ff6b7a", 18);
      rect(renderer, z.x+22, z.y+14, 3, 3, "#ff6b7a", 18);
    }

    // player
    rect(renderer, this.player.x, this.player.y, this.player.w, this.player.h, "#ff3333", 26);
    // aura
    rect(renderer, this.player.x-6, this.player.y-6, this.player.w+12, this.player.h+12, "#7c7cff", 46);

    // bullets
    for(const b of this.bullets){
      rect(renderer, b.x, b.y, b.w, b.h, "#ffcc66", 24);
    }

    // UI
    text(renderer, "Gold: "+this.state.gold, 18, 32, "#ffffff", 16);
    text(renderer, "Graphics: "+(renderer.quality||"high"), 18, 54, "#a6a6c7", 13);
    text(renderer, "Hold to shoot", 18, 76, "#a6a6c7", 13);
  }
}

function aabb(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}
