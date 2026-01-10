/**
 * Predefined theme presets
 * 
 * Contains all built-in themes with complete color definitions.
 */

import type { Theme, ThemeColors } from '@/types';

/**
 * Default Dark theme - the original color scheme
 */
const defaultDarkColors: ThemeColors = {
  // Background colors
  bgPrimary: '#111827',       // gray-900
  bgSecondary: '#1f2937',     // gray-800
  bgTertiary: '#374151',      // gray-700
  bgCard: '#1f2937',          // gray-800
  bgInput: '#111827',         // gray-900
  bgHover: '#374151',         // gray-700
  
  // Text colors
  textPrimary: '#f3f4f6',     // gray-100
  textSecondary: '#d1d5db',   // gray-300
  textMuted: '#6b7280',       // gray-500
  textInverse: '#111827',     // gray-900
  
  // Accent colors
  accentPrimary: '#2563eb',   // blue-600
  accentPrimaryHover: '#1d4ed8', // blue-700
  accentSecondary: '#8b5cf6', // violet-500
  
  // Border colors
  borderPrimary: '#374151',   // gray-700
  borderSecondary: '#4b5563', // gray-600
  borderFocus: '#3b82f6',     // blue-500
  
  // Status colors
  statusSuccess: '#22c55e',
  statusSuccessBg: 'rgba(34, 197, 94, 0.2)',
  statusSuccessBorder: '#15803d',
  statusWarning: '#f59e0b',
  statusWarningBg: 'rgba(245, 158, 11, 0.2)',
  statusWarningBorder: '#b45309',
  statusDanger: '#ef4444',
  statusDangerBg: 'rgba(239, 68, 68, 0.2)',
  statusDangerBorder: '#b91c1c',
  statusInfo: '#3b82f6',
  statusInfoBg: 'rgba(59, 130, 246, 0.2)',
  statusInfoBorder: '#1d4ed8',
  
  // Calendar colors
  calendarToday: '#3b82f6',
  calendarSelected: '#8b5cf6',
  calendarWeekend: '#374151',
  
  // Progress colors
  progressComplete: '#22c55e',
  progressPartial: '#eab308',
  progressEmpty: '#374151',
};

/**
 * Light theme
 */
const lightColors: ThemeColors = {
  // Background colors
  bgPrimary: '#ffffff',
  bgSecondary: '#f9fafb',     // gray-50
  bgTertiary: '#f3f4f6',      // gray-100
  bgCard: '#ffffff',
  bgInput: '#ffffff',
  bgHover: '#e5e7eb',         // gray-200
  
  // Text colors
  textPrimary: '#111827',     // gray-900
  textSecondary: '#374151',   // gray-700
  textMuted: '#6b7280',       // gray-500
  textInverse: '#ffffff',
  
  // Accent colors
  accentPrimary: '#2563eb',   // blue-600
  accentPrimaryHover: '#1d4ed8', // blue-700
  accentSecondary: '#7c3aed', // violet-600
  
  // Border colors
  borderPrimary: '#e5e7eb',   // gray-200
  borderSecondary: '#d1d5db', // gray-300
  borderFocus: '#3b82f6',     // blue-500
  
  // Status colors
  statusSuccess: '#16a34a',   // green-600
  statusSuccessBg: 'rgba(22, 163, 74, 0.1)',
  statusSuccessBorder: '#22c55e',
  statusWarning: '#d97706',   // amber-600
  statusWarningBg: 'rgba(217, 119, 6, 0.1)',
  statusWarningBorder: '#f59e0b',
  statusDanger: '#dc2626',    // red-600
  statusDangerBg: 'rgba(220, 38, 38, 0.1)',
  statusDangerBorder: '#ef4444',
  statusInfo: '#2563eb',      // blue-600
  statusInfoBg: 'rgba(37, 99, 235, 0.1)',
  statusInfoBorder: '#3b82f6',
  
  // Calendar colors
  calendarToday: '#2563eb',
  calendarSelected: '#7c3aed',
  calendarWeekend: '#f3f4f6',
  
  // Progress colors
  progressComplete: '#16a34a',
  progressPartial: '#ca8a04',
  progressEmpty: '#e5e7eb',
};

/**
 * Ocean Blue theme - deep blue tones
 */
const oceanBlueColors: ThemeColors = {
  // Background colors
  bgPrimary: '#0c1929',
  bgSecondary: '#132337',
  bgTertiary: '#1e3a5f',
  bgCard: '#132337',
  bgInput: '#0c1929',
  bgHover: '#1e3a5f',
  
  // Text colors
  textPrimary: '#e0f2fe',     // sky-100
  textSecondary: '#bae6fd',   // sky-200
  textMuted: '#7dd3fc',       // sky-300
  textInverse: '#0c1929',
  
  // Accent colors
  accentPrimary: '#0ea5e9',   // sky-500
  accentPrimaryHover: '#0284c7', // sky-600
  accentSecondary: '#38bdf8', // sky-400
  
  // Border colors
  borderPrimary: '#1e3a5f',
  borderSecondary: '#2d4a6f',
  borderFocus: '#0ea5e9',
  
  // Status colors
  statusSuccess: '#34d399',   // emerald-400
  statusSuccessBg: 'rgba(52, 211, 153, 0.2)',
  statusSuccessBorder: '#10b981',
  statusWarning: '#fbbf24',   // amber-400
  statusWarningBg: 'rgba(251, 191, 36, 0.2)',
  statusWarningBorder: '#f59e0b',
  statusDanger: '#f87171',    // red-400
  statusDangerBg: 'rgba(248, 113, 113, 0.2)',
  statusDangerBorder: '#ef4444',
  statusInfo: '#38bdf8',      // sky-400
  statusInfoBg: 'rgba(56, 189, 248, 0.2)',
  statusInfoBorder: '#0ea5e9',
  
  // Calendar colors
  calendarToday: '#0ea5e9',
  calendarSelected: '#38bdf8',
  calendarWeekend: '#1e3a5f',
  
  // Progress colors
  progressComplete: '#34d399',
  progressPartial: '#fbbf24',
  progressEmpty: '#1e3a5f',
};

/**
 * Forest Green theme - natural earth tones
 */
const forestGreenColors: ThemeColors = {
  // Background colors
  bgPrimary: '#0f1a14',
  bgSecondary: '#172920',
  bgTertiary: '#1f3a2d',
  bgCard: '#172920',
  bgInput: '#0f1a14',
  bgHover: '#1f3a2d',
  
  // Text colors
  textPrimary: '#ecfdf5',     // emerald-50
  textSecondary: '#d1fae5',   // emerald-100
  textMuted: '#6ee7b7',       // emerald-300
  textInverse: '#0f1a14',
  
  // Accent colors
  accentPrimary: '#10b981',   // emerald-500
  accentPrimaryHover: '#059669', // emerald-600
  accentSecondary: '#34d399', // emerald-400
  
  // Border colors
  borderPrimary: '#1f3a2d',
  borderSecondary: '#2d4f3c',
  borderFocus: '#10b981',
  
  // Status colors
  statusSuccess: '#34d399',
  statusSuccessBg: 'rgba(52, 211, 153, 0.2)',
  statusSuccessBorder: '#10b981',
  statusWarning: '#fbbf24',
  statusWarningBg: 'rgba(251, 191, 36, 0.2)',
  statusWarningBorder: '#f59e0b',
  statusDanger: '#f87171',
  statusDangerBg: 'rgba(248, 113, 113, 0.2)',
  statusDangerBorder: '#ef4444',
  statusInfo: '#38bdf8',
  statusInfoBg: 'rgba(56, 189, 248, 0.2)',
  statusInfoBorder: '#0ea5e9',
  
  // Calendar colors
  calendarToday: '#10b981',
  calendarSelected: '#34d399',
  calendarWeekend: '#1f3a2d',
  
  // Progress colors
  progressComplete: '#34d399',
  progressPartial: '#fbbf24',
  progressEmpty: '#1f3a2d',
};

/**
 * Sunset Orange theme - warm sunset tones
 */
const sunsetOrangeColors: ThemeColors = {
  // Background colors
  bgPrimary: '#1c1412',
  bgSecondary: '#2a1f1a',
  bgTertiary: '#3d2c24',
  bgCard: '#2a1f1a',
  bgInput: '#1c1412',
  bgHover: '#3d2c24',
  
  // Text colors
  textPrimary: '#fff7ed',     // orange-50
  textSecondary: '#fed7aa',   // orange-200
  textMuted: '#fdba74',       // orange-300
  textInverse: '#1c1412',
  
  // Accent colors
  accentPrimary: '#f97316',   // orange-500
  accentPrimaryHover: '#ea580c', // orange-600
  accentSecondary: '#fb923c', // orange-400
  
  // Border colors
  borderPrimary: '#3d2c24',
  borderSecondary: '#5c4438',
  borderFocus: '#f97316',
  
  // Status colors
  statusSuccess: '#4ade80',   // green-400
  statusSuccessBg: 'rgba(74, 222, 128, 0.2)',
  statusSuccessBorder: '#22c55e',
  statusWarning: '#fbbf24',
  statusWarningBg: 'rgba(251, 191, 36, 0.2)',
  statusWarningBorder: '#f59e0b',
  statusDanger: '#f87171',
  statusDangerBg: 'rgba(248, 113, 113, 0.2)',
  statusDangerBorder: '#ef4444',
  statusInfo: '#60a5fa',      // blue-400
  statusInfoBg: 'rgba(96, 165, 250, 0.2)',
  statusInfoBorder: '#3b82f6',
  
  // Calendar colors
  calendarToday: '#f97316',
  calendarSelected: '#fb923c',
  calendarWeekend: '#3d2c24',
  
  // Progress colors
  progressComplete: '#4ade80',
  progressPartial: '#fbbf24',
  progressEmpty: '#3d2c24',
};

/**
 * All preset themes
 */
export const presetThemes: Theme[] = [
  {
    id: 'default-dark',
    name: 'Default Dark',
    colors: defaultDarkColors,
    isBuiltin: true,
  },
  {
    id: 'light',
    name: 'Light',
    colors: lightColors,
    isBuiltin: true,
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    colors: oceanBlueColors,
    isBuiltin: true,
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    colors: forestGreenColors,
    isBuiltin: true,
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    colors: sunsetOrangeColors,
    isBuiltin: true,
  },
];

/**
 * Get a preset theme by ID
 */
export function getPresetTheme(id: string): Theme | undefined {
  return presetThemes.find(t => t.id === id);
}

/**
 * Get the default theme
 */
export function getDefaultTheme(): Theme {
  return presetThemes[0]; // default-dark
}
