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

        WebView.setWebContentsDebuggingEnabled(true);

        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);

        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);

        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);

if (android.os.Build.VERSION.SDK_INT >= 21) {
    s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
}

webView.setWebChromeClient(new android.webkit.WebChromeClient());
webView.setWebViewClient(new android.webkit.WebViewClient());

webView.loadUrl("file:///android_asset/index.html");


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
