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
    <div className='flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700'>
      <button
        onClick={onPrevWeek}
        className='p-2 text-gray-600 transition-all rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
      >
        <ChevronLeft className='w-5 h-5' />
      </button>
      <div className='flex items-center gap-2 text-sm text-gray-900 dark:text-white sm:text-base'>
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
        className='p-2 text-gray-600 transition-all rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
      >
        <ChevronRight className='w-5 h-5' />
      </button>
    </div>
  );
}
