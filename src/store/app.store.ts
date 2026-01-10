/**
 * Zustand store for application state management
 */

import { create } from 'zustand';
import type { Goal } from '@/types';
import { saveGoal } from '@/services';

interface AppState {
  // Calendar state
  currentDate: Date;
  selectedDate: Date | null;
  viewMode: 'month' | 'day';
  
  // Goals state
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setViewMode: (mode: 'month' | 'day') => void;
  navigateMonth: (direction: 'prev' | 'next') => void;
  setGoals: (goals: Goal[]) => void;
  updateGoal: (goal: Goal) => void;
  toggleCompletion: (goalId: string, date: string) => void;
  toggleSubtask: (goalId: string, subtaskId: string) => void;
  toggleDailySubtask: (goalId: string, subtaskId: string, date: string) => void;
  toggleWeeklySubtask: (goalId: string, subtaskId: string, weekKey: string) => void;
  toggleWeeklyCompletion: (goalId: string, weekKey: string) => void;
  updateMonthlyProgress: (goalId: string, monthKey: string, delta: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentDate: new Date(),
  selectedDate: null,
  viewMode: 'month',
  goals: [],
  isLoading: false,
  error: null,
  
  // Calendar actions
  setCurrentDate: (date) => set({ currentDate: date }),
  
  setSelectedDate: (date) => set({ 
    selectedDate: date,
    viewMode: date ? 'day' : 'month',
  }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  navigateMonth: (direction) => {
    const { currentDate } = get();
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    set({ currentDate: newDate });
  },
  
  // Goals actions
  setGoals: (goals) => set({ goals }),
  
  updateGoal: (updatedGoal) => {
    saveGoal(updatedGoal);
    set((state) => ({
      goals: state.goals.map(goal => 
        goal.id === updatedGoal.id ? updatedGoal : goal
      ),
    }));
  },
  
  // Toggle daily goal completion
  toggleCompletion: (goalId, date) => set((state) => {
    let updatedGoal: Goal | undefined;
    const goals = state.goals.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const completions = goal.completions.includes(date)
        ? goal.completions.filter(d => d !== date)
        : [...goal.completions, date];
      
      updatedGoal = { ...goal, completions };
      return updatedGoal;
    });
    
    if (updatedGoal) saveGoal(updatedGoal);
    return { goals };
  }),
  
  toggleSubtask: (goalId, subtaskId) => set((state) => {
    let updatedGoal: Goal | undefined;
    const goals = state.goals.map(goal => {
      if (goal.id !== goalId || !goal.subtasks) return goal;
      
      const subtasks = goal.subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      
      updatedGoal = { ...goal, subtasks };
      return updatedGoal;
    });
    
    if (updatedGoal) saveGoal(updatedGoal);
    return { goals };
  }),
  
  // Toggle daily subtask completion for a specific date
  toggleDailySubtask: (goalId, subtaskId, date) => set((state) => {
    let updatedGoal: Goal | undefined;
    const goals = state.goals.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const currentCompletions = goal.dailySubtaskCompletions ?? {};
      const dayCompletions = currentCompletions[date] ?? [];
      
      const newDayCompletions = dayCompletions.includes(subtaskId)
        ? dayCompletions.filter(id => id !== subtaskId)
        : [...dayCompletions, subtaskId];
      
      updatedGoal = {
        ...goal,
        dailySubtaskCompletions: {
          ...currentCompletions,
          [date]: newDayCompletions,
        },
      };
      return updatedGoal;
    });

    if (updatedGoal) saveGoal(updatedGoal);
    return { goals };
  }),
  
  // Toggle weekly subtask completion for a specific week
  toggleWeeklySubtask: (goalId, subtaskId, weekKey) => set((state) => {
    let updatedGoal: Goal | undefined;
    const goals = state.goals.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const currentCompletions = goal.weeklySubtaskCompletions ?? {};
      const weekCompletions = currentCompletions[weekKey] ?? [];
      
      const newWeekCompletions = weekCompletions.includes(subtaskId)
        ? weekCompletions.filter(id => id !== subtaskId)
        : [...weekCompletions, subtaskId];
      
      updatedGoal = {
        ...goal,
        weeklySubtaskCompletions: {
          ...currentCompletions,
          [weekKey]: newWeekCompletions,
        },
      };
      return updatedGoal;
    });

    if (updatedGoal) saveGoal(updatedGoal);
    return { goals };
  }),

  // Toggle weekly goal completion
  toggleWeeklyCompletion: (goalId, weekKey) => set((state) => {
    let updatedGoal: Goal | undefined;
    const goals = state.goals.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const completions = goal.completions.includes(weekKey)
        ? goal.completions.filter(k => k !== weekKey)
        : [...goal.completions, weekKey];
      
      updatedGoal = { ...goal, completions };
      return updatedGoal;
    });

    if (updatedGoal) saveGoal(updatedGoal);
    return { goals };
  }),
  
  // Update monthly goal progress
  updateMonthlyProgress: (goalId, monthKey, delta) => set((state) => {
    let updatedGoal: Goal | undefined;
    const goals = state.goals.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const currentProgress = goal.monthlyProgress?.[monthKey] ?? 0;
      const newProgress = Math.max(0, currentProgress + delta);
      
      updatedGoal = {
        ...goal,
        monthlyProgress: {
          ...goal.monthlyProgress,
          [monthKey]: newProgress,
        },
      };
      return updatedGoal;
    });

    if (updatedGoal) saveGoal(updatedGoal);
    return { goals };
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));

// Selector hooks for better performance
export const useCalendarState = () => useAppStore((state) => ({
  currentDate: state.currentDate,
  selectedDate: state.selectedDate,
  viewMode: state.viewMode,
}));

export const useGoalsState = () => useAppStore((state) => ({
  goals: state.goals,
  isLoading: state.isLoading,
  error: state.error,
}));
