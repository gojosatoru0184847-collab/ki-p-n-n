const KEY="zombie_save_v1";
export function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ return {}; } }
export function save(data){ try{ localStorage.setItem(KEY, JSON.stringify(data||{})); }catch(e){} }
