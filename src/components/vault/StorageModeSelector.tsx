/**
 * Storage Mode Selector Component
 * 
 * First-time setup screen that allows users to choose between:
 * - External Folder: Store goals in a folder on device (syncs with Obsidian, etc.)
 * - In-App Storage: Store goals within the app (no external folder needed)
 */

import { useState } from 'react';
import { FolderOpen, Smartphone, HardDrive, Cloud, ArrowRight, Info } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { setStoragePreference, type StoragePreference } from '@/utils/settings.utils';
import { checkFileSystemSupport } from '@/services';

interface StorageModeSelectorProps {
  onComplete: (mode: StoragePreference) => void;
}

export function StorageModeSelector({ onComplete }: StorageModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<StoragePreference | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const fsSupport = checkFileSystemSupport();

  const handleContinue = () => {
    if (!selectedMode) return;
    
    setIsConfirming(true);
    setStoragePreference(selectedMode);
    
    // Small delay for visual feedback
    setTimeout(() => {
      onComplete(selectedMode);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HardDrive className="h-8 w-8 text-accent-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Where would you like to store your goals?
          </h1>
          <p className="text-text-secondary">
            Choose how you want to manage your goal files
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-8">
          {/* External Folder Option */}
          <Card 
            className={`p-4 cursor-pointer transition-all border-2 ${
              selectedMode === 'external-folder' 
                ? 'border-accent-primary bg-accent-primary/10' 
                : 'border-transparent hover:border-border-secondary'
            } ${!fsSupport.isFullySupported ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => fsSupport.isFullySupported && setSelectedMode('external-folder')}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedMode === 'external-folder' ? 'bg-accent-primary' : 'bg-bg-tertiary'
              }`}>
                <FolderOpen className={`h-6 w-6 ${
                  selectedMode === 'external-folder' ? 'text-white' : 'text-text-secondary'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary">External Folder</h3>
                  {!fsSupport.isFullySupported && (
                    <span className="text-xs px-2 py-0.5 bg-status-warning-bg text-status-warning rounded">
                      Not Supported
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  Store goals in a folder on your device. Perfect for syncing with Obsidian, 
                  Syncthing, or other markdown-based tools.
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Cloud className="h-3 w-3" />
                    Sync-friendly
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    Full file access
                  </span>
                </div>
              </div>
              {selectedMode === 'external-folder' && (
                <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          </Card>

          {/* In-App Storage Option */}
          <Card 
            className={`p-4 cursor-pointer transition-all border-2 ${
              selectedMode === 'in-app' 
                ? 'border-accent-primary bg-accent-primary/10' 
                : 'border-transparent hover:border-border-secondary'
            }`}
            onClick={() => setSelectedMode('in-app')}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedMode === 'in-app' ? 'bg-accent-primary' : 'bg-bg-tertiary'
              }`}>
                <Smartphone className={`h-6 w-6 ${
                  selectedMode === 'in-app' ? 'text-white' : 'text-text-secondary'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary">In-App Storage</h3>
                  <span className="text-xs px-2 py-0.5 bg-status-success-bg text-status-success rounded">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  Store goals within the app. No folder permissions needed. 
                  Create and manage goals directly in the app.
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    No setup required
                  </span>
                  <span className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    Works offline
                  </span>
                </div>
              </div>
              {selectedMode === 'in-app' && (
                <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-2 p-3 bg-bg-secondary rounded-lg mb-6">
          <Info className="h-4 w-4 text-accent-secondary mt-0.5 shrink-0" />
          <p className="text-xs text-text-muted">
            You can change this setting later, but switching modes will not transfer your existing goals. 
            Each mode maintains its own separate data.
          </p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!selectedMode || isConfirming}
        >
          {isConfirming ? (
            'Setting up...'
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
