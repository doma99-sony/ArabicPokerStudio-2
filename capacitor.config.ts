import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.poker3arabawy.app',
  appName: 'Poker 3arabawy',
  webDir: 'dist', // مجلد build الذي يحتوي على ملفات الإنتاج
  // تكوين للتشغيل المحلي (Bundled Mode) بدون الاتصال بالإنترنت
  server: {
    // حذف hostname يجعل التطبيق يعمل بشكل محلي تمامًا
    hostname: '',
    // لا يستخدم أي مخطط URL خارجي
    androidScheme: 'file',
    iosScheme: 'file',
  },
  android: {
    buildOptions: {
      keystorePath: 'android.keystore',
      keystoreAlias: 'poker3arabawy',
    }
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
