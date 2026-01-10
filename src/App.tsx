/**
 * Main App Component
 */

import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/layouts';
import { CalendarPage, DayDetailPage } from '@/pages';
import { LoadingOverlay, Card, Button } from '@/components/ui';
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt';
import { VaultSetupScreen } from '@/components/vault';
import { ErrorBoundary } from '@/components/errors';
import { useAppStore } from '@/store';
import { buildCalendarDay, formatDateToISO } from '@/utils';
import { 
  initializeStorage, 
  loadGoals, 
  requiresUserAction,
  type StorageState 
} from '@/services/storage.service';
import { goalFiles } from 'virtual:goals';
import { mockGoals } from '@/data';
import { env } from '@/config';

export function App() {
  const {
    goals,
    isLoading,
    error,
    viewMode,
    selectedDate,
    setGoals,
    setLoading,
    setError,
    setSelectedDate,
    setViewMode,
    toggleDailySubtask,
    toggleWeeklySubtask,
    updateMonthlyProgress,
  } = useAppStore();

  // Storage state for native FS mode
  const [storageState, setStorageState] = useState<StorageState | null>(null);

  // Load initial data
  useEffect(() => {
    async function initialize() {
      setLoading(true);
      
      try {
        if (env.useMockData) {
          // Use mock data for development
          setTimeout(() => {
            setGoals(mockGoals);
            setLoading(false);
          }, 300);
          return;
        }

        // Initialize storage adapter (handles both Vite and native FS modes)
        const state = await initializeStorage(goalFiles);
        setStorageState(state);

        // If storage requires user action (folder selection or permission), stop loading
        if (requiresUserAction(state)) {
          setLoading(false);
          return;
        }

        // If storage is not ready and has an error, show error
        if (!state.isReady && state.error) {
          setError(state.error);
          setLoading(false);
          return;
        }

        // Load goals from the appropriate backend
        const loadedGoals = await loadGoals();
        setGoals(loadedGoals);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load goals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load goals');
        setLoading(false);
      }
    }

    initialize();
  }, [setGoals, setLoading, setError]);

  // Handle folder access granted from setup screen
  const handleFolderAccessGranted = useCallback(async () => {
    setLoading(true);
    try {
      // Re-initialize storage to get updated state
      const state = await initializeStorage(goalFiles);
      setStorageState(state);
      
      if (state.isReady) {
        const loadedGoals = await loadGoals();
        setGoals(loadedGoals);
      }
    } catch (err) {
      console.error('Failed to load goals after access granted:', err);
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [setGoals, setLoading, setError]);

  // Handle day selection
  const handleDaySelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  }, [setSelectedDate, setViewMode]);

  // Handle back to calendar
  const handleBackToCalendar = useCallback(() => {
    setSelectedDate(null);
    setViewMode('month');
  }, [setSelectedDate, setViewMode]);

  // Handle task toggle (daily goals with subtasks)
  const handleToggleTask = useCallback((goalId: string, subtaskId?: string) => {
    if (subtaskId && selectedDate) {
      const dateStr = formatDateToISO(selectedDate);
      toggleDailySubtask(goalId, subtaskId, dateStr);
    }
    // Daily goals without subtasks have nothing to toggle (per user requirement)
  }, [selectedDate, toggleDailySubtask]);

  // Handle weekly goal subtask toggle
  const handleToggleWeeklySubtask = useCallback((goalId: string, subtaskId: string, weekKey: string) => {
    toggleWeeklySubtask(goalId, subtaskId, weekKey);
  }, [toggleWeeklySubtask]);

  // Handle monthly goal increment
  const handleIncrementMonthlyProgress = useCallback((goalId: string, monthKey: string) => {
    updateMonthlyProgress(goalId, monthKey, 1);
  }, [updateMonthlyProgress]);

  // Handle monthly goal decrement
  const handleDecrementMonthlyProgress = useCallback((goalId: string, monthKey: string) => {
    updateMonthlyProgress(goalId, monthKey, -1);
  }, [updateMonthlyProgress]);

  // Get selected day data
  const selectedDayData = selectedDate
    ? buildCalendarDay(selectedDate, goals, selectedDate.getMonth())
    : null;

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <LoadingOverlay message="Loading your goals..." />
      </MainLayout>
    );
  }

  // Vault setup required (native FS mode, no folder selected or permission needed)
  if (storageState && requiresUserAction(storageState) && storageState.vaultAccess) {
    return (
      <VaultSetupScreen 
        vaultAccess={storageState.vaultAccess}
        onComplete={handleFolderAccessGranted}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <Card className="text-center py-8">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-100 mb-2">
            Failed to load goals
          </h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout>
        {viewMode === 'month' ? (
          <CalendarPage
            goals={goals}
            onDaySelect={handleDaySelect}
            onToggleWeeklySubtask={handleToggleWeeklySubtask}
            onIncrementMonthlyProgress={handleIncrementMonthlyProgress}
            onDecrementMonthlyProgress={handleDecrementMonthlyProgress}
          />
        ) : selectedDayData ? (
          <DayDetailPage
            dayData={selectedDayData}
            onBack={handleBackToCalendar}
            onToggleTask={handleToggleTask}
          />
        ) : (
          <CalendarPage
            goals={goals}
            onDaySelect={handleDaySelect}
            onToggleWeeklySubtask={handleToggleWeeklySubtask}
            onIncrementMonthlyProgress={handleIncrementMonthlyProgress}
            onDecrementMonthlyProgress={handleDecrementMonthlyProgress}
          />
        )}
      </MainLayout>
      <PWAUpdatePrompt />
    </ErrorBoundary>
  );
}

export default App;
