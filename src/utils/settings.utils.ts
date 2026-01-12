/**
 * Settings storage utilities
 * 
 * Provides functions to persist and retrieve app settings from localStorage.
 * Separated from components to allow fast refresh to work properly.
 */

const VAULT_PATH_KEY = 'goaltracker_vault_path';
const STORAGE_PREFERENCE_KEY = 'goaltracker_storage_preference';
const HAS_CHOSEN_STORAGE_KEY = 'goaltracker_has_chosen_storage';

export const DEFAULT_VAULT_PATH = '../Goals';

/**
 * Storage preference type - user's choice of where to store goals
 */
export type StoragePreference = 'external-folder' | 'in-app';

/**
 * Get the stored vault path from localStorage
 */
export function getStoredVaultPath(): string {
  if (typeof window === 'undefined') return DEFAULT_VAULT_PATH;
  return localStorage.getItem(VAULT_PATH_KEY) ?? DEFAULT_VAULT_PATH;
}

/**
 * Store the vault path in localStorage
 */
export function setStoredVaultPath(path: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VAULT_PATH_KEY, path);
}

/**
 * Get the user's storage preference
 */
export function getStoragePreference(): StoragePreference | null {
  if (typeof window === 'undefined') return null;
  const pref = localStorage.getItem(STORAGE_PREFERENCE_KEY);
  if (pref === 'external-folder' || pref === 'in-app') {
    return pref;
  }
  return null;
}

/**
 * Set the user's storage preference
 */
export function setStoragePreference(preference: StoragePreference): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PREFERENCE_KEY, preference);
  localStorage.setItem(HAS_CHOSEN_STORAGE_KEY, 'true');
}

/**
 * Check if the user has made a storage choice (first-time setup complete)
 */
export function hasChosenStorageMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(HAS_CHOSEN_STORAGE_KEY) === 'true';
}

/**
 * Clear storage preference (for resetting)
 */
export function clearStoragePreference(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_PREFERENCE_KEY);
  localStorage.removeItem(HAS_CHOSEN_STORAGE_KEY);
}
