/**
 * PWA Update Prompt component
 */

import { RefreshCw, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks';
import { Button } from '@/components/ui';
import { isNativeApp } from '@/services';

export function PWAUpdatePrompt() {
  const { needRefresh, offlineReady, updateServiceWorker, closePrompt } = usePWA();

  if (isNativeApp()) {
    return null;
  }
  
  if (!needRefresh && !offlineReady) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-bg-card border border-border-primary rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-bg-tertiary">
            {needRefresh ? (
              <RefreshCw className="h-5 w-5 text-accent-primary" />
            ) : (
              <WifiOff className="h-5 w-5 text-status-success" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-text-primary">
              {needRefresh
                ? 'New version available!'
                : 'App ready for offline use'}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {needRefresh
                ? 'Click update to get the latest features.'
                : 'You can now use the app without internet.'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          {needRefresh && (
            <Button size="sm" onClick={updateServiceWorker}>
              Update
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={closePrompt}>
            {needRefresh ? 'Later' : 'Got it'}
          </Button>
        </div>
      </div>
    </div>
  );
}
