import {setupCanvases} from "./gfx/canvas.js";
import {createRenderer} from "./gfx/renderer.js";
import {Ticker} from "./core/time.js";
import {GameState} from "./state/gameState.js";
import {PlayScene} from "./scenes/play.js";
import {wireAdButton} from "./ui/adButton.js";
import {requestRewardAd} from "./bridge/androidBridge.js";
import {Touch} from "./input/touch.js";

const {glCanvas, ui}=setupCanvases("c","ui");
const renderer=createRenderer(glCanvas, ui);
const ticker=new Ticker();
const state=new GameState();
const scene=new PlayScene(state);
const touch=new Touch(glCanvas);

// UI: Ads + Graphics toggle
wireAdButton(()=>requestRewardAd());

const gfxBtn=document.getElementById("gfxBtn");
if(gfxBtn){
  const label = (q)=>q.charAt(0).toUpperCase()+q.slice(1);
  gfxBtn.textContent = "Graphics: " + label(renderer.quality);
  gfxBtn.addEventListener("click", ()=>{
    const q=renderer.quality;
    const next = (q==="high") ? "medium" : (q==="medium" ? "low" : "high");
    toast("Switching to " + label(next));
    renderer.setQuality(next);
  });
}

function toast(msg){
  const el=document.getElementById("toast");
  if(!el) return;
  el.textContent=msg;
  el.style.opacity="1";
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>el.style.opacity="0", 1100);
}

// World
const world={
  get w(){ return glCanvas.width/(devicePixelRatio||1); },
  get h(){ return glCanvas.height/(devicePixelRatio||1); },
  touch
};

function frame(){
  const dt=ticker.tick();
  renderer.beginFrame();

  scene.update(dt, world);
  scene.render(renderer, world);

  renderer.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
