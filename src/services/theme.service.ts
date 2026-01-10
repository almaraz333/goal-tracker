/**
 * Theme service
 * 
 * Handles theme persistence to localStorage and applying themes to the DOM.
 */

import type { Theme, ThemeColors } from '@/types';
import { presetThemes, getDefaultTheme } from '@/config/themes';

const THEME_STORAGE_KEY = 'goaltracker_theme';
const CUSTOM_THEMES_KEY = 'goaltracker_custom_themes';

/**
 * Apply a theme's colors to the document root as CSS variables
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const colors = theme.colors;
  
  // Background colors
  root.style.setProperty('--bg-primary', colors.bgPrimary);
  root.style.setProperty('--bg-secondary', colors.bgSecondary);
  root.style.setProperty('--bg-tertiary', colors.bgTertiary);
  root.style.setProperty('--bg-card', colors.bgCard);
  root.style.setProperty('--bg-input', colors.bgInput);
  root.style.setProperty('--bg-hover', colors.bgHover);
  
  // Text colors
  root.style.setProperty('--text-primary', colors.textPrimary);
  root.style.setProperty('--text-secondary', colors.textSecondary);
  root.style.setProperty('--text-muted', colors.textMuted);
  root.style.setProperty('--text-inverse', colors.textInverse);
  
  // Accent colors
  root.style.setProperty('--accent-primary', colors.accentPrimary);
  root.style.setProperty('--accent-primary-hover', colors.accentPrimaryHover);
  root.style.setProperty('--accent-secondary', colors.accentSecondary);
  
  // Border colors
  root.style.setProperty('--border-primary', colors.borderPrimary);
  root.style.setProperty('--border-secondary', colors.borderSecondary);
  root.style.setProperty('--border-focus', colors.borderFocus);
  
  // Status colors - Success
  root.style.setProperty('--status-success', colors.statusSuccess);
  root.style.setProperty('--status-success-bg', colors.statusSuccessBg);
  root.style.setProperty('--status-success-border', colors.statusSuccessBorder);
  
  // Status colors - Warning
  root.style.setProperty('--status-warning', colors.statusWarning);
  root.style.setProperty('--status-warning-bg', colors.statusWarningBg);
  root.style.setProperty('--status-warning-border', colors.statusWarningBorder);
  
  // Status colors - Danger
  root.style.setProperty('--status-danger', colors.statusDanger);
  root.style.setProperty('--status-danger-bg', colors.statusDangerBg);
  root.style.setProperty('--status-danger-border', colors.statusDangerBorder);
  
  // Status colors - Info
  root.style.setProperty('--status-info', colors.statusInfo);
  root.style.setProperty('--status-info-bg', colors.statusInfoBg);
  root.style.setProperty('--status-info-border', colors.statusInfoBorder);
  
  // Calendar colors
  root.style.setProperty('--calendar-today', colors.calendarToday);
  root.style.setProperty('--calendar-selected', colors.calendarSelected);
  root.style.setProperty('--calendar-weekend', colors.calendarWeekend);
  
  // Progress colors
  root.style.setProperty('--progress-complete', colors.progressComplete);
  root.style.setProperty('--progress-partial', colors.progressPartial);
  root.style.setProperty('--progress-empty', colors.progressEmpty);
  
  // Legacy variables (for backward compatibility)
  root.style.setProperty('--color-success', colors.statusSuccess);
  root.style.setProperty('--color-warning', colors.statusWarning);
  root.style.setProperty('--color-danger', colors.statusDanger);
  root.style.setProperty('--color-neutral', colors.textMuted);
}

/**
 * Get the stored theme ID from localStorage
 */
export function getStoredThemeId(): string {
  if (typeof window === 'undefined') return 'default-dark';
  return localStorage.getItem(THEME_STORAGE_KEY) ?? 'default-dark';
}

/**
 * Store the active theme ID in localStorage
 */
export function setStoredThemeId(themeId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
}

/**
 * Get custom themes from localStorage
 */
export function getStoredCustomThemes(): Theme[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CUSTOM_THEMES_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Theme[];
  } catch {
    return [];
  }
}

/**
 * Store custom themes in localStorage
 */
export function setStoredCustomThemes(themes: Theme[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
}

/**
 * Get all available themes (presets + custom)
 */
export function getAllThemes(): Theme[] {
  return [...presetThemes, ...getStoredCustomThemes()];
}

/**
 * Get a theme by ID (checks both presets and custom)
 */
export function getThemeById(themeId: string): Theme | undefined {
  return getAllThemes().find(t => t.id === themeId);
}

/**
 * Initialize the theme on app load
 * This should be called as early as possible to prevent flash of default theme
 */
export function initializeTheme(): Theme {
  const themeId = getStoredThemeId();
  const theme = getThemeById(themeId) ?? getDefaultTheme();
  applyTheme(theme);
  return theme;
}

/**
 * Create a new custom theme based on an existing theme
 */
export function createCustomTheme(
  name: string, 
  baseTheme: Theme, 
  colorOverrides: Partial<ThemeColors>
): Theme {
  return {
    id: `custom-${Date.now()}`,
    name,
    colors: { ...baseTheme.colors, ...colorOverrides },
    isBuiltin: false,
  };
}

/**
 * Save a custom theme
 */
export function saveCustomTheme(theme: Theme): void {
  const customThemes = getStoredCustomThemes();
  const existingIndex = customThemes.findIndex(t => t.id === theme.id);
  
  if (existingIndex >= 0) {
    customThemes[existingIndex] = theme;
  } else {
    customThemes.push(theme);
  }
  
  setStoredCustomThemes(customThemes);
}

/**
 * Delete a custom theme
 */
export function deleteCustomTheme(themeId: string): void {
  const customThemes = getStoredCustomThemes();
  const filtered = customThemes.filter(t => t.id !== themeId);
  setStoredCustomThemes(filtered);
}
