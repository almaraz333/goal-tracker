/**
 * Day status indicator - shows completion status as a colored dot/bar
 */

import type { DayStatus, MonthStatus } from '@/types';

interface DayStatusIndicatorProps {
  status: DayStatus;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dot' | 'bar';
}

const statusColors: Record<DayStatus, string> = {
  complete: 'bg-green-500',
  incomplete: 'bg-red-500',
  partial: 'bg-orange-500',
  none: 'bg-gray-700',
};

const sizeStyles = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
};

export function DayStatusIndicator({
  status,
  size = 'md',
  variant = 'dot',
}: DayStatusIndicatorProps) {
  if (variant === 'bar') {
    return (
      <div
        className={`w-full h-1 rounded-full ${statusColors[status]}`}
      />
    );
  }
  
  return (
    <div
      className={`rounded-full ${statusColors[status]} ${sizeStyles[size]}`}
    />
  );
}

interface MonthStatusIndicatorProps {
  status: MonthStatus;
}

const monthStatusColors: Record<MonthStatus, string> = {
  green: 'text-green-500',
  orange: 'text-orange-500',
  red: 'text-red-500',
  none: 'text-gray-500',
};

export function MonthStatusIndicator({ status }: MonthStatusIndicatorProps) {
  const icon = status === 'green' ? '✓' : status === 'none' ? '○' : '●';
  
  return (
    <span className={`text-lg ${monthStatusColors[status]}`}>
      {icon}
    </span>
  );
}
