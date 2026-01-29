/**
 * Storage Adapter Service
 * 
 * Unified interface for goal storage that works across different environments:
 * - Development: Uses Vite dev server middleware (reads from bundled files, writes via API)
 * - Production PWA (External Folder): Uses File System Access API for direct file access
 * - Production PWA (In-App): Uses IndexedDB for storage within the app
 * - Native App (Capacitor): Uses Capacitor Filesystem plugin for file access
 * 
 * This adapter automatically detects the environment and uses the appropriate backend.
 */

import type { Goal } from '@/types';
import type { VaultAccessState } from '@/types/fileSystem.types';
import { registerGoalFiles, loadGoalsFromFiles, saveGoal as saveGoalVite, getGoalContent } from './fileSystem.service';
import { 
  checkFileSystemSupport,
  getVaultAccessState,
  loadGoalsFromNativeFS,
  saveGoalToNativeFSDebounced,
  requestDirectoryAccess,
  requestStoredHandlePermission,
  clearVaultAccess,
  cacheFileContent,
  getRawGoalContent as getNativeFSContent,
  saveRawGoalContent as saveNativeFSContent,
} from './nativeFileSystem.service';
import {
  initializeGoalsDB,
  loadGoalsFromIndexedDB,
  saveGoalToIndexedDB,
  deleteGoalFromIndexedDB,
  getGoalContentFromIndexedDB,
  saveGoalContentToIndexedDB,
} from './indexedDbStorage.service';
import {
  isCapacitorFilesystemAvailable,
  hasVaultConfigured as hasCapacitorVaultConfigured,
  getCapacitorVaultAccessState,
  loadGoalsFromCapacitorFS,
  saveGoalToCapacitorFSDebounced,
  pickFolder as pickCapacitorFolder,
  setVaultPath as setCapacitorVaultPath,
  clearVaultPath as clearCapacitorVaultPath,
  getRawGoalContent as getCapacitorFSContent,
  saveRawGoalContent as saveCapacitorFSContent,
  requestStoragePermissions,
  flushPendingWrites as flushCapacitorWrites,
} from './capacitorFileSystem.service';
import { isNativePlatform, isIOS, getPlatformCapabilities } from './platform.service';
import { getStoragePreference, hasChosenStorageMode } from '@/utils/settings.utils';

/**
 * Storage mode - which backend we're using
 */
export type StorageMode = 'vite' | 'native-fs' | 'capacitor-fs' | 'indexed-db' | 'none';

/**
 * Storage state for the application
 */
export interface StorageState {
  mode: StorageMode;
  isReady: boolean;
  vaultAccess?: VaultAccessState;
  error?: string;
  needsStorageChoice?: boolean;
}

// Current storage mode
let currentMode: StorageMode = 'none';

/**
 * Determine which storage mode to use based on environment and user preference
 */
export function getStorageMode(): StorageMode {
  return currentMode;
}

/**
 * Determine the storage mode that should be used
 * This is called during initialization to figure out the mode
 */
export function determineStorageMode(): StorageMode {
  // Development mode: use Vite middleware
  if (import.meta.env.DEV) {
    return 'vite';
  }
  
  // Native Capacitor app
  if (isNativePlatform()) {
    const preference = getStoragePreference();
    
    // iOS defaults to in-app storage due to sandboxing
    if (isIOS() && preference !== 'external-folder') {
      return 'indexed-db';
    }
    
    // Android with external folder preference uses Capacitor filesystem
    if (preference === 'external-folder' && isCapacitorFilesystemAvailable()) {
      return 'capacitor-fs';
    }
    
    // In-app storage preference uses IndexedDB
    if (preference === 'in-app') {
      return 'indexed-db';
    }
    
    // No preference set - will prompt user to choose
    return 'none';
  }
  
  // Web/PWA mode
  const preference = getStoragePreference();
  
  if (preference === 'in-app') {
    return 'indexed-db';
  }
  
  if (preference === 'external-folder') {
    // Check if File System Access API is supported
    const support = checkFileSystemSupport();
    if (support.isFullySupported) {
      return 'native-fs';
    }
    // If not supported, fall back to none (should show error)
    return 'none';
  }
  
  // No preference set - will prompt user to choose
  return 'none';
}

/**
 * Check if user needs to make initial storage choice
 */
export function needsStorageChoice(): boolean {
  // In dev mode, never need to choose
  if (import.meta.env.DEV) {
    return false;
  }
  
  // In native mode, check platform capabilities
  if (isNativePlatform()) {
    const capabilities = getPlatformCapabilities();
    // iOS only supports in-app storage, so auto-select it
    if (!capabilities.canAccessExternalStorage && !hasChosenStorageMode()) {
      // Could auto-set to in-app storage for iOS here
      return true;
    }
  }
  
  return !hasChosenStorageMode();
}

/**
 * Initialize the storage adapter
 * Returns the storage state after initialization
 */
export async function initializeStorage(goalFiles?: Array<{ path: string; category: string; content: string }>): Promise<StorageState> {
  // Check if user needs to make a choice first
  if (needsStorageChoice()) {
    currentMode = 'none';
    return {
      mode: 'none',
      isReady: false,
      needsStorageChoice: true,
    };
  }
  
  currentMode = determineStorageMode();
  
  if (currentMode === 'vite') {
    // Register files from Vite plugin
    if (goalFiles) {
      registerGoalFiles(goalFiles);
    }
    return {
      mode: 'vite',
      isReady: true,
    };
  }
  
  if (currentMode === 'indexed-db') {
    try {
      await initializeGoalsDB();
      return {
        mode: 'indexed-db',
        isReady: true,
      };
    } catch (error) {
      return {
        mode: 'indexed-db',
        isReady: false,
        error: error instanceof Error ? error.message : 'Failed to initialize IndexedDB',
      };
    }
  }
  
  if (currentMode === 'native-fs') {
    const vaultAccess = await getVaultAccessState();
    
    return {
      mode: 'native-fs',
      isReady: vaultAccess.status === 'ready',
      vaultAccess,
    };
  }
  
  if (currentMode === 'capacitor-fs') {
    // Request storage permissions on Android
    await requestStoragePermissions();
    
    const vaultAccess = await getCapacitorVaultAccessState();
    
    return {
      mode: 'capacitor-fs',
      isReady: vaultAccess.status === 'ready',
      vaultAccess,
    };
  }
  
  // No storage available
  return {
    mode: 'none',
    isReady: false,
    error: 'No storage method available. Please select a storage mode in settings.',
  };
}

/**
 * Re-initialize storage after mode change
 */
export async function reinitializeStorage(): Promise<StorageState> {
  return initializeStorage();
}

/**
 * Load goals from the appropriate storage backend
 */
export async function loadGoals(): Promise<Goal[]> {
  if (currentMode === 'vite') {
    return loadGoalsFromFiles();
  }
  
  if (currentMode === 'indexed-db') {
    return loadGoalsFromIndexedDB();
  }
  
  if (currentMode === 'native-fs') {
    const goals = await loadGoalsFromNativeFS();
    return goals;
  }
  
  if (currentMode === 'capacitor-fs') {
    const goals = await loadGoalsFromCapacitorFS();
    return goals;
  }
  
  return [];
}

/**
 * Save a goal to the appropriate storage backend
 */
export function saveGoal(goal: Goal): void {
  if (currentMode === 'vite') {
    saveGoalVite(goal);
    return;
  }
  
  if (currentMode === 'indexed-db') {
    // IndexedDB save is async, but we fire and forget for consistency
    saveGoalToIndexedDB(goal).catch(err => {
      console.error('Failed to save goal to IndexedDB:', err);
    });
    return;
  }
  
  if (currentMode === 'native-fs') {
    saveGoalToNativeFSDebounced(goal);
    return;
  }
  
  if (currentMode === 'capacitor-fs') {
    saveGoalToCapacitorFSDebounced(goal);
    return;
  }
  
  console.warn('No storage backend available, goal not saved');
}

/**
 * Delete a goal from storage
 */
export async function deleteGoal(filePath: string): Promise<void> {
  if (currentMode === 'indexed-db') {
    await deleteGoalFromIndexedDB(filePath);
    return;
  }
  
  // For other modes, deletion is not supported through this service
  console.warn('Goal deletion is only available in in-app storage mode');
}

/**
 * Request access to a goals folder (for native-fs or capacitor-fs mode)
 */
export async function requestFolderAccess(): Promise<boolean> {
  if (currentMode === 'native-fs') {
    const handle = await requestDirectoryAccess();
    return handle !== null;
  }
  
  if (currentMode === 'capacitor-fs') {
    const result = await pickCapacitorFolder();
    if (result) {
      await setCapacitorVaultPath(result.path, result.name);
      return true;
    }
    return false;
  }
  
  return false;
}

/**
 * Request permission on a previously stored folder
 */
export async function requestStoredPermission(): Promise<boolean> {
  if (currentMode === 'native-fs') {
    return requestStoredHandlePermission();
  }
  
  if (currentMode === 'capacitor-fs') {
    // Capacitor doesn't require re-requesting permissions in the same way
    // Just check if vault is configured
    return hasCapacitorVaultConfigured();
  }
  
  return false;
}

/**
 * Clear stored folder access
 */
export async function clearFolderAccess(): Promise<void> {
  if (currentMode === 'native-fs') {
    await clearVaultAccess();
  }
  
  if (currentMode === 'capacitor-fs') {
    await clearCapacitorVaultPath();
  }
}

/**
 * Get current storage state (for UI)
 */
export async function getStorageState(): Promise<StorageState> {
  if (currentMode === 'vite') {
    return { mode: 'vite', isReady: true };
  }
  
  if (currentMode === 'indexed-db') {
    return { mode: 'indexed-db', isReady: true };
  }
  
  if (currentMode === 'native-fs') {
    const vaultAccess = await getVaultAccessState();
    return {
      mode: 'native-fs',
      isReady: vaultAccess.status === 'ready',
      vaultAccess,
    };
  }
  
  if (currentMode === 'capacitor-fs') {
    const vaultAccess = await getCapacitorVaultAccessState();
    return {
      mode: 'capacitor-fs',
      isReady: vaultAccess.status === 'ready',
      vaultAccess,
    };
  }
  
  return { 
    mode: 'none', 
    isReady: false,
    needsStorageChoice: needsStorageChoice(),
  };
}

/**
 * Check if storage requires user action (folder selection or permission)
 */
export function requiresUserAction(state: StorageState): boolean {
  // Needs storage choice
  if (state.needsStorageChoice) {
    return true;
  }
  
  // Native FS or Capacitor FS needs folder selection or permission
  if ((state.mode === 'native-fs' || state.mode === 'capacitor-fs') && state.vaultAccess) {
    return state.vaultAccess.status === 'not-configured' || 
           state.vaultAccess.status === 'permission-needed';
  }
  
  return false;
}

/**
 * Get raw goal content from the appropriate cache
 */
export function getRawGoalContent(filePath: string): string | null {
  if (currentMode === 'vite') {
    return getGoalContent(filePath);
  }
  
  if (currentMode === 'native-fs') {
    return getNativeFSContent(filePath);
  }
  
  if (currentMode === 'capacitor-fs') {
    // Capacitor FS is async only, return null and use async version
    return null;
  }
  
  // For indexed-db, we need to load async - return null and handle differently
  return null;
}

/**
 * Get raw goal content async (works for all modes)
 */
export async function getRawGoalContentAsync(filePath: string): Promise<string | null> {
  if (currentMode === 'indexed-db') {
    return getGoalContentFromIndexedDB(filePath);
  }
  
  if (currentMode === 'capacitor-fs') {
    return getCapacitorFSContent(filePath);
  }
  
  return getRawGoalContent(filePath);
}

/**
 * Save raw goal content to the appropriate storage
 */
export async function saveRawGoalContent(filePath: string, content: string, category?: string): Promise<void> {
  if (currentMode === 'indexed-db') {
    return saveGoalContentToIndexedDB(filePath, content, category ?? 'Uncategorized');
  }
  
  if (currentMode === 'native-fs') {
    return saveNativeFSContent(filePath, content);
  }
  
  if (currentMode === 'capacitor-fs') {
    return saveCapacitorFSContent(filePath, content);
  }
  
  // In Vite mode, we can't save raw content (would need a dev server endpoint)
  throw new Error('Saving raw content is only available in PWA mode');
}

/**
 * Check if we're in in-app storage mode (allows goal creation)
 */
export function isInAppStorageMode(): boolean {
  return currentMode === 'indexed-db';
}

/**
 * Check if we're in external folder mode (allows raw markdown editing)
 */
export function isExternalFolderMode(): boolean {
  return currentMode === 'native-fs' || currentMode === 'capacitor-fs';
}

/**
 * Check if running in native Capacitor app
 */
export function isCapacitorMode(): boolean {
  return currentMode === 'capacitor-fs';
}

/**
 * Flush any pending writes (important before app close on native)
 */
export async function flushPendingWrites(): Promise<void> {
  if (currentMode === 'capacitor-fs') {
    await flushCapacitorWrites();
  }
}

/**
 * Export for use in components
 */
export { checkFileSystemSupport, cacheFileContent };
