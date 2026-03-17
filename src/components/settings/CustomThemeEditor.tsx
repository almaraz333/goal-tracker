/**
 * CustomThemeEditor component
 *
 * Creates or edits custom themes using a small set of core color controls.
 * Dependent tokens are derived automatically so the saved theme stays complete.
 */

import { useMemo, useState } from 'react';
import { ArrowLeft, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui';
import { getDefaultTheme, presetThemes } from '@/config';
import { useThemeState } from '@/store';
import type { Theme, ThemeColors } from '@/types';

interface CustomThemeEditorProps {
  editingTheme?: Theme;
  onClose: () => void;
}

interface EditorColorGroup {
  label: string;
  description: string;
  colors: { key: keyof ThemeEditorColors; label: string; hint: string }[];
}

interface ThemeEditorColors {
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  calendarAccent: string;
  statusSuccess: string;
  statusWarning: string;
  statusDanger: string;
  statusInfo: string;
}

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const coreColorGroups: EditorColorGroup[] = [
  {
    label: 'Surfaces',
    description: 'Controls the overall app background and elevated panels.',
    colors: [
      { key: 'bgPrimary', label: 'App Background', hint: 'Main canvas behind the whole app' },
      { key: 'bgSecondary', label: 'Surface', hint: 'Calendar grid, panels, and raised sections' },
      { key: 'bgCard', label: 'Card', hint: 'Cards and modal bodies' },
    ],
  },
  {
    label: 'Typography',
    description: 'Sets the main reading contrast and supporting text tone.',
    colors: [
      { key: 'textPrimary', label: 'Primary Text', hint: 'Headers and most body copy' },
      { key: 'textSecondary', label: 'Secondary Text', hint: 'Supporting labels and metadata' },
      { key: 'textMuted', label: 'Muted Text', hint: 'Subtle helper text and low-emphasis copy' },
    ],
  },
  {
    label: 'Highlights',
    description: 'Defines the app accent and the calendar emphasis colors.',
    colors: [
      { key: 'accentPrimary', label: 'Primary Accent', hint: 'Buttons, focus states, and key actions' },
      { key: 'accentSecondary', label: 'Secondary Accent', hint: 'Secondary highlights and contrast accents' },
      { key: 'calendarAccent', label: 'Calendar Accent', hint: 'Today and selected-day emphasis in the calendar' },
    ],
  },
];

const advancedColorGroups: EditorColorGroup[] = [
  {
    label: 'Semantic Colors',
    description: 'Optional tuning for success, warning, danger, and info states.',
    colors: [
      { key: 'statusSuccess', label: 'Success', hint: 'Completed states and positive confirmation' },
      { key: 'statusWarning', label: 'Warning', hint: 'Partial progress and caution states' },
      { key: 'statusDanger', label: 'Danger', hint: 'Errors and destructive actions' },
      { key: 'statusInfo', label: 'Info', hint: 'Informational highlights and neutral notices' },
    ],
  },
];

function isHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value.trim());
}

function normalizeHex(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!isHexColor(trimmed)) {
    return fallback;
  }

  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return trimmed.toLowerCase();
}

function hexToRgb(value: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(value, '#000000');
  const hex = normalized.slice(1);

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mixColors(baseColor: string, targetColor: string, ratio: number): string {
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  const base = hexToRgb(baseColor);
  const target = hexToRgb(targetColor);

  return rgbToHex(
    base.r + (target.r - base.r) * clampedRatio,
    base.g + (target.g - base.g) * clampedRatio,
    base.b + (target.b - base.b) * clampedRatio
  );
}

function withAlpha(color: string, alpha: number): string {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getLuminance(color: string): number {
  const { r, g, b } = hexToRgb(color);
  const [red, green, blue] = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getInverseTextColor(backgroundColor: string): string {
  return getLuminance(backgroundColor) > 0.45 ? '#111827' : '#f9fafb';
}

function buildEditorColors(theme: Theme): ThemeEditorColors {
  return {
    bgPrimary: theme.colors.bgPrimary,
    bgSecondary: theme.colors.bgSecondary,
    bgCard: theme.colors.bgCard,
    textPrimary: theme.colors.textPrimary,
    textSecondary: theme.colors.textSecondary,
    textMuted: theme.colors.textMuted,
    accentPrimary: theme.colors.accentPrimary,
    accentSecondary: theme.colors.accentSecondary,
    calendarAccent: theme.colors.calendarToday,
    statusSuccess: theme.colors.statusSuccess,
    statusWarning: theme.colors.statusWarning,
    statusDanger: theme.colors.statusDanger,
    statusInfo: theme.colors.statusInfo,
  };
}

function buildThemeColors(editorColors: ThemeEditorColors): ThemeColors {
  const defaultColors = getDefaultTheme().colors;

  const bgPrimary = normalizeHex(editorColors.bgPrimary, defaultColors.bgPrimary);
  const bgSecondary = normalizeHex(editorColors.bgSecondary, defaultColors.bgSecondary);
  const bgCard = normalizeHex(editorColors.bgCard, defaultColors.bgCard);
  const textPrimary = normalizeHex(editorColors.textPrimary, defaultColors.textPrimary);
  const textSecondary = normalizeHex(editorColors.textSecondary, defaultColors.textSecondary);
  const textMuted = normalizeHex(editorColors.textMuted, defaultColors.textMuted);
  const accentPrimary = normalizeHex(editorColors.accentPrimary, defaultColors.accentPrimary);
  const accentSecondary = normalizeHex(editorColors.accentSecondary, defaultColors.accentSecondary);
  const calendarAccent = normalizeHex(editorColors.calendarAccent, defaultColors.calendarToday);
  const statusSuccess = normalizeHex(editorColors.statusSuccess, defaultColors.statusSuccess);
  const statusWarning = normalizeHex(editorColors.statusWarning, defaultColors.statusWarning);
  const statusDanger = normalizeHex(editorColors.statusDanger, defaultColors.statusDanger);
  const statusInfo = normalizeHex(editorColors.statusInfo, defaultColors.statusInfo);

  const bgTertiary = mixColors(bgSecondary, textPrimary, 0.12);
  const bgInput = mixColors(bgPrimary, bgCard, 0.35);
  const bgHover = mixColors(bgSecondary, textPrimary, 0.08);
  const accentPrimaryHover = mixColors(accentPrimary, '#000000', 0.16);
  const borderPrimary = mixColors(bgSecondary, textPrimary, 0.18);
  const borderSecondary = mixColors(bgSecondary, textPrimary, 0.28);
  const calendarSelected = mixColors(calendarAccent, accentSecondary, 0.45);
  const calendarWeekend = mixColors(bgSecondary, calendarAccent, 0.12);

  return {
    bgPrimary,
    bgSecondary,
    bgTertiary,
    bgCard,
    bgInput,
    bgHover,
    textPrimary,
    textSecondary,
    textMuted,
    textInverse: getInverseTextColor(accentPrimary),
    accentPrimary,
    accentPrimaryHover,
    accentSecondary,
    borderPrimary,
    borderSecondary,
    borderFocus: accentPrimary,
    statusSuccess,
    statusSuccessBg: withAlpha(statusSuccess, 0.18),
    statusSuccessBorder: mixColors(statusSuccess, '#000000', 0.26),
    statusWarning,
    statusWarningBg: withAlpha(statusWarning, 0.18),
    statusWarningBorder: mixColors(statusWarning, '#000000', 0.26),
    statusDanger,
    statusDangerBg: withAlpha(statusDanger, 0.18),
    statusDangerBorder: mixColors(statusDanger, '#000000', 0.26),
    statusInfo,
    statusInfoBg: withAlpha(statusInfo, 0.18),
    statusInfoBorder: mixColors(statusInfo, '#000000', 0.26),
    calendarToday: calendarAccent,
    calendarSelected,
    calendarWeekend,
    progressComplete: statusSuccess,
    progressPartial: statusWarning,
    progressEmpty: borderPrimary,
  };
}

export function CustomThemeEditor({ editingTheme, onClose }: CustomThemeEditorProps) {
  const { saveCustomTheme, setTheme } = useThemeState();

  const baseTheme = editingTheme ?? getDefaultTheme();

  const [themeName, setThemeName] = useState(
    editingTheme ? editingTheme.name : 'My Custom Theme'
  );
  const [editorColors, setEditorColors] = useState<ThemeEditorColors>(() => buildEditorColors(baseTheme));
  const [basePresetId, setBasePresetId] = useState<string>(
    editingTheme?.isBuiltin === false ? 'default-dark' : baseTheme.id
  );
  const [showAdvancedColors, setShowAdvancedColors] = useState(false);

  const previewColors = useMemo(() => buildThemeColors(editorColors), [editorColors]);

  const handleColorChange = (key: keyof ThemeEditorColors, value: string) => {
    setEditorColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetToBase = () => {
    const preset = presetThemes.find(t => t.id === basePresetId) ?? getDefaultTheme();
    setEditorColors(buildEditorColors(preset));
  };

  const handleSave = () => {
    const newTheme: Theme = {
      id: editingTheme?.id ?? `custom-${Date.now()}`,
      name: themeName.trim() || 'My Custom Theme',
      colors: previewColors,
      isBuiltin: false,
    };
    
    saveCustomTheme(newTheme);
    setTheme(newTheme.id);
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border-primary">
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-bg-hover transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-text-secondary" />
        </button>
        <h3 className="text-lg font-semibold text-text-primary">
          {editingTheme ? 'Edit Theme' : 'Create Custom Theme'}
        </h3>
      </div>

      {/* Theme name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Theme Name
        </label>
        <input
          type="text"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          className="w-full px-3 py-2 bg-bg-input border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-border-focus"
          placeholder="My Custom Theme"
        />
      </div>

      {/* Base preset selector */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Start from preset
        </label>
        <div className="flex gap-2 flex-wrap">
          {presetThemes.map(preset => (
            <button
              key={preset.id}
              onClick={() => {
                setBasePresetId(preset.id);
                setEditorColors(buildEditorColors(preset));
              }}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                basePresetId === preset.id
                  ? 'bg-accent-primary text-text-inverse'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-hover'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <ThemePreviewCard
        themeName={themeName.trim() || 'My Custom Theme'}
        colors={previewColors}
      />

      <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
        {coreColorGroups.map((group) => (
          <ColorGroupSection
            key={group.label}
            group={group}
            editorColors={editorColors}
            onColorChange={handleColorChange}
          />
        ))}

        <div className="rounded-xl border border-border-primary overflow-hidden">
          <button
            onClick={() => setShowAdvancedColors((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 bg-bg-secondary hover:bg-bg-hover transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">Advanced semantic colors</p>
              <p className="text-xs text-text-muted">
                Optional overrides for success, warning, danger, and info states.
              </p>
            </div>
            <span className="text-xs font-medium text-text-secondary">
              {showAdvancedColors ? 'Hide' : 'Show'}
            </span>
          </button>

          {showAdvancedColors && (
            <div className="p-4 bg-bg-card border-t border-border-primary space-y-4">
              {advancedColorGroups.map((group) => (
                <ColorGroupSection
                  key={group.label}
                  group={group}
                  editorColors={editorColors}
                  onColorChange={handleColorChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-bg-secondary/50 border border-border-primary px-3 py-2">
        <p className="text-xs text-text-muted">
          The editor keeps the theme simple by deriving hover states, borders, progress colors, and the full calendar palette from the colors above.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-border-primary">
        <Button variant="ghost" onClick={handleResetToBase} leftIcon={<RotateCcw className="h-4 w-4" />}>
          Reset
        </Button>
        <div className="flex-1" />
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} leftIcon={<Save className="h-4 w-4" />}>
          Save Theme
        </Button>
      </div>
    </div>
  );
}

interface ColorGroupSectionProps {
  group: EditorColorGroup;
  editorColors: ThemeEditorColors;
  onColorChange: (key: keyof ThemeEditorColors, value: string) => void;
}

function ColorGroupSection({ group, editorColors, onColorChange }: ColorGroupSectionProps) {
  return (
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-medium text-text-primary">{group.label}</h4>
        <p className="text-xs text-text-muted mt-1">{group.description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {group.colors.map(({ key, label, hint }) => (
          <ColorField
            key={key}
            label={label}
            hint={hint}
            value={editorColors[key]}
            onChange={(value) => onColorChange(key, value)}
          />
        ))}
      </div>
    </div>
  );
}

interface ThemePreviewCardProps {
  themeName: string;
  colors: ThemeColors;
}

function ThemePreviewCard({ themeName, colors }: ThemePreviewCardProps) {
  return (
    <div className="rounded-xl border border-border-primary p-4 space-y-4" style={{ backgroundColor: colors.bgPrimary }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{themeName}</p>
          <p className="text-xs" style={{ color: colors.textMuted }}>Live preview</p>
        </div>
        <button
          className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: colors.accentPrimary,
            color: colors.textInverse,
          }}
          type="button"
        >
          Primary Action
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-lg border p-3"
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.borderPrimary,
          }}
        >
          <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>Card Surface</p>
          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Cards, lists, and modal sections</p>
        </div>

        <div
          className="rounded-lg border p-3"
          style={{
            backgroundColor: colors.bgSecondary,
            borderColor: colors.borderPrimary,
          }}
        >
          <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>Calendar Mood</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px] font-medium">
            <PreviewDay label="Weekend" background={colors.calendarWeekend} textColor={colors.textPrimary} />
            <PreviewDay label="Today" background={colors.calendarToday} textColor={colors.textInverse} />
            <PreviewDay label="Selected" background={colors.calendarSelected} textColor={colors.textInverse} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-[11px] font-medium">
        <PreviewChip label="Success" background={colors.statusSuccessBg} textColor={colors.statusSuccess} borderColor={colors.statusSuccessBorder} />
        <PreviewChip label="Warning" background={colors.statusWarningBg} textColor={colors.statusWarning} borderColor={colors.statusWarningBorder} />
        <PreviewChip label="Danger" background={colors.statusDangerBg} textColor={colors.statusDanger} borderColor={colors.statusDangerBorder} />
        <PreviewChip label="Info" background={colors.statusInfoBg} textColor={colors.statusInfo} borderColor={colors.statusInfoBorder} />
      </div>
    </div>
  );
}

interface PreviewDayProps {
  label: string;
  background: string;
  textColor: string;
}

function PreviewDay({ label, background, textColor }: PreviewDayProps) {
  return (
    <div
      className="rounded-lg px-2 py-3 border"
      style={{
        backgroundColor: background,
        color: textColor,
        borderColor: 'transparent',
      }}
    >
      {label}
    </div>
  );
}

interface PreviewChipProps {
  label: string;
  background: string;
  textColor: string;
  borderColor: string;
}

function PreviewChip({ label, background, textColor, borderColor }: PreviewChipProps) {
  return (
    <div
      className="rounded-lg px-2 py-2 border text-center"
      style={{
        backgroundColor: background,
        color: textColor,
        borderColor,
      }}
    >
      {label}
    </div>
  );
}

interface ColorFieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorField({ label, hint, value, onChange }: ColorFieldProps) {
  const pickerValue = normalizeHex(value, '#888888');
  const isValid = isHexColor(value);

  return (
    <div className="p-3 rounded-lg bg-bg-tertiary border border-border-primary space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <p className="text-xs text-text-muted mt-1">{hint}</p>
        </div>

        <label className="block shrink-0 cursor-pointer">
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <span
            className="block w-10 h-10 rounded-lg border border-border-primary"
            style={{ backgroundColor: pickerValue }}
          />
        </label>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 text-xs font-mono rounded-lg bg-bg-input text-text-primary focus:outline-none focus:ring-2 ${
          isValid ? 'border border-border-primary focus:ring-accent-primary' : 'border border-status-danger-border focus:ring-status-danger'
        }`}
        placeholder="#000000"
        spellCheck={false}
      />
    </div>
  );
}
