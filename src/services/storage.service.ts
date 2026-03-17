/**
 * Goal Storage Service
 *
 * Goal Tracker uses a single local storage backend based on IndexedDB.
 */

import type { Goal } from '@/types';
import {
  initializeGoalsDB,
  loadGoalsFromIndexedDB,
  saveGoalToIndexedDB,
  deleteGoalFromIndexedDB,
} from './indexedDbStorage.service';

/**
 * Storage state for the application.
 */
export interface StorageState {
  isReady: boolean;
  error?: string;
}

/**
 * Initialize the local goal database.
 */
export async function initializeStorage(): Promise<StorageState> {
  try {
    await initializeGoalsDB();
    return {
      isReady: true,
    };
  } catch (error) {
    return {
      isReady: false,
      error: error instanceof Error ? error.message : 'Failed to initialize local storage',
    };
  }
}

/**
 * Load goals from the local database.
 */
export async function loadGoals(): Promise<Goal[]> {
  return loadGoalsFromIndexedDB();
}

/**
 * Save a goal to the local database.
 */
export function saveGoal(goal: Goal): void {
  saveGoalToIndexedDB(goal).catch(err => {
    console.error('Failed to save goal:', err);
  });
}

/**
 * Delete a goal from the local database.
 */
export async function deleteGoal(filePath: string): Promise<void> {
  await deleteGoalFromIndexedDB(filePath);
}
