// Re-export specific functions from fileSystem.service (avoid saveGoal conflict)
export { 
  parseFrontmatter, 
  frontmatterToGoal, 
  registerGoalFiles, 
  loadGoalsFromFiles,
} from './fileSystem.service';

export * from './handleStorage.service';

// Re-export specific functions from nativeFileSystem.service (avoid conflicts with storage.service)
export { 
  checkFileSystemSupport,
  shouldUseNativeFileSystem,
  requestDirectoryAccess,
  getVaultAccessState,
  requestStoredHandlePermission,
  clearVaultAccess,
  getStoredFolderName,
  loadGoalsFromNativeFS,
  cacheFileContent,
} from './nativeFileSystem.service';

// Export storage adapter as the primary mechanism
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
  getRawGoalContent,
  saveRawGoalContent,
  type StorageMode,
  type StorageState,
} from './storage.service';
