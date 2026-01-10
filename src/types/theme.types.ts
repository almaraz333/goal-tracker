/**
 * Theme system type definitions
 * 
 * Defines the structure for themes, including all semantic color categories
 * used throughout the application.
 */

/**
 * Complete theme color palette
 * All colors are CSS color values (hex, rgb, hsl, etc.)
 */
export interface ThemeColors {
  // Background colors
  bgPrimary: string;      // Main app background (e.g., body, full-screen views)
  bgSecondary: string;    // Slightly elevated surfaces (e.g., header, cards)
  bgTertiary: string;     // Even more elevated or interactive elements
  bgCard: string;         // Card backgrounds
  bgInput: string;        // Form input backgrounds
  bgHover: string;        // Hover states for interactive elements
  
  // Text colors
  textPrimary: string;    // Main text (high contrast)
  textSecondary: string;  // Secondary text (medium contrast)
  textMuted: string;      // Muted/disabled text (low contrast)
  textInverse: string;    // Text on colored backgrounds
  
  // Accent colors
  accentPrimary: string;  // Primary brand/action color (e.g., buttons, links)
  accentPrimaryHover: string;
  accentSecondary: string; // Secondary accent for highlights
  
  // Border colors
  borderPrimary: string;  // Standard borders
  borderSecondary: string; // Subtle borders
  borderFocus: string;    // Focus ring color
  
  // Status colors (semantic)
  statusSuccess: string;
  statusSuccessBg: string;
  statusSuccessBorder: string;
  statusWarning: string;
  statusWarningBg: string;
  statusWarningBorder: string;
  statusDanger: string;
  statusDangerBg: string;
  statusDangerBorder: string;
  statusInfo: string;
  statusInfoBg: string;
  statusInfoBorder: string;
  
  // Calendar-specific colors
  calendarToday: string;
  calendarSelected: string;
  calendarWeekend: string;
  
  // Progress colors
  progressComplete: string;
  progressPartial: string;
  progressEmpty: string;
}

/**
 * Theme definition
 */
export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  isBuiltin: boolean;  // true for preset themes, false for user-created
}

/**
 * IDs for built-in theme presets
 */
export type ThemePresetId = 
  | 'default-dark'
  | 'light'
  | 'ocean-blue'
  | 'forest-green'
  | 'sunset-orange';

/**
 * Stored theme data for persistence
 */
export interface StoredThemeData {
  activeThemeId: string;
  customThemes: Theme[];
}

/**
 * Theme context state for the app store
 */
export interface ThemeState {
  activeThemeId: string;
  customThemes: Theme[];
}

/**
 * Theme-related actions for the app store
 */
export interface ThemeActions {
  setTheme: (themeId: string) => void;
  saveCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (themeId: string) => void;
  getActiveTheme: () => Theme | undefined;
}
