import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initializeTheme, flushPendingWrites, isNativePlatform, logPlatformInfo } from './services'
import { App as CapacitorApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

// Initialize theme before rendering to prevent flash of default theme
initializeTheme();

// Log platform info for debugging
logPlatformInfo();

// Setup native app lifecycle handlers
if (isNativePlatform()) {
  // Hide splash screen once app is ready
  SplashScreen.hide().catch(console.warn);
  
  // Configure status bar for dark theme
  StatusBar.setStyle({ style: Style.Dark }).catch(console.warn);
  StatusBar.setBackgroundColor({ color: '#1f2937' }).catch(console.warn);
  
  // Listen for app state changes to flush pending writes
  CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
    if (!isActive) {
      // App going to background - flush pending writes
      console.log('App going to background, flushing pending writes...');
      await flushPendingWrites();
    }
  });
  
  // Handle app URL opens (deep linking)
  CapacitorApp.addListener('appUrlOpen', (event) => {
    console.log('App opened with URL:', event.url);
    // TODO: Handle deep links if needed
  });
  
  // Handle back button on Android
  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      CapacitorApp.exitApp();
    } else {
      window.history.back();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
