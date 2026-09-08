import { Plus, RotateCw } from 'lucide-react';
import { WeekNavigation } from './WeekNavigation';
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();
  return (
    <div className='mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h1 className='mb-2 text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl'>
            {t('calendar.calendarTitle')}
          </h1>
          <p className='text-sm sm:text-base text-muted-foreground'>
            {isTeacher ? t('calendar.teacherOpenSummary') : t('calendar.studentSummary')}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            className='flex items-center gap-2 px-3 py-2 text-sm transition-all rounded-lg bg-accent text-foreground hover:bg-accent/80 disabled:opacity-60 disabled:cursor-not-allowed'
            onClick={props.onRefresh}
            disabled={props.isRefreshing}
          >
            <RotateCw
              className={`w-4 h-4 ${props.isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className='hidden sm:inline'>
              {props.isRefreshing ? t('calendar.refreshing') : t('calendar.refresh')}
            </span>
          </button>
          {!isTeacher && (
            <button
              className='flex items-center gap-2 px-4 py-2 text-sm sm:text-base btn-primary'
              onClick={props.openModal}
            >
              <Plus className='w-4 h-4' />
              <span className='hidden sm:inline'>{t('calendar.bookLesson')}</span>
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
