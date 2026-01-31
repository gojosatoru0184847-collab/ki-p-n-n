package com.adr.zombie;

import android.app.Activity;
import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.gms.ads.LoadAdError;

public class AdManager {
    private final Activity activity;
    private RewardedAd rewardedAd;

    public interface RewardCallback {
        void onReward();
        void onClosed();
        void onFailed(String reason);
    }

    public AdManager(Activity activity){
        this.activity = activity;
    }

    public void load(String adUnitId){
        AdRequest req = new AdRequest.Builder().build();
        RewardedAd.load(activity, adUnitId, req, new RewardedAdLoadCallback() {
            @Override public void onAdLoaded(@NonNull RewardedAd ad) { rewardedAd = ad; }
            @Override public void onAdFailedToLoad(@NonNull LoadAdError e) { rewardedAd = null; }
        });
    }

    public boolean isReady(){ return rewardedAd != null; }

    public void show(String adUnitId, RewardCallback cb){
        if(rewardedAd == null){
            if(cb!=null) cb.onFailed("Ad not ready");
            load(adUnitId);
            return;
        }
        RewardedAd ad = rewardedAd;
        rewardedAd = null; // must reload after show
        ad.show(activity, rewardItem -> {
            if(cb!=null) cb.onReward();
        });
        // Best-effort reload
        load(adUnitId);
        if(cb!=null) cb.onClosed();
    }
}
