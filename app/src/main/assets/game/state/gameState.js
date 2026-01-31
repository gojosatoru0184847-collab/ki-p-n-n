import {load, save} from "../core/storage.js";
export class GameState{
  constructor(){
    const s=load();
    this.gold = Number(s.gold||0);
    this.hp = Number(s.hp||10);
  }
  addGold(n){ this.gold += n; this.persist(); }
  persist(){ save({gold:this.gold,hp:this.hp}); }
}
