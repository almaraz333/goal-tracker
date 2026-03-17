/**
 * Main App Component
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { MainLayout } from '@/layouts';
import { CalendarPage, DayDetailPage } from '@/pages';
import { LoadingOverlay, Card, Button } from '@/components/ui';
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt';
import { GoalCreationModal } from '@/components/goals';
import { ErrorBoundary } from '@/components/errors';
import { useAppStore } from '@/store';
import { buildCalendarDay, formatDateToISO } from '@/utils';
import { 
  initializeStorage, 
  loadGoals, 
} from '@/services/storage.service';
import { mockGoals } from '@/data';
import { env } from '@/config';
import type { Goal } from '@/types';

export function App() {
  const {
    goals,
    isLoading,
    error,
    viewMode,
    selectedDate,
    setGoals,
    addGoal,
    removeGoal,
    setLoading,
    setError,
    setSelectedDate,
    setViewMode,
    toggleCompletion,
    toggleWeeklyCompletion,
    updateMonthlyProgress,
    updateGoal,
  } = useAppStore();
  
  // Goal creation/edit modals
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  const canCreateGoals = true;

  const existingCategories = useMemo(
    () => Array.from(
      new Set(
        goals
          .map(goal => goal.category.trim())
          .filter(category => category.length > 0)
      )
    ).sort((left, right) => left.localeCompare(right)),
    [goals]
  );

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

        const state = await initializeStorage();

        // If storage is not ready and has an error, show error
        if (!state.isReady && state.error) {
          setError(state.error);
          setLoading(false);
          return;
        }

        // Load goals from storage
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

  // Handle goal created
  const handleGoalCreated = useCallback((goal: Goal) => {
    addGoal(goal);
  }, [addGoal]);

  // Handle goal updated (from edit modal)
  const handleGoalUpdated = useCallback((updatedGoal: Goal) => {
    updateGoal(updatedGoal);
  }, [updateGoal]);

  // Handle goal deleted
  const handleGoalDeleted = useCallback((goalId: string) => {
    removeGoal(goalId);
  }, [removeGoal]);

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

  // Handle daily goal completion toggle
  const handleToggleTask = useCallback((goalId: string) => {
    if (selectedDate) {
      const dateStr = formatDateToISO(selectedDate);
      toggleCompletion(goalId, dateStr);
    }
  }, [selectedDate, toggleCompletion]);

  // Handle weekly goal completion toggle
  const handleToggleWeeklyCompletion = useCallback((goalId: string, weekKey: string) => {
    toggleWeeklyCompletion(goalId, weekKey);
  }, [toggleWeeklyCompletion]);

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

  // Error state
  if (error) {
    return (
      <MainLayout>
        <Card className="text-center py-8">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Failed to load goals
          </h2>
          <p className="text-text-muted mb-4">{error}</p>
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
            onToggleWeeklyCompletion={handleToggleWeeklyCompletion}
            onIncrementMonthlyProgress={handleIncrementMonthlyProgress}
            onDecrementMonthlyProgress={handleDecrementMonthlyProgress}
            onGoalUpdated={handleGoalUpdated}
            onGoalDeleted={handleGoalDeleted}
            existingCategories={existingCategories}
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
            onToggleWeeklyCompletion={handleToggleWeeklyCompletion}
            onIncrementMonthlyProgress={handleIncrementMonthlyProgress}
            onDecrementMonthlyProgress={handleDecrementMonthlyProgress}
            onGoalUpdated={handleGoalUpdated}
            onGoalDeleted={handleGoalDeleted}
            existingCategories={existingCategories}
          />
        )}

        {/* Floating Action Button for creating goals */}
        {canCreateGoals && (
          <button
            onClick={() => setShowCreateGoal(true)}
            className="fixed bottom-20 right-4 w-14 h-14 bg-accent-primary hover:bg-accent-primary/90 text-text-inverse rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40"
            aria-label="Create new goal"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}

        {/* Goal Creation Modal */}
        <GoalCreationModal
          isOpen={showCreateGoal}
          onClose={() => setShowCreateGoal(false)}
          onGoalCreated={handleGoalCreated}
          existingCategories={existingCategories}
        />
      </MainLayout>
      <PWAUpdatePrompt />
    </ErrorBoundary>
  );
}

export default App;
