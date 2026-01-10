/**
 * Storage Adapter Service
 * 
 * Unified interface for goal storage that works across different environments:
 * - Development: Uses Vite dev server middleware (reads from bundled files, writes via API)
 * - Production PWA: Uses File System Access API for direct file access
 * 
 * This adapter automatically detects the environment and uses the appropriate backend.
 */

import type { Goal } from '@/types';
import type { VaultAccessState } from '@/types/fileSystem.types';
import { registerGoalFiles, loadGoalsFromFiles, saveGoal as saveGoalVite } from './fileSystem.service';
import { 
  checkFileSystemSupport,
  getVaultAccessState,
  loadGoalsFromNativeFS,
  saveGoalToNativeFSDebounced,
  requestDirectoryAccess,
  requestStoredHandlePermission,
  clearVaultAccess,
  cacheFileContent,
} from './nativeFileSystem.service';

/**
 * Storage mode - which backend we're using
 */
export type StorageMode = 'vite' | 'native-fs' | 'none';

/**
 * Storage state for the application
 */
export interface StorageState {
  mode: StorageMode;
  isReady: boolean;
  vaultAccess?: VaultAccessState;
  error?: string;
}

// Current storage mode
let currentMode: StorageMode = 'none';

/**
 * Determine which storage mode to use
 */
export function getStorageMode(): StorageMode {
  // Development mode: use Vite middleware
  if (import.meta.env.DEV) {
    return 'vite';
  }
  
  // Production: check if File System Access API is supported
  const support = checkFileSystemSupport();
  if (support.isFullySupported) {
    return 'native-fs';
  }
  
  // Fallback: no storage available (would need to implement IndexedDB fallback)
  return 'none';
}

/**
 * Initialize the storage adapter
 * Returns the storage state after initialization
 */
export async function initializeStorage(goalFiles?: Array<{ path: string; category: string; content: string }>): Promise<StorageState> {
  currentMode = getStorageMode();
  
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
  
  if (currentMode === 'native-fs') {
    const vaultAccess = await getVaultAccessState();
    
    return {
      mode: 'native-fs',
      isReady: vaultAccess.status === 'ready',
      vaultAccess,
    };
  }
  
  // No storage available
  return {
    mode: 'none',
    isReady: false,
    error: 'No storage method available. File System Access API is not supported in this browser.',
  };
}

/**
 * Load goals from the appropriate storage backend
 */
export async function loadGoals(): Promise<Goal[]> {
  if (currentMode === 'vite') {
    return loadGoalsFromFiles();
  }
  
  if (currentMode === 'native-fs') {
    const goals = await loadGoalsFromNativeFS();
    
    // Cache file contents for saving later
    // Note: This is handled within loadGoalsFromNativeFS now
    
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
  
  if (currentMode === 'native-fs') {
    saveGoalToNativeFSDebounced(goal);
    return;
  }
  
  console.warn('No storage backend available, goal not saved');
}

/**
 * Request access to a goals folder (for native-fs mode)
 */
export async function requestFolderAccess(): Promise<boolean> {
  if (currentMode !== 'native-fs') {
    return false;
  }
  
  const handle = await requestDirectoryAccess();
  return handle !== null;
}

/**
 * Request permission on a previously stored folder
 */
export async function requestStoredPermission(): Promise<boolean> {
  if (currentMode !== 'native-fs') {
    return false;
  }
  
  return requestStoredHandlePermission();
}

/**
 * Clear stored folder access
 */
export async function clearFolderAccess(): Promise<void> {
  if (currentMode === 'native-fs') {
    await clearVaultAccess();
  }
}

/**
 * Get current storage state (for UI)
 */
export async function getStorageState(): Promise<StorageState> {
  if (currentMode === 'vite') {
    return { mode: 'vite', isReady: true };
  }
  
  if (currentMode === 'native-fs') {
    const vaultAccess = await getVaultAccessState();
    return {
      mode: 'native-fs',
      isReady: vaultAccess.status === 'ready',
      vaultAccess,
    };
  }
  
  return { mode: 'none', isReady: false };
}

/**
 * Check if storage requires user action (folder selection or permission)
 */
export function requiresUserAction(state: StorageState): boolean {
  if (state.mode === 'native-fs' && state.vaultAccess) {
    return state.vaultAccess.status === 'not-configured' || 
           state.vaultAccess.status === 'permission-needed';
  }
  return false;
}

/**
 * Export for use in components
 */
export { checkFileSystemSupport, cacheFileContent };
