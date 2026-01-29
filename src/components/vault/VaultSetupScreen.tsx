/**
 * Vault Setup Screen
 * 
 * Shown when the app needs to configure external folder access.
 * 
 * Supports:
 * - Web/PWA: Uses File System Access API (showDirectoryPicker)
 * - Android (Capacitor): Manual path input for external storage
 * - iOS: Does NOT support external folders (must use in-app storage)
 */

import { useState, useEffect, useCallback } from 'react';
import { FolderOpen, Smartphone, CheckCircle, ArrowRight, RefreshCw, Unlock, Info, AlertCircle } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { 
  requestFolderAccess, 
  requestStoredPermission, 
  checkFileSystemSupport,
  isNativePlatform,
  isIOS,
  isAndroid,
  getPlatformCapabilities,
  setExternalFolderPath,
} from '@/services';
import type { VaultAccessState } from '@/types/fileSystem.types';

interface VaultSetupScreenProps {
  vaultAccess: VaultAccessState;
  onComplete: () => void;
}

export function VaultSetupScreen({ vaultAccess, onComplete }: VaultSetupScreenProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRequesting, setAutoRequesting] = useState(false);
  const [folderPath, setFolderPath] = useState('');
  
  const isNative = isNativePlatform();
  const capabilities = getPlatformCapabilities();
  const fsSupport = checkFileSystemSupport();

  // For web: use the file system access API
  const handleSelectFolderWeb = async () => {
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

  // For Android: use manual path input
  const handleSetFolderAndroid = async () => {
    if (!folderPath.trim()) {
      setError('Please enter a folder path');
      return;
    }
    
    setIsSelecting(true);
    setError(null);
    
    try {
      const result = await setExternalFolderPath(folderPath.trim());
      if (result.success) {
        onComplete();
      } else {
        setError(result.error || 'Failed to set folder path');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set folder path');
    } finally {
      setIsSelecting(false);
    }
  };

  const handleGrantPermission = useCallback(async () => {
    if (isSelecting || autoRequesting) return;
    
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
    }
  }, [isSelecting, autoRequesting, onComplete]);

  // Auto-request permission on first user interaction for returning users (web only)
  useEffect(() => {
    if (vaultAccess.status !== 'permission-needed' || isAndroid()) return;
    
    const handleFirstInteraction = () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      
      setTimeout(() => {
        handleGrantPermission();
      }, 100);
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [vaultAccess.status, handleGrantPermission]);

  // Browser not supported (web only check)
  if (!isNative && !fsSupport.isFullySupported) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-status-danger-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="h-8 w-8 text-status-danger" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Browser Not Supported</h1>
          <p className="text-text-muted mb-4">{fsSupport.reason}</p>
          <p className="text-sm text-text-muted">
            Please use Chrome, Edge, or Samsung Internet to access your goal files.
          </p>
        </Card>
      </div>
    );
  }

  // iOS restriction notice - iOS cannot access external folders
  if (isIOS() && !capabilities.canAccessExternalStorage) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-status-warning-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="h-8 w-8 text-status-warning" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">iOS Limitations</h1>
          <p className="text-text-muted mb-4">
            Due to iOS restrictions, external folder access is not available.
            Please use in-app storage mode to store your goals within the app.
          </p>
        </Card>
      </div>
    );
  }

  // Permission needed for existing folder (web only)
  if (vaultAccess.status === 'permission-needed' && !isAndroid()) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <Card className="max-w-sm w-full p-5">
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
                onClick={handleSelectFolderWeb}
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

  // Android: Manual path input
  if (isAndroid()) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-accent-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Connect Goals Folder</h1>
            <p className="text-text-muted">
              Enter the path to your Goals folder on your device
            </p>
          </div>

          {/* Path input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Folder Path
            </label>
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="Syncthing/Goals"
              className="w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              disabled={isSelecting}
            />
            <p className="text-xs text-text-muted mt-2">
              Path relative to internal storage. Example: <code className="bg-bg-tertiary px-1 rounded">Syncthing/Goals</code>
            </p>
          </div>

          {/* Common paths */}
          <div className="mb-4">
            <p className="text-xs text-text-secondary mb-2">Common paths:</p>
            <div className="flex flex-wrap gap-2">
              {['Syncthing/Goals', 'Documents/Goals', 'Download/Goals', 'Obsidian/Goals'].map((path) => (
                <button
                  key={path}
                  onClick={() => setFolderPath(path)}
                  className="text-xs px-2 py-1 bg-bg-tertiary hover:bg-bg-secondary rounded text-text-secondary hover:text-text-primary transition-colors"
                  disabled={isSelecting}
                >
                  {path}
                </button>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-3 mb-4">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-accent-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs text-text-secondary">
                <p className="mb-1"><strong>How to find your folder path:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your file manager app</li>
                  <li>Navigate to your Goals folder</li>
                  <li>The path is usually shown at the top</li>
                  <li>Enter the part after "Internal storage/"</li>
                </ol>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-status-danger-bg border border-status-danger-border rounded-lg p-3 mb-4">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-status-danger flex-shrink-0 mt-0.5" />
                <p className="text-sm text-status-danger">{error}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSetFolderAndroid}
            variant="primary"
            size="lg"
            disabled={isSelecting || !folderPath.trim()}
            className="w-full"
          >
            {isSelecting ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Connect Folder
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-text-muted text-center mt-4">
            Make sure the folder exists and contains your goal markdown files.
          </p>
        </Card>
      </div>
    );
  }

  // Web: First time setup - use folder picker
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
                Navigate to your Goals directory
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
          onClick={handleSelectFolderWeb}
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
          Your goals are stored locally. Use Syncthing or similar to sync with other devices.
        </p>
      </Card>
    </div>
  );
}
