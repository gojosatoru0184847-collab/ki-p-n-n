package com.adr.zombie;

import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.View;

public class WebViewFactory {

    public static WebView create(WebView webView){
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);

        // For better WebGL/canvas performance on many devices
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // Basic safe defaults
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);

        return webView;
    }
}
