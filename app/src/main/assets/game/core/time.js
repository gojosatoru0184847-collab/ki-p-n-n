export class Ticker{
  constructor(){ this.last=0; this.acc=0; this.step=1/60; this.started=false; }
  tick(t){
    if(!this.started){ this.last=t; this.started=true; return 0; }
    const dt=(t-this.last)/1000; this.last=t; return dt;
  }
}
