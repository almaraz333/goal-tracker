/**
 * Storage Adapter Service
 *
 * Goal Tracker now uses a single internal storage backend based on IndexedDB.
 */

import type { Goal } from '@/types';
import {
  initializeGoalsDB,
  loadGoalsFromIndexedDB,
  saveGoalToIndexedDB,
  deleteGoalFromIndexedDB,
} from './indexedDbStorage.service';

/**
 * Storage mode - which backend we're using
 */
export type StorageMode = 'indexed-db' | 'none';

/**
 * Storage state for the application
 */
export interface StorageState {
  mode: StorageMode;
  isReady: boolean;
  error?: string;
}

// Current storage mode
let currentMode: StorageMode = 'none';

export function getStorageMode(): StorageMode {
  return currentMode;
}

/**
 * Goal Tracker now always uses internal IndexedDB storage.
 */
function determineStorageMode(): StorageMode {
  return 'indexed-db';
}

/**
 * Initialize the storage adapter
 * Returns the storage state after initialization
 */
export async function initializeStorage(): Promise<StorageState> {
  currentMode = determineStorageMode();

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

  currentMode = 'none';
  return {
    mode: 'none',
    isReady: false,
    error: 'Internal storage could not be initialized.',
  };
}

/**
 * Load goals from the appropriate storage backend
 */
export async function loadGoals(): Promise<Goal[]> {
  if (currentMode === 'indexed-db') {
    return loadGoalsFromIndexedDB();
  }

  return [];
}

/**
 * Save a goal to the appropriate storage backend
 */
export function saveGoal(goal: Goal): void {
  if (currentMode === 'indexed-db') {
    saveGoalToIndexedDB(goal).catch(err => {
      console.error('Failed to save goal to IndexedDB:', err);
    });
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

  console.warn('Goal deletion is only available in in-app storage mode');
}

/**
 * Check if we're in in-app storage mode (allows goal creation)
 */
export function isInAppStorageMode(): boolean {
  return currentMode === 'indexed-db';
}
