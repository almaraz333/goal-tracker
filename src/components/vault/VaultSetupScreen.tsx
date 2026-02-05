/**
 * Vault Setup Screen
 * 
 * Shown when the app is running in PWA mode and no vault folder has been selected.
 * Guides the user through selecting their Obsidian vault's Goals directory.
 * 
 * For returning users who just need to re-grant permission, shows a minimal banner
 * and auto-requests permission on the first user interaction.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { FolderOpen, Smartphone, CheckCircle, ArrowRight, RefreshCw, Unlock } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { requestFolderAccess, requestStoredPermission, checkFileSystemSupport } from '@/services';
import type { VaultAccessState } from '@/types/fileSystem.types';

interface VaultSetupScreenProps {
  vaultAccess: VaultAccessState;
  onComplete: () => void;
}

export function VaultSetupScreen({ vaultAccess, onComplete }: VaultSetupScreenProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRequesting, setAutoRequesting] = useState(false);
  const permissionRequestInFlight = useRef(false);
  
  const fsSupport = checkFileSystemSupport();

  const handleSelectFolder = async () => {
    setIsSelecting(true);
    setError(null);
    try {
      const success = await requestFolderAccess();
      if (success) {
        onComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select folder');
    } finally {
      setIsSelecting(false);
    }
  };

  const handleGrantPermission = useCallback(async () => {
    if (isSelecting || autoRequesting || permissionRequestInFlight.current) return;
    permissionRequestInFlight.current = true;
    
    setIsSelecting(true);
    setAutoRequesting(true);
    setError(null);
    try {
      const success = await requestStoredPermission();
      if (success) {
        onComplete();
      } else {
        setError('Permission was denied. Please tap the button to try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permission');
    } finally {
      setIsSelecting(false);
      setAutoRequesting(false);
      permissionRequestInFlight.current = false;
    }
  }, [isSelecting, autoRequesting, onComplete]);

  // Auto-request permission on first user interaction for returning users
  useEffect(() => {
    if (vaultAccess.status !== 'permission-needed') return;
    
    const handleFirstInteraction = () => {
      // Remove listeners immediately to prevent multiple calls
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      
      // Small delay to let the UI settle
      setTimeout(() => {
        handleGrantPermission();
      }, 100);
    };

    // Listen for any user interaction
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [vaultAccess.status, handleGrantPermission]);

  // Browser not supported
  if (!fsSupport.isFullySupported) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-status-danger-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="h-8 w-8 text-status-danger" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Browser Not Supported</h1>
          <p className="text-text-muted mb-4">{fsSupport.reason}</p>
          <p className="text-sm text-text-muted">
            Please use Chrome, Edge, or Samsung Internet on Android to access your goal files.
          </p>
        </Card>
      </div>
    );
  }

  // Permission needed for existing folder - minimal UI that auto-requests on interaction
  if (vaultAccess.status === 'permission-needed') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <Card className="max-w-sm w-full p-5">
          {/* Compact header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              {isSelecting ? (
                <RefreshCw className="h-5 w-5 text-accent-primary animate-spin" />
              ) : (
                <Unlock className="h-5 w-5 text-accent-primary" />
              )}
            </div>
            <div>
              <h1 className="text-base font-semibold text-text-primary">
                {isSelecting ? 'Connecting...' : 'Tap to Continue'}
              </h1>
              <p className="text-xs text-text-muted">{vaultAccess.folderName}</p>
            </div>
          </div>

          {error && (
            <div className="bg-status-danger-bg border border-status-danger-border rounded-lg p-2 mb-3">
              <p className="text-xs text-status-danger">{error}</p>
            </div>
          )}

          {!isSelecting && (
            <>
              <Button 
                onClick={handleGrantPermission}
                variant="primary"
                size="sm"
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Grant Access
              </Button>

              <button 
                onClick={handleSelectFolder}
                className="w-full mt-2 text-xs text-text-muted hover:text-text-secondary"
              >
                Select different folder
              </button>
            </>
          )}

          {isSelecting && (
            <p className="text-xs text-text-muted text-center">
              Please allow access when prompted...
            </p>
          )}
        </Card>
      </div>
    );
  }

  // First time setup - no folder selected
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-8 w-8 text-accent-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome to Goal Tracker</h1>
          <p className="text-text-muted">
            Connect to your goals folder to get started.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-text-inverse">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Select your Goals folder</p>
              <p className="text-xs text-text-muted">
                Navigate to your Obsidian vault's Goals directory
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-bg-tertiary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-text-muted">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Grant read/write access</p>
              <p className="text-xs text-text-muted">
                Allows the app to read and update your goal files
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-bg-tertiary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-text-muted">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Track your goals</p>
              <p className="text-xs text-text-muted">
                Changes sync automatically with your files
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-status-danger-bg border border-status-danger-border rounded-lg p-3 mb-4">
            <p className="text-sm text-status-danger">{error}</p>
          </div>
        )}

        <Button 
          onClick={handleSelectFolder}
          variant="primary"
          size="lg"
          disabled={isSelecting}
          className="w-full"
        >
          {isSelecting ? (
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <>
              <FolderOpen className="h-5 w-5 mr-2" />
              Select Goals Folder
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        <p className="text-xs text-text-muted text-center mt-4">
          Your goals are stored locally on your device. 
          Use Syncthing or similar to sync with other devices.
        </p>
      </Card>
    </div>
  );
}
