/**
 * Calendar Page - main calendar view with daily, weekly, and monthly goals
 */

import type { ReactNode } from 'react';
import { Target, Calendar, Repeat } from 'lucide-react';
import type { Goal } from '@/types';
import { CalendarMonthView } from '@/components/calendar';

interface CalendarPageProps {
  goals: Goal[];
  onDaySelect: (date: Date) => void;
  onToggleWeeklySubtask: (goalId: string, subtaskId: string, weekKey: string) => void;
  onIncrementMonthlyProgress: (goalId: string, monthKey: string) => void;
  onDecrementMonthlyProgress: (goalId: string, monthKey: string) => void;
}

export function CalendarPage({ 
  goals, 
  onDaySelect,
  onToggleWeeklySubtask,
  onIncrementMonthlyProgress,
  onDecrementMonthlyProgress,
}: CalendarPageProps) {
  const dailyGoals = goals.filter(g => g.type === 'daily' && g.status === 'active');
  const weeklyGoals = goals.filter(g => g.type === 'weekly' && g.status === 'active');
  const monthlyGoals = goals.filter(g => g.type === 'monthly' && g.status === 'active');
  
  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Daily Goals"
          value={dailyGoals.length}
          icon={<Target className="h-6 w-6 text-blue-400" />}
        />
        <StatCard
          label="Weekly Goals"
          value={weeklyGoals.length}
          icon={<Calendar className="h-6 w-6 text-purple-400" />}
        />
        <StatCard
          label="Monthly Goals"
          value={monthlyGoals.length}
          icon={<Repeat className="h-6 w-6 text-green-400" />}
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
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-xl font-bold text-gray-100">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
