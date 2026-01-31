export function createRenderer(glCanvas, ui){
  // webgl2 fallback webgl
  const gl = glCanvas.getContext("webgl2", {
    alpha: false,
    antialias: true,
    preserveDrawingBuffer: false
  }) || glCanvas.getContext("webgl", {
    alpha: false,
    antialias: true,
    preserveDrawingBuffer: false
  });

  if (!gl) throw new Error("WebGL not supported");

  const renderer = {
    gl,
    ui,
    quality: "high",
    setQuality(q){ this.quality = q; },

    beginFrame(){
      // ✅ CỰC QUAN TRỌNG: viewport luôn theo buffer size
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);

      // clear nền (để biết chắc nó đang render)
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0.05, 0.05, 0.07, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // UI (nếu có)
      if (ui){
        const w = glCanvas.width / (window.devicePixelRatio || 1);
        const h = glCanvas.height / (window.devicePixelRatio || 1);
        ui.clearRect(0, 0, w, h);
      }
    },

    endFrame(){},

    // helper vẽ chữ lên UI canvas (test nhanh)
    debugText(text, x=12, y=24){
      if(!ui) return;
      ui.save();
      ui.fillStyle = "white";
      ui.font = "16px system-ui";
      ui.fillText(text, x, y);
      ui.restore();
    }
  };

  return renderer;
}
