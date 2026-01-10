/**
 * Main Layout component - provides consistent structure for all pages
 */

import type { ReactNode } from 'react';
import { Target } from 'lucide-react';
import { SettingsButton } from '@/components/settings';

interface MainLayoutProps {
  children: ReactNode;
  onVaultPathChange?: (path: string) => void;
}

export function MainLayout({ children, onVaultPathChange }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary safe-area-inset">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-b border-border-primary">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-accent-primary" />
              <h1 className="text-lg font-bold text-text-primary">Goal Tracker</h1>
            </div>
            
            <SettingsButton onVaultPathChange={onVaultPathChange} />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
