import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.goaltracker.app',
  appName: 'Goal Tracker',
  webDir: 'dist',
  
  // Server configuration for development
  server: {
    // Uncomment below for live reload during development
    // url: 'http://YOUR_IP:5173',
    // cleartext: true,
    androidScheme: 'https',
  },
  
  // Android-specific configuration
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true, // Set to false for production
  },
  
  // iOS-specific configuration
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Goal Tracker',
  },
  
  // Plugin configurations
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#111827',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1f2937',
    },
    Filesystem: {
      // Request legacy external storage on Android 10
      requestLegacyExternalStorage: true,
    },
  },
};

export default config;
