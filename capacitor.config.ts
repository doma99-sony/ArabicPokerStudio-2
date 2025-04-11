import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.poker3arabawy.app',
  appName: 'Poker 3arabawy',
  webDir: 'public',
  server: {
    // This setting is needed for running on different hosts
    // for production, we'll set this to the domain of your Replit app
    hostname: 'localhost',
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: ['*.replit.app', 'localhost:*']
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
      backgroundColor: "#006400", // Dark green background to match app theme
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "large",
      spinnerColor: "#D4AF37", // Gold color for spinner
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#006400", // Dark green status bar
    }
  }
};

export default config;
