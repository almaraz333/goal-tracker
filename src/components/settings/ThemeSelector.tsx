/**
 * ThemeSelector component
 * 
 * Displays a grid of available themes with visual previews.
 * Allows users to select a theme or create a custom one.
 */

import { Check, Plus, Trash2 } from 'lucide-react';
import { presetThemes } from '@/config';
import { useThemeState } from '@/store';
import type { Theme } from '@/types';

interface ThemeSelectorProps {
  onCreateCustom?: () => void;
}

export function ThemeSelector({ onCreateCustom }: ThemeSelectorProps) {
  const { activeThemeId, customThemes, setTheme, deleteCustomTheme } = useThemeState();
  
  const allThemes = [...presetThemes, ...customThemes];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {allThemes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={theme.id === activeThemeId}
            onSelect={() => setTheme(theme.id)}
            onDelete={!theme.isBuiltin ? () => deleteCustomTheme(theme.id) : undefined}
          />
        ))}
        
        {/* Create Custom Theme button */}
        {onCreateCustom && (
          <button
            onClick={onCreateCustom}
            className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-border-primary hover:border-accent-primary hover:bg-bg-hover transition-colors min-h-[100px]"
          >
            <Plus className="h-6 w-6 text-text-muted mb-1" />
            <span className="text-xs text-text-muted">Create Custom</span>
          </button>
        )}
      </div>
    </div>
  );
}

interface ThemeCardProps {
  theme: Theme;
  isActive: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

function ThemeCard({ theme, isActive, onSelect, onDelete }: ThemeCardProps) {
  const colors = theme.colors;
  
  return (
    <div
      className={`
        relative p-3 rounded-lg cursor-pointer transition-all
        ${isActive 
          ? 'ring-2 ring-accent-primary bg-bg-hover' 
          : 'border border-border-primary hover:border-border-secondary hover:bg-bg-hover'
        }
      `}
      onClick={onSelect}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center">
          <Check className="h-3 w-3 text-text-inverse" />
        </div>
      )}
      
      {/* Delete button for custom themes */}
      {onDelete && !isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 w-5 h-5 bg-status-danger-bg rounded-full flex items-center justify-center hover:bg-status-danger transition-colors"
        >
          <Trash2 className="h-3 w-3 text-status-danger" />
        </button>
      )}
      
      {/* Color preview */}
      <div className="flex gap-1 mb-2">
        {/* Background preview */}
        <div 
          className="w-6 h-6 rounded" 
          style={{ backgroundColor: colors.bgPrimary }}
          title="Background"
        />
        <div 
          className="w-6 h-6 rounded" 
          style={{ backgroundColor: colors.bgSecondary }}
          title="Card"
        />
        {/* Accent preview */}
        <div 
          className="w-6 h-6 rounded" 
          style={{ backgroundColor: colors.accentPrimary }}
          title="Accent"
        />
        {/* Status previews */}
        <div 
          className="w-6 h-6 rounded" 
          style={{ backgroundColor: colors.statusSuccess }}
          title="Success"
        />
      </div>
      
      {/* Text preview */}
      <div 
        className="text-sm font-medium truncate"
        style={{ color: colors.textPrimary }}
      >
        {theme.name}
      </div>
      <div 
        className="text-xs truncate"
        style={{ color: colors.textMuted }}
      >
        {theme.isBuiltin ? 'Built-in' : 'Custom'}
      </div>
    </div>
  );
}
