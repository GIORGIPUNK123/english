import { Plus, RotateCw } from 'lucide-react';
import { WeekNavigation } from './WeekNavigation';

interface CalendarHeaderProps {
  openModal: () => void;
  weekDates: Date[];
  currentWeek: number;
  setCurrentWeek: React.Dispatch<React.SetStateAction<number>>;
  variant?: 'student' | 'teacher';
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CalendarHeader = (props: CalendarHeaderProps) => {
  const isTeacher = props.variant === 'teacher';
  return (
    <div className='mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h1 className='mb-2 text-xl text-gray-900 dark:text-white sm:text-2xl lg:text-3xl'>
            Calendar
          </h1>
          <p className='text-sm text-gray-600 dark:text-gray-400 sm:text-base'>
            {isTeacher
              ? 'Open requests from students and lessons you have accepted'
              : 'Schedule your English lessons'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-all bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed'
            onClick={props.onRefresh}
            disabled={props.isRefreshing}
          >
            <RotateCw
              className={`w-4 h-4 ${props.isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className='hidden sm:inline'>
              {props.isRefreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
          {!isTeacher && (
            <button
              className='flex items-center gap-2 px-4 py-2 text-sm text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 sm:text-base'
              onClick={props.openModal}
            >
              <Plus className='w-4 h-4' />
              <span className='hidden sm:inline'>Book Lesson</span>
            </button>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <WeekNavigation
        weekDates={props.weekDates}
        onPrevWeek={() => props.setCurrentWeek(props.currentWeek - 1)}
        onNextWeek={() => props.setCurrentWeek(props.currentWeek + 1)}
      />
    </div>
  );
};
