# Add project specific ProGuard rules here.
# Optimized for Capacitor WebView app

# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }
-keep class com.ionic.** { *; }

# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Google Auth plugin - CRITICAL for native login
-keep class com.codetrixstudio.capacitor.GoogleAuth.** { *; }
-keepclassmembers class com.codetrixstudio.capacitor.GoogleAuth.** { *; }

# Keep Google Sign-In SDK - CRITICAL
-keep class com.google.android.gms.auth.** { *; }
-keep class com.google.android.gms.common.** { *; }
-keep class com.google.android.gms.tasks.** { *; }
-keep class com.google.android.gms.signin.** { *; }
-keep class com.google.android.gms.auth.api.signin.** { *; }
-keep class com.google.android.gms.auth.api.identity.** { *; }
-keepclassmembers class com.google.android.gms.** { *; }

# Keep Geolocation plugin
-keep class com.capacitorjs.plugins.geolocation.** { *; }

# Keep Browser plugin
-keep class com.capacitorjs.plugins.browser.** { *; }

# Preserve line numbers for debugging
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Hide original source file name
-renamesourcefileattribute SourceFile

# Optimize but not too aggressively
-optimizationpasses 3
-allowaccessmodification

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int d(...);
    public static int i(...);
}

# Keep Supabase related
-keep class io.supabase.** { *; }
-keep class com.google.gson.** { *; }

# Keep AndroidX
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Keep Credential Manager (for newer Google Sign-In)
-keep class androidx.credentials.** { *; }
-keep class com.google.android.libraries.identity.googleid.** { *; }

# Don't warn about missing classes
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
-dontwarn com.google.android.gms.**
-dontwarn com.google.errorprone.**
