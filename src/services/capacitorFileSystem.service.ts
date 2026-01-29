/**
 * Capacitor File System Service
 * 
 * Provides file system operations for native platforms (iOS/Android)
 * using Capacitor's Filesystem plugin.
 * 
 * For Android external folder access:
 * - User provides a path like "/storage/emulated/0/Syncthing/Goals"
 * - We use Capacitor Filesystem with Directory.ExternalStorage
 * 
 * For iOS:
 * - External folder access is NOT supported due to sandboxing
 * - Users must use in-app storage (IndexedDB)
 */

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import type { Goal } from '@/types';
import type { VaultAccessState } from '@/types/fileSystem.types';
import { parseFrontmatter, frontmatterToGoal, goalToMarkdown } from './fileSystem.service';
import { isAndroid } from './platform.service';

// Storage keys for Preferences
const VAULT_PATH_KEY = 'capacitor_vault_path';
const VAULT_NAME_KEY = 'capacitor_vault_name';

// Cached vault path
let currentVaultPath: string | null = null;

// File content cache for performance
const fileContentCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds

// Debounce timers for saves
const saveDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const DEBOUNCE_DELAY = 500;

/**
 * Check if Capacitor Filesystem is available
 */
export function isCapacitorFilesystemAvailable(): boolean {
  return typeof Filesystem !== 'undefined';
}

/**
 * Request permission to access external storage (Android only)
 */
export async function requestStoragePermissions(): Promise<boolean> {
  if (!isAndroid()) {
    // iOS doesn't support external storage access
    return false;
  }
  
  try {
    const result = await Filesystem.checkPermissions();
    
    if (result.publicStorage !== 'granted') {
      const permResult = await Filesystem.requestPermissions();
      return permResult.publicStorage === 'granted';
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting storage permissions:', error);
    return false;
  }
}

/**
 * Validate and set the vault path
 * The path should be relative to external storage root
 * e.g., "Syncthing/Goals" or "Documents/Goals"
 */
export async function setVaultPathWithValidation(path: string): Promise<{ success: boolean; error?: string }> {
  if (!isAndroid()) {
    return { success: false, error: 'External folder access is only supported on Android' };
  }
  
  // Clean up the path
  let cleanPath = path.trim();
  
  // Remove leading /storage/emulated/0/ if user included it
  cleanPath = cleanPath.replace(/^\/storage\/emulated\/\d+\/?/, '');
  // Remove leading slash
  cleanPath = cleanPath.replace(/^\/+/, '');
  // Remove trailing slash
  cleanPath = cleanPath.replace(/\/+$/, '');
  
  if (!cleanPath) {
    return { success: false, error: 'Please enter a valid folder path' };
  }
  
  try {
    // Request permissions first
    const hasPermission = await requestStoragePermissions();
    if (!hasPermission) {
      return { success: false, error: 'Storage permission denied. Please grant storage access in app settings.' };
    }
    
    // Try to read the directory to verify it exists
    await Filesystem.readdir({
      path: cleanPath,
      directory: Directory.ExternalStorage,
    });
    
    // Extract folder name from path
    const folderName = cleanPath.split('/').pop() || 'Goals';
    
    // Save the path
    await setVaultPath(cleanPath, folderName);
    
    return { success: true };
  } catch (error) {
    const errorMsg = (error as Error).message || 'Unknown error';
    
    if (errorMsg.includes('not exist') || errorMsg.includes('No such file')) {
      return { 
        success: false, 
        error: `Folder not found: "${cleanPath}". Make sure the folder exists on your device.` 
      };
    }
    
    if (errorMsg.includes('permission') || errorMsg.includes('denied')) {
      return { 
        success: false, 
        error: 'Permission denied. Please grant storage access in your device settings.' 
      };
    }
    
    return { success: false, error: `Failed to access folder: ${errorMsg}` };
  }
}

/**
 * Set the vault path for external folder storage
 * Uses localStorage for persistence (works on all platforms)
 */
export async function setVaultPath(path: string, name: string): Promise<void> {
  try {
    localStorage.setItem(VAULT_PATH_KEY, path);
    localStorage.setItem(VAULT_NAME_KEY, name);
  } catch (e) {
    console.warn('Failed to save vault path to localStorage:', e);
  }
  currentVaultPath = path;
}

/**
 * Get the stored vault path
 * Uses localStorage for persistence (works on all platforms)
 */
export async function getVaultPath(): Promise<string | null> {
  if (currentVaultPath) {
    return currentVaultPath;
  }
  
  try {
    const value = localStorage.getItem(VAULT_PATH_KEY);
    currentVaultPath = value;
    return value;
  } catch (e) {
    console.warn('Failed to get vault path from localStorage:', e);
    return null;
  }
}

/**
 * Get vault folder name
 * Uses localStorage for persistence (works on all platforms)
 */
export async function getVaultName(): Promise<string | null> {
  try {
    return localStorage.getItem(VAULT_NAME_KEY);
  } catch (e) {
    console.warn('Failed to get vault name from localStorage:', e);
    return null;
  }
}

/**
 * Clear the stored vault path
 * Uses localStorage for persistence (works on all platforms)
 */
export async function clearVaultPath(): Promise<void> {
  try {
    localStorage.removeItem(VAULT_PATH_KEY);
    localStorage.removeItem(VAULT_NAME_KEY);
  } catch (e) {
    console.warn('Failed to clear vault path from localStorage:', e);
  }
  currentVaultPath = null;
  fileContentCache.clear();
}

/**
 * Check if vault is configured
 */
export async function hasVaultConfigured(): Promise<boolean> {
  const path = await getVaultPath();
  return path !== null && path !== '';
}

/**
 * Get the current vault access state
 */
export async function getCapacitorVaultAccessState(): Promise<VaultAccessState> {
  try {
    const path = await getVaultPath();
    
    if (!path) {
      return { status: 'not-configured' };
    }
    
    // Verify the path is still accessible
    try {
      await Filesystem.readdir({
        path,
        directory: Directory.ExternalStorage,
      });
      
      const name = await getVaultName();
      return {
        status: 'ready',
        folderName: name || path.split('/').pop() || 'Goals',
      };
    } catch {
      // Path might not be accessible anymore
      return {
        status: 'permission-needed',
        folderName: path.split('/').pop() || 'Goals',
      };
    }
  } catch (error) {
    return {
      status: 'error',
      error: (error as Error).message,
    };
  }
}

/**
 * Read a file's content
 */
export async function readFile(filePath: string): Promise<string> {
  // Check cache first
  const cached = fileContentCache.get(filePath);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }
  
  const vaultPath = await getVaultPath();
  if (!vaultPath) {
    throw new Error('Vault path not configured');
  }
  
  const fullPath = `${vaultPath}/${filePath}`;
  
  try {
    const result = await Filesystem.readFile({
      path: fullPath,
      directory: Directory.ExternalStorage,
      encoding: Encoding.UTF8,
    });
    
    const content = result.data as string;
    
    // Update cache
    fileContentCache.set(filePath, { content, timestamp: Date.now() });
    
    return content;
  } catch (error) {
    console.error(`Error reading file ${fullPath}:`, error);
    throw error;
  }
}

/**
 * Write content to a file
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  const vaultPath = await getVaultPath();
  if (!vaultPath) {
    throw new Error('Vault path not configured');
  }
  
  const fullPath = `${vaultPath}/${filePath}`;
  
  // Ensure directory exists
  const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
  try {
    await Filesystem.mkdir({
      path: dirPath,
      directory: Directory.ExternalStorage,
      recursive: true,
    });
  } catch {
    // Directory might already exist
  }
  
  await Filesystem.writeFile({
    path: fullPath,
    data: content,
    directory: Directory.ExternalStorage,
    encoding: Encoding.UTF8,
  });
  
  // Update cache
  fileContentCache.set(filePath, { content, timestamp: Date.now() });
}

/**
 * Write content to a file with debouncing
 */
export function writeFileDebounced(filePath: string, content: string): void {
  // Clear existing timer for this file
  const existingTimer = saveDebounceTimers.get(filePath);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  
  // Update cache immediately for responsive UI
  fileContentCache.set(filePath, { content, timestamp: Date.now() });
  
  // Set new debounced write
  const timer = setTimeout(async () => {
    try {
      await writeFile(filePath, content);
      saveDebounceTimers.delete(filePath);
    } catch (error) {
      console.error(`Error saving file ${filePath}:`, error);
    }
  }, DEBOUNCE_DELAY);
  
  saveDebounceTimers.set(filePath, timer);
}

/**
 * Delete a file
 */
export async function deleteFile(filePath: string): Promise<void> {
  const vaultPath = await getVaultPath();
  if (!vaultPath) {
    throw new Error('Vault path not configured');
  }
  
  const fullPath = `${vaultPath}/${filePath}`;
  
  await Filesystem.deleteFile({
    path: fullPath,
    directory: Directory.ExternalStorage,
  });
  
  // Remove from cache
  fileContentCache.delete(filePath);
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const vaultPath = await getVaultPath();
    if (!vaultPath) {
      return false;
    }
    
    const fullPath = `${vaultPath}/${filePath}`;
    
    await Filesystem.stat({
      path: fullPath,
      directory: Directory.ExternalStorage,
    });
    
    return true;
  } catch {
    return false;
  }
}

/**
 * List files in a directory
 */
export async function listFiles(dirPath: string = ''): Promise<string[]> {
  const vaultPath = await getVaultPath();
  if (!vaultPath) {
    throw new Error('Vault path not configured');
  }
  
  const fullPath = dirPath ? `${vaultPath}/${dirPath}` : vaultPath;
  
  try {
    const result = await Filesystem.readdir({
      path: fullPath,
      directory: Directory.ExternalStorage,
    });
    
    return result.files.map(f => f.name);
  } catch {
    return [];
  }
}

/**
 * Load all goals from the vault
 */
export async function loadGoalsFromCapacitorFS(): Promise<Goal[]> {
  const vaultPath = await getVaultPath();
  if (!vaultPath) {
    throw new Error('Vault path not configured');
  }
  
  const goals: Goal[] = [];
  
  try {
    // List all items in the vault directory
    const topLevel = await Filesystem.readdir({
      path: vaultPath,
      directory: Directory.ExternalStorage,
    });
    
    for (const item of topLevel.files) {
      if (item.type === 'directory') {
        // This is a category folder
        const category = item.name;
        const categoryPath = `${vaultPath}/${category}`;
        
        try {
          const categoryContents = await Filesystem.readdir({
            path: categoryPath,
            directory: Directory.ExternalStorage,
          });
          
          for (const file of categoryContents.files) {
            if (file.name.endsWith('.md') && !file.name.startsWith('_')) {
              try {
                const filePath = `${category}/${file.name}`;
                const content = await readFile(filePath);
                const frontmatter = parseFrontmatter(content);
                const goal = frontmatterToGoal(frontmatter, content, filePath, category);
                
                if (goal) {
                  goal.filePath = filePath;
                  goals.push(goal);
                }
              } catch (error) {
                console.error(`Error parsing goal file ${file.name}:`, error);
              }
            }
          }
        } catch (error) {
          console.error(`Error reading category ${category}:`, error);
        }
      } else if (item.name.endsWith('.md') && !item.name.startsWith('_')) {
        // Root-level goal file
        try {
          const content = await readFile(item.name);
          const frontmatter = parseFrontmatter(content);
          const goal = frontmatterToGoal(frontmatter, content, item.name, 'Uncategorized');
          
          if (goal) {
            goal.filePath = item.name;
            goals.push(goal);
          }
        } catch (error) {
          console.error(`Error parsing goal file ${item.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error loading goals from Capacitor FS:', error);
    throw error;
  }
  
  return goals;
}

/**
 * Save a goal to the file system
 */
export async function saveGoalToCapacitorFS(goal: Goal): Promise<void> {
  const filePath = goal.filePath || `${goal.category}/${goal.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.md`;
  const content = goalToMarkdown(goal);
  
  await writeFile(filePath, content);
}

/**
 * Save a goal with debouncing
 */
export function saveGoalToCapacitorFSDebounced(goal: Goal): void {
  const filePath = goal.filePath || `${goal.category}/${goal.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.md`;
  const content = goalToMarkdown(goal);
  
  writeFileDebounced(filePath, content);
}

/**
 * Cache file content (for compatibility with existing code)
 */
export function cacheFileContent(filePath: string, content: string): void {
  fileContentCache.set(filePath, { content, timestamp: Date.now() });
}

/**
 * Get raw goal content
 */
export async function getRawGoalContent(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}

/**
 * Save raw goal content
 */
export async function saveRawGoalContent(filePath: string, content: string): Promise<void> {
  await writeFile(filePath, content);
}

/**
 * Flush any pending writes (call before app close)
 */
export async function flushPendingWrites(): Promise<void> {
  const pendingWrites: Promise<void>[] = [];
  
  for (const [filePath, timer] of saveDebounceTimers.entries()) {
    clearTimeout(timer);
    const cached = fileContentCache.get(filePath);
    if (cached) {
      pendingWrites.push(writeFile(filePath, cached.content));
    }
  }
  
  saveDebounceTimers.clear();
  
  await Promise.all(pendingWrites);
}
