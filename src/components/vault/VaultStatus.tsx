/**
 * Vault Access Status Component
 * 
 * Displays the current vault access status in the header.
 * Shows connected status, folder name, or prompts for action.
 */

import { useState, useEffect } from 'react';
import { FolderOpen, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { 
  getStorageMode, 
  getStorageState, 
  requestStoredPermission,
  requestFolderAccess,
} from '@/services';
import type { StorageState } from '@/services/storage.service';

interface VaultStatusProps {
  onStatusChange?: () => void;
}

export function VaultStatus({ onStatusChange }: VaultStatusProps) {
  const [storageState, setStorageState] = useState<StorageState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const storageMode = getStorageMode();

  // Load initial state
  useEffect(() => {
    if (storageMode === 'native-fs') {
      loadState();
    }
  }, [storageMode]);

  const loadState = async () => {
    const state = await getStorageState();
    setStorageState(state);
  };

  const handleGrantPermission = async () => {
    setIsLoading(true);
    try {
      const success = await requestStoredPermission();
      if (success) {
        await loadState();
        onStatusChange?.();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFolder = async () => {
    setIsLoading(true);
    try {
      const success = await requestFolderAccess();
      if (success) {
        await loadState();
        onStatusChange?.();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Only show for native-fs mode
  if (storageMode !== 'native-fs') {
    return null;
  }

  if (!storageState?.vaultAccess) {
    return null;
  }

  const { status, folderName } = storageState.vaultAccess;

  // Ready state - compact indicator
  if (status === 'ready') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-status-success-bg border border-status-success-border rounded-lg">
        <CheckCircle className="h-3.5 w-3.5 text-status-success" />
        <span className="text-xs text-status-success truncate max-w-[100px]">
          {folderName}
        </span>
      </div>
    );
  }

  // Permission needed - show action button
  if (status === 'permission-needed') {
    return (
      <Button 
        onClick={handleGrantPermission}
        variant="ghost"
        size="sm"
        disabled={isLoading}
        className="text-status-warning border-status-warning-border hover:bg-status-warning-bg"
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <AlertCircle className="h-4 w-4 mr-1" />
        )}
        <span className="text-xs">Grant Access</span>
      </Button>
    );
  }

  // Not configured - show select button
  if (status === 'not-configured') {
    return (
      <Button 
        onClick={handleSelectFolder}
        variant="ghost"
        size="sm"
        disabled={isLoading}
        className="text-accent-primary border-accent-primary hover:bg-accent-primary/20"
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <FolderOpen className="h-4 w-4 mr-1" />
        )}
        <span className="text-xs">Select Folder</span>
      </Button>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-status-danger-bg border border-status-danger-border rounded-lg">
        <AlertCircle className="h-3.5 w-3.5 text-status-danger" />
        <span className="text-xs text-status-danger">Error</span>
      </div>
    );
  }

  return null;
}
