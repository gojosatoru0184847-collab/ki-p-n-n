package com.adr.zombie;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.ads.MobileAds;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private AdManager adManager;

    // TODO: Replace with your real AdMob rewarded ad unit id
    // For testing, use Google's sample: ca-app-pub-3940256099942544/5224354917
    private static final String REWARDED_AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

    @Override
    protected void onCreate(Bundle b){
        super.onCreate(b);
        setContentView(R.layout.activity_main);

        MobileAds.initialize(this);
        adManager = new AdManager(this);
        adManager.load(REWARDED_AD_UNIT_ID);

        webView = findViewById(R.id.web);
        WebViewFactory.create(webView);

        webView.addJavascriptInterface(new JsBridge(() -> runOnUiThread(this::showRewardAd)), "Android");

        webView.loadUrl("file:///android_asset/index.html");
    }

    private void showRewardAd(){
        adManager.show(REWARDED_AD_UNIT_ID, new AdManager.RewardCallback() {
            @Override public void onReward() {
                // Call JS callback when rewarded
                if(webView != null) webView.post(() ->
                        webView.evaluateJavascript("window.Game && Game.onReward && Game.onReward();", null)
                );
            }
            @Override public void onClosed() { }
            @Override public void onFailed(String reason) { }
        });
    }
}
