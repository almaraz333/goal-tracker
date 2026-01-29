/**
 * Platform Detection Service
 * 
 * Provides utilities for detecting the current platform (web, iOS, Android)
 * and adjusting behavior accordingly.
 */

import { Capacitor } from '@capacitor/core';

/**
 * Supported platforms
 */
export type Platform = 'web' | 'ios' | 'android';

/**
 * Platform capabilities
 */
export interface PlatformCapabilities {
  /** Native file system access via Capacitor */
  hasNativeFileSystem: boolean;
  /** Web File System Access API (showDirectoryPicker) */
  hasWebFileSystemAPI: boolean;
  /** IndexedDB support */
  hasIndexedDB: boolean;
  /** Can access external storage (like Syncthing folders) */
  canAccessExternalStorage: boolean;
  /** Supports PWA installation */
  supportsPWA: boolean;
}

/**
 * Check if running in a native Capacitor environment
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the current platform
 */
export function getPlatform(): Platform {
  if (!Capacitor.isNativePlatform()) {
    return 'web';
  }
  return Capacitor.getPlatform() as Platform;
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

/**
 * Check if running on web (browser/PWA)
 */
export function isWeb(): boolean {
  return !Capacitor.isNativePlatform();
}

/**
 * Get platform capabilities
 */
export function getPlatformCapabilities(): PlatformCapabilities {
  const platform = getPlatform();
  
  switch (platform) {
    case 'android':
      return {
        hasNativeFileSystem: true,
        hasWebFileSystemAPI: false,
        hasIndexedDB: true,
        canAccessExternalStorage: true, // Can access /storage/emulated/0/
        supportsPWA: false,
      };
    
    case 'ios':
      return {
        hasNativeFileSystem: true,
        hasWebFileSystemAPI: false,
        hasIndexedDB: true,
        canAccessExternalStorage: false, // iOS has sandboxed storage
        supportsPWA: false,
      };
    
    case 'web':
    default:
      return {
        hasNativeFileSystem: false,
        hasWebFileSystemAPI: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
        hasIndexedDB: typeof indexedDB !== 'undefined',
        canAccessExternalStorage: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
        supportsPWA: true,
      };
  }
}

/**
 * Check if the app can access external folders (like Syncthing)
 * - Web: Requires File System Access API support
 * - Android: Can access external storage with permissions
 * - iOS: Cannot access external folders (sandboxed)
 */
export function canAccessExternalFolders(): boolean {
  const capabilities = getPlatformCapabilities();
  return capabilities.canAccessExternalStorage || capabilities.hasWebFileSystemAPI;
}

/**
 * Get recommended storage mode based on platform
 */
export function getRecommendedStorageMode(): 'external-folder' | 'in-app' {
  const platform = getPlatform();
  
  // iOS should default to in-app storage due to sandboxing
  if (platform === 'ios') {
    return 'in-app';
  }
  
  // Android and Web with File System Access API can use external folders
  if (canAccessExternalFolders()) {
    return 'external-folder';
  }
  
  // Fallback to in-app storage
  return 'in-app';
}

/**
 * Log platform information for debugging
 */
export function logPlatformInfo(): void {
  const platform = getPlatform();
  const capabilities = getPlatformCapabilities();
  
  console.log('=== Platform Info ===');
  console.log(`Platform: ${platform}`);
  console.log(`Is Native: ${isNativePlatform()}`);
  console.log('Capabilities:', capabilities);
  console.log('====================');
}
