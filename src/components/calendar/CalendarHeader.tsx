/**
 * Calendar Header with navigation
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { getMonthName } from '@/utils';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* Month/Year display */}
      <h2 className="text-xl font-bold text-gray-100">
        {getMonthName(month)} {year}
      </h2>
      
      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToday}
          className="text-sm"
        >
          Today
        </Button>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onNextMonth}
            aria-label="Next month"
            className="p-2"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
