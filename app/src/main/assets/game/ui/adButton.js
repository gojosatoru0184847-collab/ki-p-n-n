export function wireAdButton(btnId, onClick){
  const btn=document.getElementById(btnId);
  if(!btn) return;
  btn.addEventListener("click", onClick);
}
