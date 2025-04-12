import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.app',
  appName: 'Arabic Poker Online',
  webDir: 'dist',
  server: {
    url: 'https://69260161-c3a6-4ce1-b1e6-169da57a46ff-00-16veyohwhpch4.janeway.replit.dev/auth',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#006400", // خلفية خضراء داكنة تتماشى مع سمة التطبيق
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "large",
      spinnerColor: "#D4AF37", // لون ذهبي للمؤشر الدوار
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#006400", // شريط حالة أخضر داكن
      overlaysWebView: false
    }
  }
};

export default config;
