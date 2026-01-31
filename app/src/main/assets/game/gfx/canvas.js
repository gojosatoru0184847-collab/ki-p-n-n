export function setupCanvases(glId="c", uiId="ui"){
  const glCanvas=document.getElementById(glId);
  const uiCanvas=document.getElementById(uiId);
  const ui=uiCanvas.getContext('2d',{alpha:true});

  function resize(){
    const dpr=Math.max(1, Math.min(3, devicePixelRatio||1));
    const w=innerWidth, h=innerHeight;
    glCanvas.width = Math.floor(w*dpr);
    glCanvas.height= Math.floor(h*dpr);
    uiCanvas.width = Math.floor(w*dpr);
    uiCanvas.height= Math.floor(h*dpr);
    glCanvas.style.width=w+"px"; glCanvas.style.height=h+"px";
    uiCanvas.style.width=w+"px"; uiCanvas.style.height=h+"px";
    ui.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener('resize', resize, {passive:true});
  resize();
  return {glCanvas, uiCanvas, ui, resize};
}
