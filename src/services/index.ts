// Re-export specific functions from fileSystem.service (avoid saveGoal conflict)
export { 
  parseFrontmatter, 
  frontmatterToGoal, 
  goalToMarkdown,
  serializeFrontmatter,
} from './fileSystem.service';
export {
  getPlatformInfo,
  isNativeApp,
  supportsPWAFeatures,
  type PlatformInfo,
} from './platform.service';

// Export storage adapter as the primary mechanism
export { 
  saveGoal,
  deleteGoal,
  loadGoals, 
  initializeStorage,
  getStorageMode,
  isInAppStorageMode,
  type StorageMode,
  type StorageState,
} from './storage.service';

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
