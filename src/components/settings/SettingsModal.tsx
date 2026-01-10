/**
 * Settings Modal component - allows users to configure app settings
 * 
 * Features:
 * - Vault path configuration for development mode
 * - Folder picker for PWA mode (File System Access API)
 * - Permission status indicator
 */

import { useState, useMemo, useEffect } from 'react';
import { Settings, FolderOpen, X, Save, CheckCircle, AlertCircle, Folder } from 'lucide-react';
import { Button, Modal, Card } from '@/components/ui';
import { getStoredVaultPath, setStoredVaultPath, DEFAULT_VAULT_PATH } from '@/utils/settings.utils';
import { 
  getStorageMode, 
  getStorageState, 
  requestFolderAccess, 
  clearFolderAccess,
  checkFileSystemSupport,
} from '@/services';
import type { StorageState } from '@/services/storage.service';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVaultPathChange?: (path: string) => void;
  onFolderSelected?: () => void;
}

export function SettingsModal({ isOpen, onClose, onVaultPathChange, onFolderSelected }: SettingsModalProps) {
  // Dev mode vault path
  const initialPath = useMemo(() => isOpen ? getStoredVaultPath() : DEFAULT_VAULT_PATH, [isOpen]);
  const [vaultPath, setVaultPath] = useState(initialPath);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Storage state for native FS mode
  const [storageState, setStorageState] = useState<StorageState | null>(null);
  const [isSelectingFolder, setIsSelectingFolder] = useState(false);
  
  const storageMode = getStorageMode();
  const fsSupport = checkFileSystemSupport();

  // Load storage state when modal opens
  useEffect(() => {
    if (isOpen && storageMode === 'native-fs') {
      getStorageState().then(setStorageState);
    }
  }, [isOpen, storageMode]);

  const handlePathChange = (newPath: string) => {
    setVaultPath(newPath);
    setHasChanges(newPath !== getStoredVaultPath());
    setSaved(false);
  };

  const handleSave = () => {
    setStoredVaultPath(vaultPath);
    setHasChanges(false);
    setSaved(true);
    onVaultPathChange?.(vaultPath);
  };

  const handleReset = () => {
    setVaultPath(DEFAULT_VAULT_PATH);
    setHasChanges(DEFAULT_VAULT_PATH !== getStoredVaultPath());
    setSaved(false);
  };

  const handleSelectFolder = async () => {
    setIsSelectingFolder(true);
    try {
      const success = await requestFolderAccess();
      if (success) {
        const newState = await getStorageState();
        setStorageState(newState);
        onFolderSelected?.();
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
    } finally {
      setIsSelectingFolder(false);
    }
  };

  const handleClearFolder = async () => {
    await clearFolderAccess();
    const newState = await getStorageState();
    setStorageState(newState);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        
        {/* Native File System Mode (PWA/Production) */}
        {storageMode === 'native-fs' && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Folder className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-100">Goals Folder</h3>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Select the folder containing your goal markdown files. This is typically your 
              Obsidian vault's Goals directory.
            </p>

            {/* Current folder status */}
            {storageState?.vaultAccess && (
              <div className="mb-4">
                {storageState.vaultAccess.status === 'ready' && (
                  <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-300">Connected</p>
                      <p className="text-xs text-green-400">{storageState.vaultAccess.folderName}</p>
                    </div>
                  </div>
                )}
                
                {storageState.vaultAccess.status === 'permission-needed' && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-yellow-300">Permission Required</p>
                      <p className="text-xs text-yellow-400">
                        Tap "Grant Access" to reconnect to: {storageState.vaultAccess.folderName}
                      </p>
                    </div>
                  </div>
                )}
                
                {storageState.vaultAccess.status === 'not-configured' && (
                  <div className="flex items-center gap-2 p-3 bg-gray-800 border border-gray-600 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-gray-400" />
                    <p className="text-sm text-gray-400">No folder selected</p>
                  </div>
                )}
                
                {storageState.vaultAccess.status === 'error' && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-red-300">Error</p>
                      <p className="text-xs text-red-400">{storageState.vaultAccess.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button 
                onClick={handleSelectFolder} 
                variant="primary"
                size="sm"
                disabled={isSelectingFolder}
              >
                <FolderOpen className="h-4 w-4 mr-1" />
                {storageState?.vaultAccess?.status === 'ready' ? 'Change Folder' : 
                 storageState?.vaultAccess?.status === 'permission-needed' ? 'Grant Access' :
                 'Select Folder'}
              </Button>
              
              {storageState?.vaultAccess?.status === 'ready' && (
                <Button onClick={handleClearFolder} variant="ghost" size="sm">
                  Disconnect
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Development Mode - Text Path Input */}
        {storageMode === 'vite' && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-100">Goals Vault Path</h3>
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Dev Mode</span>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Set the path to your goals folder. This is used by the Vite dev server.
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="vault-path" className="block text-sm font-medium text-gray-300 mb-1">
                  Vault Path
                </label>
                <input
                  id="vault-path"
                  type="text"
                  value={vaultPath}
                  onChange={(e) => handlePathChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="../Goals"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={!hasChanges}
                  variant={hasChanges ? 'primary' : 'ghost'}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button onClick={handleReset} variant="ghost" size="sm">
                  Reset to Default
                </Button>
                {saved && (
                  <span className="text-sm text-green-400 ml-2">
                    ✓ Saved! Reload to apply changes.
                  </span>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Browser Support Info */}
        {!fsSupport.isFullySupported && storageMode !== 'vite' && (
          <Card className="p-4 border-yellow-600">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-300">Limited Browser Support</h3>
            </div>
            <p className="text-sm text-gray-400">
              {fsSupport.reason}
            </p>
          </Card>
        )}

        {/* Storage Mode Info */}
        <Card className="p-4 bg-gray-800/50">
          <p className="text-xs text-gray-500">
            Storage Mode: <span className="text-gray-400">{storageMode}</span>
            {storageMode === 'vite' && ' (Development server)'}
            {storageMode === 'native-fs' && ' (File System Access API)'}
            {storageMode === 'none' && ' (Not available)'}
          </p>
        </Card>

        {/* Close button */}
        <div className="flex justify-end">
          <Button onClick={onClose} variant="ghost">
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
interface SettingsButtonProps {
  onVaultPathChange?: (path: string) => void;
  onFolderSelected?: () => void;
}

export function SettingsButton({ onVaultPathChange, onFolderSelected }: SettingsButtonProps) {
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
        onVaultPathChange={onVaultPathChange}
        onFolderSelected={onFolderSelected}
      />
    </>
  );
}
