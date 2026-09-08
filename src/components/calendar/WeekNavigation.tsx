import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekNavigationProps {
  weekDates: Date[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function WeekNavigation({
  weekDates,
  onPrevWeek,
  onNextWeek,
}: WeekNavigationProps) {
  return (
    <div className='flex items-center justify-between p-3 border bg-card border-border rounded-xl'>
      <button
        onClick={onPrevWeek}
        className='p-2 transition-all rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground'
      >
        <ChevronLeft className='w-5 h-5' />
      </button>
      <div className='flex items-center gap-2 text-sm text-foreground sm:text-base'>
        <Calendar className='w-4 h-4' />
        <span>
          {weekDates[0].toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}{' '}
          -{' '}
          {weekDates[6].toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
      <button
        onClick={onNextWeek}
        className='p-2 transition-all rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground'
      >
        <ChevronRight className='w-5 h-5' />
      </button>
    </div>
  );
}
