/**
 * Settings storage utilities
 * 
 * Provides functions to persist and retrieve app settings from localStorage.
 * Separated from components to allow fast refresh to work properly.
 */

const VAULT_PATH_KEY = 'goaltracker_vault_path';
export const DEFAULT_VAULT_PATH = '../Goals';

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
