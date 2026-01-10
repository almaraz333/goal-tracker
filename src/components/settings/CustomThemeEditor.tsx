/**
 * CustomThemeEditor component
 * 
 * Allows users to create or edit custom themes with color pickers
 * for each semantic color category.
 */

import { useState, useCallback } from 'react';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import { useThemeState } from '@/store';
import { getDefaultTheme, presetThemes } from '@/config';
import type { Theme, ThemeColors } from '@/types';

interface CustomThemeEditorProps {
  /** Existing theme to edit, or undefined to create new */
  editingTheme?: Theme;
  /** Called when user saves or cancels */
  onClose: () => void;
}

interface ColorGroup {
  label: string;
  colors: { key: keyof ThemeColors; label: string }[];
}

const colorGroups: ColorGroup[] = [
  {
    label: 'Backgrounds',
    colors: [
      { key: 'bgPrimary', label: 'Primary Background' },
      { key: 'bgSecondary', label: 'Secondary Background' },
      { key: 'bgTertiary', label: 'Tertiary Background' },
      { key: 'bgCard', label: 'Card Background' },
      { key: 'bgInput', label: 'Input Background' },
      { key: 'bgHover', label: 'Hover State' },
    ],
  },
  {
    label: 'Text',
    colors: [
      { key: 'textPrimary', label: 'Primary Text' },
      { key: 'textSecondary', label: 'Secondary Text' },
      { key: 'textMuted', label: 'Muted Text' },
      { key: 'textInverse', label: 'Inverse Text' },
    ],
  },
  {
    label: 'Accents',
    colors: [
      { key: 'accentPrimary', label: 'Primary Accent' },
      { key: 'accentPrimaryHover', label: 'Primary Accent Hover' },
      { key: 'accentSecondary', label: 'Secondary Accent' },
    ],
  },
  {
    label: 'Borders',
    colors: [
      { key: 'borderPrimary', label: 'Primary Border' },
      { key: 'borderSecondary', label: 'Secondary Border' },
      { key: 'borderFocus', label: 'Focus Ring' },
    ],
  },
  {
    label: 'Status - Success',
    colors: [
      { key: 'statusSuccess', label: 'Success Color' },
      { key: 'statusSuccessBg', label: 'Success Background' },
      { key: 'statusSuccessBorder', label: 'Success Border' },
    ],
  },
  {
    label: 'Status - Warning',
    colors: [
      { key: 'statusWarning', label: 'Warning Color' },
      { key: 'statusWarningBg', label: 'Warning Background' },
      { key: 'statusWarningBorder', label: 'Warning Border' },
    ],
  },
  {
    label: 'Status - Danger',
    colors: [
      { key: 'statusDanger', label: 'Danger Color' },
      { key: 'statusDangerBg', label: 'Danger Background' },
      { key: 'statusDangerBorder', label: 'Danger Border' },
    ],
  },
  {
    label: 'Status - Info',
    colors: [
      { key: 'statusInfo', label: 'Info Color' },
      { key: 'statusInfoBg', label: 'Info Background' },
      { key: 'statusInfoBorder', label: 'Info Border' },
    ],
  },
  {
    label: 'Calendar',
    colors: [
      { key: 'calendarToday', label: 'Today Highlight' },
      { key: 'calendarSelected', label: 'Selected Day' },
      { key: 'calendarWeekend', label: 'Weekend Background' },
    ],
  },
  {
    label: 'Progress',
    colors: [
      { key: 'progressComplete', label: 'Complete' },
      { key: 'progressPartial', label: 'Partial' },
      { key: 'progressEmpty', label: 'Empty' },
    ],
  },
];

export function CustomThemeEditor({ editingTheme, onClose }: CustomThemeEditorProps) {
  const { saveCustomTheme, setTheme } = useThemeState();
  
  // Base theme to start from
  const baseTheme = editingTheme ?? getDefaultTheme();
  
  const [themeName, setThemeName] = useState(
    editingTheme ? editingTheme.name : 'My Custom Theme'
  );
  const [colors, setColors] = useState<ThemeColors>({ ...baseTheme.colors });
  const [basePresetId, setBasePresetId] = useState<string>(
    editingTheme?.isBuiltin === false ? 'default-dark' : baseTheme.id
  );

  const handleColorChange = useCallback((key: keyof ThemeColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleResetToBase = () => {
    const preset = presetThemes.find(t => t.id === basePresetId) ?? getDefaultTheme();
    setColors({ ...preset.colors });
  };

  const handleSave = () => {
    const newTheme: Theme = {
      id: editingTheme?.id ?? `custom-${Date.now()}`,
      name: themeName.trim() || 'My Custom Theme',
      colors,
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
                setColors({ ...preset.colors });
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

      {/* Color editors */}
      <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
        {colorGroups.map(group => (
          <div key={group.label}>
            <h4 className="text-sm font-medium text-text-muted mb-2">{group.label}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.colors.map(({ key, label }) => (
                <ColorPicker
                  key={key}
                  label={label}
                  value={colors[key]}
                  onChange={(value) => handleColorChange(key, value)}
                />
              ))}
            </div>
          </div>
        ))}
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

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  // Handle rgba() colors by converting to hex for the picker display
  const isRgba = value.startsWith('rgba');
  
  return (
    <div className="flex items-center gap-2 p-2 bg-bg-tertiary rounded-lg">
      <div className="relative">
        <input
          type="color"
          value={isRgba ? '#888888' : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0"
          style={{ backgroundColor: value }}
        />
        <div 
          className="absolute inset-0 rounded pointer-events-none border border-border-primary"
          style={{ backgroundColor: value }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-text-secondary truncate">{label}</div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs bg-transparent text-text-muted font-mono focus:outline-none"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
