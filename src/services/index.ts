// Re-export specific functions from fileSystem.service (avoid saveGoal conflict)
export { 
  parseFrontmatter, 
  frontmatterToGoal, 
  registerGoalFiles, 
  loadGoalsFromFiles,
  goalToMarkdown,
  serializeFrontmatter,
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
  deleteGoal,
  loadGoals, 
  initializeStorage,
  reinitializeStorage,
  getStorageMode,
  determineStorageMode,
  needsStorageChoice,
  getStorageState,
  requestFolderAccess,
  requestStoredPermission,
  clearFolderAccess,
  requiresUserAction,
  getRawGoalContent,
  getRawGoalContentAsync,
  saveRawGoalContent,
  isInAppStorageMode,
  isExternalFolderMode,
  isCapacitorMode,
  flushPendingWrites,
  type StorageMode,
  type StorageState,
} from './storage.service';

// Platform service exports
export {
  isNativePlatform,
  isIOS,
  isAndroid,
  isWeb,
  getPlatform,
  getPlatformCapabilities,
  canAccessExternalFolders,
  getRecommendedStorageMode,
  logPlatformInfo,
  type Platform,
  type PlatformCapabilities,
} from './platform.service';

// Capacitor file system exports (for direct access when needed)
export {
  pickFolder as pickCapacitorFolder,
  setVaultPath as setCapacitorVaultPath,
  hasVaultConfigured as hasCapacitorVaultConfigured,
  requestStoragePermissions,
} from './capacitorFileSystem.service';

// Theme service exports
export {
  applyTheme,
  getStoredThemeId,
  setStoredThemeId,
  getStoredCustomThemes,
  setStoredCustomThemes,
  getAllThemes,
  getThemeById,
  initializeTheme,
  createCustomTheme,
  saveCustomTheme,
  deleteCustomTheme,
} from './theme.service';
