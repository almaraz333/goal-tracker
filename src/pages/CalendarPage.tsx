/**
 * Calendar Page - main calendar view with daily, weekly, and monthly goals
 */

import { useState, type ReactNode } from 'react';
import { Target, Calendar, Repeat } from 'lucide-react';
import type { Goal, GoalType } from '@/types';
import { CalendarMonthView } from '@/components/calendar';
import { GoalsListModal } from '@/components/goals';

interface CalendarPageProps {
  goals: Goal[];
  onDaySelect: (date: Date) => void;
  onToggleWeeklySubtask: (goalId: string, subtaskId: string, weekKey: string) => void;
  onIncrementMonthlyProgress: (goalId: string, monthKey: string) => void;
  onDecrementMonthlyProgress: (goalId: string, monthKey: string) => void;
  onGoalsReload?: () => void;
}

export function CalendarPage({ 
  goals, 
  onDaySelect,
  onToggleWeeklySubtask,
  onIncrementMonthlyProgress,
  onDecrementMonthlyProgress,
  onGoalsReload,
}: CalendarPageProps) {
  const [modalGoalType, setModalGoalType] = useState<GoalType | null>(null);
  
  const dailyGoals = goals.filter(g => g.type === 'daily' && g.status === 'active');
  const weeklyGoals = goals.filter(g => g.type === 'weekly' && g.status === 'active');
  const monthlyGoals = goals.filter(g => g.type === 'monthly' && g.status === 'active');

  const handleStatCardClick = (type: GoalType) => {
    setModalGoalType(type);
  };

  const handleCloseModal = () => {
    setModalGoalType(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Daily Goals"
          value={dailyGoals.length}
          icon={<Target className="h-6 w-6 text-blue-400" />}
          onClick={() => handleStatCardClick('daily')}
        />
        <StatCard
          label="Weekly Goals"
          value={weeklyGoals.length}
          icon={<Calendar className="h-6 w-6 text-purple-400" />}
          onClick={() => handleStatCardClick('weekly')}
        />
        <StatCard
          label="Monthly Goals"
          value={monthlyGoals.length}
          icon={<Repeat className="h-6 w-6 text-green-400" />}
          onClick={() => handleStatCardClick('monthly')}
        />
      </div>
      
      {/* Calendar with Weekly Sidebar and Monthly Progress */}
      <CalendarMonthView 
        goals={goals} 
        onDaySelect={onDaySelect}
        onToggleWeeklySubtask={onToggleWeeklySubtask}
        onIncrementMonthlyProgress={onIncrementMonthlyProgress}
        onDecrementMonthlyProgress={onDecrementMonthlyProgress}
      />

      {/* Goals List Modal */}
      {modalGoalType && (
        <GoalsListModal
          isOpen={modalGoalType !== null}
          onClose={handleCloseModal}
          goals={goals}
          goalType={modalGoalType}
          onGoalUpdated={onGoalsReload}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  onClick?: () => void;
}

function StatCard({ label, value, icon, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-800 hover:bg-gray-750 rounded-xl p-3 text-center transition-colors cursor-pointer group"
    >
      <div className="flex justify-center mb-1 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-xl font-bold text-gray-100">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </button>
  );
}
