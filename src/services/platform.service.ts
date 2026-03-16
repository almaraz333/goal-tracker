import { Capacitor } from '@capacitor/core';

export type RuntimePlatform = 'web' | 'android' | 'ios';

export interface PlatformInfo {
  platform: RuntimePlatform;
  isNativeApp: boolean;
  supportsPwaFeatures: boolean;
}

export function getPlatformInfo(): PlatformInfo {
  const rawPlatform = Capacitor.getPlatform();
  const platform: RuntimePlatform = rawPlatform === 'android' || rawPlatform === 'ios'
    ? rawPlatform
    : 'web';
  const isNative = Capacitor.isNativePlatform();

  return {
    platform,
    isNativeApp: isNative,
    supportsPwaFeatures: !isNative,
  };
}

export function isNativeApp(): boolean {
  return getPlatformInfo().isNativeApp;
}

export function supportsPWAFeatures(): boolean {
  return getPlatformInfo().supportsPwaFeatures;
}