/**
 * Custom hook for PWA functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface UsePWAReturn {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => Promise<void>;
  closePrompt: () => void;
}

export function usePWA(): UsePWAReturn {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const updateSWRef = useRef<(() => Promise<void>) | null>(null);
  
  useEffect(() => {
    const updateFunction = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
    });
    
    updateSWRef.current = updateFunction;
  }, []);
  
  const updateServiceWorker = useCallback(async () => {
    if (updateSWRef.current) {
      await updateSWRef.current();
    }
  }, []);
  
  const closePrompt = useCallback(() => {
    setNeedRefresh(false);
    setOfflineReady(false);
  }, []);
  
  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    closePrompt,
  };
}
