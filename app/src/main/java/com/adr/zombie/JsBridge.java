package com.adr.zombie;

import android.webkit.JavascriptInterface;

public class JsBridge {
    public interface Listener {
        void requestRewardAd();
    }

    private final Listener listener;

    public JsBridge(Listener listener){
        this.listener = listener;
    }

    @JavascriptInterface
    public void showRewardAd(){
        if(listener != null) listener.requestRewardAd();
    }
}
