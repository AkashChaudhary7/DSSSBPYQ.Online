package online.dsssbpyq.twa;

import android.app.Application;
import android.util.Log;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.initialization.InitializationStatus;
import com.google.android.gms.ads.initialization.OnInitializationCompleteListener;
import java.util.concurrent.Executors;

/**
 * Main Application class for DSSSBPYQ.
 * Initializes Google Mobile Ads SDK exactly once at startup in background executor
 * to ensure maximum performance and zero main thread blocking.
 */
public class MainApplication extends Application {
    private static final String TAG = "MainApplication";

    @Override
    public void onCreate() {
        super.onCreate();

        // Initialize Google Mobile Ads SDK asynchronously
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            @Override
            public void run() {
                try {
                    MobileAds.initialize(MainApplication.this, new OnInitializationCompleteListener() {
                        @Override
                        public void onInitializationComplete(InitializationStatus initializationStatus) {
                            Log.d(TAG, "Google Mobile Ads SDK initialized successfully on application startup.");
                        }
                    });
                } catch (Exception e) {
                    Log.w(TAG, "Non-fatal warning during Mobile Ads initialization: " + e.getMessage());
                }
            }
        });
    }
}
