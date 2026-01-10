/**
 * Native File System Access Service
 * 
 * Provides access to the user's local file system using the File System Access API.
 * This allows the PWA to read and write goal files directly on the user's device.
 * 
 * Key features:
 * - Request directory access via showDirectoryPicker()
 * - Persist handle in IndexedDB for re-use across sessions
 * - Re-request permissions when needed
 * - Read and write markdown files
 */

import type { Goal } from '@/types';
import type { 
  FileSystemSupportResult, 
  VaultAccessState, 
  DirectoryPickerOptions,
  FileSystemHandlePermissionDescriptor,
} from '@/types/fileSystem.types';
import { 
  storeDirectoryHandle, 
  getStoredDirectoryHandle, 
  getStoredHandleMetadata,
  clearStoredDirectoryHandle,
  hasStoredDirectoryHandle 
} from './handleStorage.service';
import { parseFrontmatter, frontmatterToGoal } from './fileSystem.service';

// Cache the current directory handle for quick access
let currentDirectoryHandle: FileSystemDirectoryHandle | null = null;

/**
 * Check if the File System Access API is supported
 */
export function checkFileSystemSupport(): FileSystemSupportResult {
  const hasDirectoryPicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  const hasIndexedDB = typeof indexedDB !== 'undefined';
  
  const isFullySupported = hasDirectoryPicker && hasIndexedDB;
  
  let reason: string | undefined;
  if (!hasDirectoryPicker) {
    reason = 'Your browser does not support the File System Access API. Try Chrome, Edge, or Samsung Internet on Android.';
  } else if (!hasIndexedDB) {
    reason = 'IndexedDB is not available for persisting access.';
  }
  
  return {
    hasDirectoryPicker,
    hasIndexedDB,
    isFullySupported,
    reason,
  };
}

/**
 * Check if we're running in a context that should use native file system
 * (i.e., not in dev mode with Vite middleware available)
 */
export function shouldUseNativeFileSystem(): boolean {
  // If we're in development with Vite, use the middleware approach
  if (import.meta.env.DEV) {
    return false;
  }
  
  // In production (built PWA), use native file system
  return checkFileSystemSupport().isFullySupported;
}

/**
 * Request directory access from the user
 */
export async function requestDirectoryAccess(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle | null> {
  if (!checkFileSystemSupport().hasDirectoryPicker) {
    throw new Error('File System Access API is not supported in this browser');
  }
  
  try {
    const handle = await window.showDirectoryPicker!({
      id: 'goals-vault',
      mode: 'readwrite',
      startIn: 'documents',
      ...options,
    });
    
    // Store the handle for future sessions
    await storeDirectoryHandle(handle);
    currentDirectoryHandle = handle;
    
    return handle;
  } catch (error) {
    // User cancelled the picker
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }
    throw error;
  }
}

/**
 * Verify and request permission on a stored handle
 */
async function verifyPermission(
  handle: FileSystemDirectoryHandle, 
  readWrite: boolean = true
): Promise<boolean> {
  const options: FileSystemHandlePermissionDescriptor = {
    mode: readWrite ? 'readwrite' : 'read',
  };
  
  // Check if permission methods exist (they may not in some browsers)
  if (!handle.queryPermission || !handle.requestPermission) {
    console.warn('Permission methods not available on FileSystemDirectoryHandle');
    return false;
  }
  
  // Check if permission was already granted
  if ((await handle.queryPermission(options)) === 'granted') {
    return true;
  }
  
  // Request permission - this will show a prompt to the user
  if ((await handle.requestPermission(options)) === 'granted') {
    return true;
  }
  
  return false;
}

/**
 * Get the current vault access state
 */
export async function getVaultAccessState(): Promise<VaultAccessState> {
  try {
    // Check if we have a stored handle
    const hasStored = await hasStoredDirectoryHandle();
    if (!hasStored) {
      return { status: 'not-configured' };
    }
    
    // Get the stored handle
    const handle = await getStoredDirectoryHandle();
    if (!handle) {
      return { status: 'not-configured' };
    }
    
    // Check permission state
    if (!handle.queryPermission) {
      // If queryPermission is not available, assume we need to request
      return { 
        status: 'permission-needed', 
        folderName: handle.name 
      };
    }
    
    const options: FileSystemHandlePermissionDescriptor = { mode: 'readwrite' };
    const permissionState = await handle.queryPermission(options);
    
    if (permissionState === 'granted') {
      currentDirectoryHandle = handle;
      return { 
        status: 'ready', 
        folderName: handle.name 
      };
    }
    
    // Permission needs to be re-requested
    return { 
      status: 'permission-needed', 
      folderName: handle.name 
    };
  } catch (error) {
    return { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Request permission on the stored handle (for returning users)
 */
export async function requestStoredHandlePermission(): Promise<boolean> {
  const handle = await getStoredDirectoryHandle();
  if (!handle) {
    return false;
  }
  
  const hasPermission = await verifyPermission(handle);
  if (hasPermission) {
    currentDirectoryHandle = handle;
  }
  return hasPermission;
}

/**
 * Clear stored access and reset
 */
export async function clearVaultAccess(): Promise<void> {
  currentDirectoryHandle = null;
  await clearStoredDirectoryHandle();
}

/**
 * Get folder name from stored metadata
 */
export async function getStoredFolderName(): Promise<string | null> {
  const metadata = await getStoredHandleMetadata();
  return metadata?.name ?? null;
}

/**
 * Read all goal files from the directory
 */
export async function loadGoalsFromNativeFS(): Promise<Goal[]> {
  if (!currentDirectoryHandle) {
    throw new Error('No directory access. Please select a goals folder first.');
  }
  
  const goals: Goal[] = [];
  
  // Recursively read all .md files from the directory
  await readDirectoryRecursive(currentDirectoryHandle, '', goals);
  
  return goals;
}

/**
 * Recursively read markdown files from a directory
 */
async function readDirectoryRecursive(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string,
  goals: Goal[]
): Promise<void> {
  for await (const entry of dirHandle.values()) {
    const entryPath = basePath ? `${basePath}/${entry.name}` : entry.name;
    
    if (entry.kind === 'directory') {
      // Skip hidden directories
      if (entry.name.startsWith('.')) continue;
      
      // Get the subdirectory handle and recurse
      const subDirHandle = await dirHandle.getDirectoryHandle(entry.name);
      await readDirectoryRecursive(subDirHandle, entryPath, goals);
    } else if (entry.kind === 'file' && entry.name.endsWith('.md')) {
      // Skip category files
      if (entry.name.includes('_category')) continue;
      
      try {
        const fileHandle = await dirHandle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();
        const content = await file.text();
        
        // Extract category from path
        const category = basePath || 'Uncategorized';
        
        // Parse the goal
        const frontmatter = parseFrontmatter(content);
        const goal = frontmatterToGoal(frontmatter, content, entryPath, category);
        goals.push(goal);
      } catch (error) {
        console.warn(`Failed to read file ${entryPath}:`, error);
      }
    }
  }
}

/**
 * Serialize a Goal object back to YAML frontmatter string
 * (Duplicated from fileSystem.service.ts to avoid circular dependencies)
 */
function serializeFrontmatter(goal: Goal): string {
  const lines: string[] = [];
  
  lines.push(`type: ${goal.type}`);
  lines.push(`status: ${goal.status}`);
  lines.push(`startDate: ${goal.startDate}`);
  lines.push(`endDate: ${goal.endDate}`);
  lines.push(`priority: ${goal.priority}`);
  
  // Arrays
  lines.push(`completions: [${goal.completions.join(', ')}]`);
  
  // Subtasks
  if (goal.subtasks && goal.subtasks.length > 0) {
    lines.push('subtasks:');
    goal.subtasks.forEach(st => {
      lines.push(`  - id: ${st.id}`);
      lines.push(`    title: ${st.title}`);
      lines.push(`    completed: ${st.completed}`);
    });
  } else {
    lines.push('subtasks: []');
  }
  
  // Daily Subtask Completions
  if (goal.dailySubtaskCompletions && Object.keys(goal.dailySubtaskCompletions).length > 0) {
    lines.push('dailySubtaskCompletions:');
    Object.entries(goal.dailySubtaskCompletions).forEach(([date, ids]) => {
      if (ids.length > 0) {
        lines.push(`  ${date}: [${ids.join(', ')}]`);
      }
    });
  } else {
    lines.push('dailySubtaskCompletions: {}');
  }

  // Weekly Subtask Completions
  if (goal.weeklySubtaskCompletions && Object.keys(goal.weeklySubtaskCompletions).length > 0) {
    lines.push('weeklySubtaskCompletions:');
    Object.entries(goal.weeklySubtaskCompletions).forEach(([week, ids]) => {
      if (ids.length > 0) {
        lines.push(`  ${week}: [${ids.join(', ')}]`);
      }
    });
  } else {
    lines.push('weeklySubtaskCompletions: {}');
  }
  
  // Monthly Progress
  if (goal.monthlyProgress && Object.keys(goal.monthlyProgress).length > 0) {
    lines.push('monthlyProgress:');
    Object.entries(goal.monthlyProgress).forEach(([key, val]) => {
      lines.push(`  ${key}: ${val}`);
    });
  }
  
  // Recurrence
  if (goal.recurrence) {
    lines.push('recurrence:');
    lines.push(`  frequency: ${goal.recurrence.frequency}`);
    if (goal.recurrence.targetCount !== undefined) {
      lines.push(`  targetCount: ${goal.recurrence.targetCount}`);
    }
    if (goal.recurrence.minimumCount !== undefined) {
      lines.push(`  minimumCount: ${goal.recurrence.minimumCount}`);
    }
    if (goal.recurrence.dayOfMonth !== undefined) {
      lines.push(`  dayOfMonth: ${goal.recurrence.dayOfMonth}`);
    }
    if (goal.recurrence.daysOfWeek && goal.recurrence.daysOfWeek.length > 0) {
      lines.push(`  daysOfWeek: [${goal.recurrence.daysOfWeek.join(', ')}]`);
    }
  }
  
  // Tags
  if (goal.tags && goal.tags.length > 0) {
    lines.push(`tags: [${goal.tags.join(', ')}]`);
  } else {
    lines.push('tags: []');
  }

  return lines.join('\n');
}

// Store original file contents for preserving body during saves
const fileContentCache = new Map<string, string>();

/**
 * Cache file content when loading (for preserving body during saves)
 */
export function cacheFileContent(filePath: string, content: string): void {
  fileContentCache.set(filePath, content);
}

/**
 * Save a goal to the native file system
 */
export async function saveGoalToNativeFS(goal: Goal): Promise<void> {
  if (!currentDirectoryHandle) {
    throw new Error('No directory access. Please select a goals folder first.');
  }
  
  // Parse the file path to get directory and filename
  const pathParts = goal.filePath.split('/');
  const fileName = pathParts.pop()!;
  
  // Navigate to the correct subdirectory
  let targetDir = currentDirectoryHandle;
  for (const part of pathParts) {
    try {
      targetDir = await targetDir.getDirectoryHandle(part);
    } catch {
      // Directory doesn't exist, create it
      targetDir = await targetDir.getDirectoryHandle(part, { create: true });
    }
  }
  
  // Get original content to preserve body
  let body = '';
  const originalContent = fileContentCache.get(goal.filePath);
  
  if (originalContent) {
    const parts = originalContent.split('---');
    if (parts.length >= 3) {
      body = parts.slice(2).join('---');
      if (body.startsWith('\n')) body = body.substring(1);
    }
  } else {
    // Try to read the existing file to preserve body
    try {
      const fileHandle = await targetDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const content = await file.text();
      const parts = content.split('---');
      if (parts.length >= 3) {
        body = parts.slice(2).join('---');
        if (body.startsWith('\n')) body = body.substring(1);
      }
    } catch {
      // File doesn't exist yet, use empty body
      body = `\n# ${goal.title}\n\n${goal.description || ''}\n`;
    }
  }
  
  // Build new content
  const newFrontmatter = serializeFrontmatter(goal);
  const newContent = `---\n${newFrontmatter}\n---\n${body}`;
  
  // Update cache
  fileContentCache.set(goal.filePath, newContent);
  
  // Write to file
  const fileHandle = await targetDir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(newContent);
  await writable.close();
}

// Debounce map for save operations
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
const SAVE_DEBOUNCE_MS = 300;

/**
 * Save goal with debouncing (to prevent rapid writes)
 */
export function saveGoalToNativeFSDebounced(goal: Goal): void {
  const existingTimer = saveTimers.get(goal.id);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  
  const timer = setTimeout(() => {
    saveTimers.delete(goal.id);
    saveGoalToNativeFS(goal).catch(err => {
      console.error('Failed to save goal to native FS:', err);
    });
  }, SAVE_DEBOUNCE_MS);
  
  saveTimers.set(goal.id, timer);
}
