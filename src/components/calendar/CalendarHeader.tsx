import { Plus } from 'lucide-react';
import { WeekNavigation } from './WeekNavigation';

export const CalendarHeader = (props: {
  openModal: () => void;
  weekDates: Date[];
  currentWeek: number;
  setCurrentWeek: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <div className='mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h1 className='mb-2 text-xl text-white sm:text-2xl lg:text-3xl'>
            Calendar
          </h1>
          <p className='text-sm text-gray-400 sm:text-base'>
            Schedule your English lessons
          </p>
        </div>
        <button
          className='flex items-center gap-2 px-4 py-2 text-sm text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 sm:text-base'
          onClick={props.openModal}
        >
          <Plus className='w-4 h-4' />
          <span className='hidden sm:inline'>Book Lesson</span>
        </button>
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
