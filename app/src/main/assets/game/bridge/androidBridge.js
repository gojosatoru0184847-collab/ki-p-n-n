export function requestRewardAd(){
  if(window.Android && typeof window.Android.showRewardAd==="function"){
    window.Android.showRewardAd();
    return true;
  }
  return false;
}
