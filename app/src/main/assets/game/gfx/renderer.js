import {Storage} from "../core/storage.js";
import {Renderer2D} from "./renderer2d.js";
import {RendererGL} from "./rendererGL.js";

export function createRenderer(glCanvas, ui){
  const s=new Storage("gfx");
  const quality=s.get("quality","high"); // high|medium|low
  const preferGL = quality!=="low"; // low uses 2D for max compat

  let renderer=null;
  if(preferGL){
    try{
      renderer=new RendererGL(glCanvas, ui, quality);
    }catch(e){
      console.warn("WebGL renderer failed, fallback 2D", e);
      renderer=new Renderer2D(glCanvas, ui);
    }
  }else{
    renderer=new Renderer2D(glCanvas, ui);
  }

  renderer.quality=quality;
  renderer.setQuality=(q)=>{
    s.set("quality", q);
    location.reload();
  };
  return renderer;
}
