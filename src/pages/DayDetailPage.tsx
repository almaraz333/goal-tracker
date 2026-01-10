/**
 * Day Detail Page - shows tasks for a specific day
 */

import { ChevronLeft } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { TaskList } from '@/components/tasks';
import type { CalendarDay } from '@/types';
import { formatDateDisplay, parseISODate } from '@/utils';

interface DayDetailPageProps {
  dayData: CalendarDay;
  onBack: () => void;
  onToggleTask: (goalId: string, subtaskId?: string) => void;
}

export function DayDetailPage({ dayData, onBack, onToggleTask }: DayDetailPageProps) {
  const date = parseISODate(dayData.date);
  
  return (
    <div className="space-y-6">
      {/* Back button and date header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div>
          <h2 className="text-xl font-bold text-gray-100">
            {formatDateDisplay(date, { weekday: 'long', month: 'short', day: 'numeric' })}
          </h2>
          <p className="text-sm text-gray-400">
            {dayData.isToday ? "Today's tasks" : dayData.isFuture ? 'Upcoming tasks' : 'Past tasks'}
          </p>
        </div>
      </div>
      
      {/* Status banner */}
      {!dayData.isFuture && dayData.totalCount > 0 && (
        <Card
          className={`
            ${dayData.status === 'complete' ? 'bg-green-900/30 border-green-700' :
              dayData.status === 'partial' ? 'bg-orange-900/30 border-orange-700' :
              'bg-red-900/30 border-red-700'}
            border
          `}
          padding="sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {dayData.status === 'complete' ? '✅' : dayData.status === 'partial' ? '🔶' : '❌'}
            </span>
            <div>
              <p className="font-medium text-gray-100">
                {dayData.status === 'complete'
                  ? 'All tasks completed!'
                  : dayData.status === 'partial'
                  ? 'Making progress...'
                  : 'Tasks remaining'}
              </p>
              <p className="text-sm text-gray-400">
                {dayData.completedCount} of {dayData.totalCount} tasks done
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Task list */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-4">
          <TaskList
            tasks={dayData.tasks}
            onToggleTask={onToggleTask}
            emptyMessage={
              dayData.isFuture
                ? 'No tasks scheduled for this day'
                : 'No tasks were scheduled for this day'
            }
          />
        </div>
      </Card>
    </div>
  );
}
