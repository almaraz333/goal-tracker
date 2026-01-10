/**
 * PWA Update Prompt component
 */

import { RefreshCw, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks';
import { Button } from '@/components/ui';

export function PWAUpdatePrompt() {
  const { needRefresh, offlineReady, updateServiceWorker, closePrompt } = usePWA();
  
  if (!needRefresh && !offlineReady) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-gray-700">
            {needRefresh ? (
              <RefreshCw className="h-5 w-5 text-blue-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-green-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-100">
              {needRefresh
                ? 'New version available!'
                : 'App ready for offline use'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
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
