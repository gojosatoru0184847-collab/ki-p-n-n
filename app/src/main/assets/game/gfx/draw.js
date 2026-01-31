export function clear(r, w, h){
  // renderer handles its own size; w/h kept for compatibility
  if(r && r.clear) r.clear(0.02,0.02,0.05,1);
}
export function text(r, str, x, y, color="#fff", size=16){
  if(r && r.text) r.text(str, x, y, color, size);
}
export function rect(r, x, y, w, h, color="#f00", glow=18){
  if(r && r.rect) r.rect(x, y, w, h, color, glow);
}
