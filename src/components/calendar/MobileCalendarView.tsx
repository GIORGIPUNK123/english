import { Clock } from 'lucide-react';
import { LessonT } from '../../types';
import { getLessonColor, formatTime } from './utils';

interface MobileCalendarViewProps {
  weekDates: Date[];
  lessons: LessonT[];
  onLessonClick: (lesson: LessonT) => void;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MobileCalendarView({
  weekDates,
  lessons,
  onLessonClick,
}: MobileCalendarViewProps) {
  const getEventsForDay = (dayIndex: number) => {
    return lessons.filter((event) => {
      const eventStartDate = new Date(event.date * 1000);
      const weekDay = weekDates[dayIndex];

      return (
        eventStartDate.getFullYear() === weekDay.getFullYear() &&
        eventStartDate.getMonth() === weekDay.getMonth() &&
        eventStartDate.getDate() === weekDay.getDate()
      );
    });
  };

  return (
    <div className='mt-6 lg:hidden'>
      <div className='space-y-4'>
        {days.map((day, dayIndex) => {
          const dayEvents = getEventsForDay(dayIndex);
          if (dayEvents.length === 0) return null;

          return (
            <div key={day}>
              <h3 className='flex items-center gap-2 mb-3 text-white'>
                <span className={dayIndex === 6 ? 'text-red-400' : ''}>
                  {day}
                </span>
                <span className='text-sm text-gray-500'>
                  {weekDates[dayIndex].toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </h3>
              <div className='space-y-2'>
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onLessonClick(event)}
                    className={`${getLessonColor(event)} text-white p-3 rounded-lg cursor-pointer hover:opacity-90 transition-all`}
                  >
                    <div className='mb-2 font-medium'>
                      {event.topic?.heading}
                    </div>
                    <div className='flex items-center gap-2 mb-1 text-sm text-white/80'>
                      <Clock className='w-4 h-4' />
                      <span>
                        {formatTime(event.date)} -{' '}
                        {formatTime(event.date + 3600)}
                      </span>
                    </div>
                    {event.teacher && (
                      <div className='text-sm text-white/70'>
                        {event.teacher.first_name} {event.teacher.last_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
