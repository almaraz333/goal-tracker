/**
 * Settings Modal component
 */

import { useState } from 'react';
import { Settings, X, Palette, HardDrive, Smartphone } from 'lucide-react';
import { Button, Modal, Card } from '@/components/ui';
import { ThemeSelector } from './ThemeSelector';
import { CustomThemeEditor } from './CustomThemeEditor';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [isEditingTheme, setIsEditingTheme] = useState(false);

  const handleClose = () => {
    setIsEditingTheme(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Settings">
      <div className="space-y-4">
        {/* Theme Customization Section */}
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-accent-secondary" />
            <h3 className="text-base font-semibold text-text-primary">Appearance</h3>
          </div>
          
          {isEditingTheme ? (
            <CustomThemeEditor onClose={() => setIsEditingTheme(false)} />
          ) : (
            <>
              <p className="text-xs text-text-muted mb-3">
                Choose a theme or create your own custom color scheme.
              </p>
              <ThemeSelector onCreateCustom={() => setIsEditingTheme(true)} />
            </>
          )}
        </Card>

        {/* Storage Section */}
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="h-4 w-4 text-accent-secondary" />
            <h3 className="text-base font-semibold text-text-primary">Data</h3>
          </div>
          <div className="flex items-center gap-2 p-2 bg-bg-tertiary rounded-lg mb-3">
            <Smartphone className="h-4 w-4 text-status-success" />
            <span className="text-sm text-text-primary">Saved on this device</span>
          </div>
          <p className="text-xs text-text-muted">
            Goals and categories are saved automatically inside the app.
          </p>
        </Card>

        {/* Close button */}
        <div className="flex justify-end">
          <Button onClick={handleClose} variant="ghost">
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Settings button component that opens the settings modal
 */
export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        aria-label="Open settings"
      >
        <Settings className="h-5 w-5 text-gray-400" />
      </button>
      <SettingsModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
