/**
 * Vault Setup Screen
 * 
 * Shown when the app is running in PWA mode and no vault folder has been selected.
 * Guides the user through selecting their Obsidian vault's Goals directory.
 */

import { useState } from 'react';
import { FolderOpen, Smartphone, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
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

  const handleGrantPermission = async () => {
    setIsSelecting(true);
    setError(null);
    try {
      const success = await requestStoredPermission();
      if (success) {
        onComplete();
      } else {
        setError('Permission was denied. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permission');
    } finally {
      setIsSelecting(false);
    }
  };

  // Browser not supported
  if (!fsSupport.isFullySupported) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Browser Not Supported</h1>
          <p className="text-gray-400 mb-4">{fsSupport.reason}</p>
          <p className="text-sm text-gray-500">
            Please use Chrome, Edge, or Samsung Internet on Android to access your goal files.
          </p>
        </Card>
      </div>
    );
  }

  // Permission needed for existing folder
  if (vaultAccess.status === 'permission-needed') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-100 mb-2">Permission Required</h1>
            <p className="text-gray-400">
              Goal Tracker needs permission to access your goals folder again.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-300 mb-1">Previously selected folder:</p>
            <p className="text-lg font-medium text-white">{vaultAccess.folderName}</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <Button 
            onClick={handleGrantPermission}
            variant="primary"
            size="lg"
            disabled={isSelecting}
            className="w-full"
          >
            {isSelecting ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-2" />
            )}
            Grant Access
          </Button>

          <button 
            onClick={handleSelectFolder}
            className="w-full mt-3 text-sm text-gray-400 hover:text-gray-300"
          >
            Or select a different folder
          </button>
        </Card>
      </div>
    );
  }

  // First time setup - no folder selected
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Welcome to Goal Tracker</h1>
          <p className="text-gray-400">
            Connect to your goals folder to get started.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-white">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">Select your Goals folder</p>
              <p className="text-xs text-gray-500">
                Navigate to your Obsidian vault's Goals directory
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-gray-400">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Grant read/write access</p>
              <p className="text-xs text-gray-600">
                Allows the app to read and update your goal files
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-gray-400">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Track your goals</p>
              <p className="text-xs text-gray-600">
                Changes sync automatically with your files
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-300">{error}</p>
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

        <p className="text-xs text-gray-600 text-center mt-4">
          Your goals are stored locally on your device. 
          Use Syncthing or similar to sync with other devices.
        </p>
      </Card>
    </div>
  );
}
