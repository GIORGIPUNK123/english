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
    <div className='flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/40'>
      <button
        onClick={onPrevWeek}
        className='p-2 text-gray-400 transition-all rounded-lg hover:bg-gray-700 hover:text-white'
      >
        <ChevronLeft className='w-5 h-5' />
      </button>
      <div className='flex items-center gap-2 text-sm text-white sm:text-base'>
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
        className='p-2 text-gray-400 transition-all rounded-lg hover:bg-gray-700 hover:text-white'
      >
        <ChevronRight className='w-5 h-5' />
      </button>
    </div>
  );
}
