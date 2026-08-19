# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Capacitor Bridge & Native Plugins
-keep public class * extends com.getcapacitor.Plugin
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.BridgeActivity
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Annotations & JavascriptInterface
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Google Play Services & AdMob
-keep public class com.google.android.gms.ads.** {
    public *;
}
-keep public class com.google.ads.** {
    public *;
}

# Capacitor Community AdMob Plugin
-keep class com.getcapacitor.community.admob.** { *; }

