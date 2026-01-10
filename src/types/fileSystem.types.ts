/**
 * File System Access API type definitions
 * 
 * These types extend the browser's File System Access API for use in our app.
 * The File System Access API allows web apps to read and write files on the user's device.
 * 
 * Browser Support (as of Jan 2026):
 * - Chrome Desktop: 86+
 * - Chrome Android: 132+
 * - Edge: 86+
 * - Samsung Internet: 29+
 * - Safari/Firefox: Not supported
 */

/**
 * Permission state for file system access
 */
export type PermissionState = 'granted' | 'denied' | 'prompt';

/**
 * Mode for file system access
 */
export type FileSystemPermissionMode = 'read' | 'readwrite';

/**
 * Options for showing the directory picker
 */
export interface DirectoryPickerOptions {
  /** ID to remember different directories for different purposes */
  id?: string;
  /** Permission mode - 'read' or 'readwrite' */
  mode?: FileSystemPermissionMode;
  /** Start in a specific directory */
  startIn?: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
}

/**
 * Options for querying/requesting permissions
 */
export interface FileSystemHandlePermissionDescriptor {
  mode?: FileSystemPermissionMode;
}

/**
 * Result of checking file system API support
 */
export interface FileSystemSupportResult {
  /** Whether showDirectoryPicker is available */
  hasDirectoryPicker: boolean;
  /** Whether we can persist handles in IndexedDB */
  hasIndexedDB: boolean;
  /** Whether the full File System Access API is supported */
  isFullySupported: boolean;
  /** Reason if not fully supported */
  reason?: string;
}

/**
 * Status of vault access
 */
export type VaultAccessStatus = 
  | 'not-configured'  // User hasn't selected a folder yet
  | 'permission-needed'  // Handle exists but permission needs to be re-requested
  | 'ready'  // Full access granted
  | 'error';  // Something went wrong

/**
 * Vault access state for the UI
 */
export interface VaultAccessState {
  status: VaultAccessStatus;
  folderName?: string;
  error?: string;
}

/**
 * Stored handle metadata (for IndexedDB)
 */
export interface StoredHandleMetadata {
  /** Timestamp when the handle was stored */
  storedAt: number;
  /** Name of the directory */
  name: string;
}

/**
 * Extend Window interface to include File System Access API
 * These are already in lib.dom.d.ts for modern TypeScript but we add
 * explicit types for clarity and older TS versions
 */
declare global {
  interface Window {
    showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
  }
  
  interface FileSystemHandle {
    queryPermission?(options?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    requestPermission?(options?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  }
  
  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemHandle>;
  }
}

export {};
