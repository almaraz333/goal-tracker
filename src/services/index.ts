// Re-export specific functions from fileSystem.service (avoid saveGoal conflict)
export { 
  parseFrontmatter, 
  frontmatterToGoal, 
  registerGoalFiles, 
  loadGoalsFromFiles,
} from './fileSystem.service';

export * from './handleStorage.service';
export * from './nativeFileSystem.service';

// Export storage adapter as the primary save mechanism
export { 
  saveGoal, 
  loadGoals, 
  initializeStorage, 
  getStorageMode, 
  getStorageState,
  requestFolderAccess,
  requestStoredPermission,
  clearFolderAccess,
  requiresUserAction,
  type StorageMode,
  type StorageState,
} from './storage.service';
