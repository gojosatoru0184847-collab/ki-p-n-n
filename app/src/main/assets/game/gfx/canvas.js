export function setupCanvases(glId="c", uiId="ui"){
  const glCanvas = document.getElementById(glId);
  const uiCanvas = document.getElementById(uiId);

  // UI ctx có thể null trên vài máy/webview -> phải check
  const ui = uiCanvas ? uiCanvas.getContext("2d", { alpha: true }) : null;

  function getSize(){
    // Ưu tiên size thật của element (ổn định hơn innerWidth/innerHeight)
    const w = glCanvas?.clientWidth || window.innerWidth || 1;
    const h = glCanvas?.clientHeight || window.innerHeight || 1;
    return { w, h };
  }

  function resize(){
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const { w, h } = getSize();

    const bw = Math.floor(w * dpr);
    const bh = Math.floor(h * dpr);

    if (glCanvas) {
      if (glCanvas.width !== bw) glCanvas.width = bw;
      if (glCanvas.height !== bh) glCanvas.height = bh;
      glCanvas.style.width = w + "px";
      glCanvas.style.height = h + "px";
    }

    if (uiCanvas) {
      if (uiCanvas.width !== bw) uiCanvas.width = bw;
      if (uiCanvas.height !== bh) uiCanvas.height = bh;
      uiCanvas.style.width = w + "px";
      uiCanvas.style.height = h + "px";
    }

    // setTransform chỉ gọi khi ui != null
    if (ui) {
      ui.setTransform(dpr, 0, 0, dpr, 0, 0);
      // optional: clear UI mỗi lần resize
      ui.clearRect(0, 0, w, h);
    }
  }

  window.addEventListener("resize", resize, { passive: true });

  // Một số WebView: layout chưa ổn định ngay -> resize thêm 1 nhịp
  resize();
  requestAnimationFrame(resize);

  return { glCanvas, uiCanvas, ui, resize };
}
