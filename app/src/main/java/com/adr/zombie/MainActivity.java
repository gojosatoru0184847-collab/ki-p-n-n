package com.adr.zombie;

import android.app.Activity;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 🔥 BẮT BUỘC: bật tăng tốc phần cứng
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );

        WebView webView = new WebView(this);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);

        // 🔥 BẮT BUỘC cho WebGL (nếu thiếu → đen màn)
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);

        setContentView(webView);

        // 🔥 LOAD FILE ĐÚNG ĐƯỜNG DẪN
        webView.loadUrl("file:///android_asset/index.html");
    }
}
