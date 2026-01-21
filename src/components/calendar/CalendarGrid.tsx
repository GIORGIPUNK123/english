import { Clock } from 'lucide-react';
import { LessonT } from '../../types';
import {
  isEventInDayAndHour,
  createTimestamp,
  isTimestampConflicting,
  isTimestampTooSoon,
  getLessonColor,
  formatTime,
} from './utils';

interface ScheduleModalState {
  day: number;
  hour: number;
  minute: number;
  week: number;
}
interface CalendarGridProps {
  weekDates: Date[];
  lessons: LessonT[];
  currentWeek: number;
  onLessonClick: (lesson: LessonT) => void;
  onTimeSlotClick: (scheduleState: ScheduleModalState) => void;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export function CalendarGrid({
  weekDates,
  lessons,
  currentWeek,
  onLessonClick,
  onTimeSlotClick,
}: CalendarGridProps) {
  const getEventsForDayAndHour = (day: number, hour: number) => {
    return lessons.filter((event) =>
      isEventInDayAndHour(event, day, hour, weekDates),
    );
  };

  const isTimeSlotAvailable = (
    dayIndex: number,
    hour: number,
    minute: number,
  ) => {
    const timestamp = createTimestamp(weekDates, dayIndex, hour, minute);
    return (
      !isTimestampConflicting(timestamp, lessons) &&
      !isTimestampTooSoon(timestamp)
    );
  };

  return (
    <div className='flex-1 overflow-auto bg-white border border-gray-200 shadow-lg dark:bg-gray-800/40 rounded-xl dark:border-gray-700'>
      <div className='min-w-[800px]'>
        {/* Days Header */}
        <div className='grid grid-cols-[80px_repeat(7,1fr)] bg-white dark:bg-gray-800/40 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700'>
          <div className='p-3 border-r border-gray-200 dark:border-gray-700'></div>
          {days.map((day, index) => {
            const date = weekDates[index];
            const isToday = date.toDateString() === new Date().toDateString();
            const isSunday = index === 6;
            return (
              <div
                key={day}
                className={`p-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                  isToday ? 'bg-blue-500/10' : ''
                }`}
              >
                <div
                  className={`text-sm font-medium ${isSunday ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}
                >
                  {day}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isToday
                      ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center mx-auto'
                      : isSunday
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div>
          {hours.map((hour) => (
            <div
              key={hour}
              className='grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200 dark:border-gray-700 last:border-b-0'
            >
              {/* Time Label */}
              <div className='flex items-start p-3 text-xs text-gray-600 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400'>
                {hour.toString().padStart(2, '0')}:00
              </div>

              {/* Day Cells */}
              {days.map((_, dayIndex) => {
                const dayEvents = getEventsForDayAndHour(dayIndex, hour);
                const isSlot00Available = isTimeSlotAvailable(
                  dayIndex,
                  hour,
                  0,
                );
                const isSlot30Available = isTimeSlotAvailable(
                  dayIndex,
                  hour,
                  30,
                );

                return (
                  <div
                    key={dayIndex}
                    className='min-h-[80px] border-r border-gray-200 dark:border-gray-700 last:border-r-0 transition-all relative'
                  >
                    {/* Top Half (00 minutes) - Clickable */}
                    <div
                      className={`absolute inset-x-0 top-0 h-1/2 p-2 group ${
                        isSlot00Available
                          ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/30'
                          : 'cursor-not-allowed bg-gray-100 dark:bg-gray-800/30'
                      }`}
                      onClick={() => {
                        if (isSlot00Available) {
                          onTimeSlotClick({
                            day: dayIndex,
                            hour,
                            minute: 0,
                            week: currentWeek,
                          });
                        }
                      }}
                    >
                      <div
                        className={`opacity-0 group-hover:opacity-100 transition-all text-[10px] ${
                          isSlot00Available
                            ? 'text-gray-600 dark:text-gray-400'
                            : 'text-red-500'
                        }`}
                      >
                        {isSlot00Available
                          ? `+ ${hour.toString().padStart(2, '0')}:00`
                          : '✕ Unavailable'}
                      </div>
                    </div>

                    {/* Bottom Half (30 minutes) - Clickable */}
                    <div
                      className={`absolute inset-x-0 bottom-0 h-1/2 p-2 group ${
                        isSlot30Available
                          ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/30'
                          : 'cursor-not-allowed bg-gray-100 dark:bg-gray-800/30'
                      }`}
                      onClick={() => {
                        if (isSlot30Available) {
                          onTimeSlotClick({
                            day: dayIndex,
                            hour,
                            minute: 30,
                            week: currentWeek,
                          });
                        }
                      }}
                    >
                      <div
                        className={`opacity-0 group-hover:opacity-100 transition-all text-[10px] ${
                          isSlot30Available
                            ? 'text-gray-600 dark:text-gray-400'
                            : 'text-red-500'
                        }`}
                      >
                        {isSlot30Available
                          ? `+ ${hour.toString().padStart(2, '0')}:30`
                          : '✕ Unavailable'}
                      </div>
                    </div>

                    {/* Events */}
                    {dayEvents.map((event) => {
                      const eventStartDate = new Date(event.date * 1000);
                      const eventMinute = eventStartDate.getMinutes();
                      const isHalfHour = eventMinute === 30;

                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onLessonClick(event);
                          }}
                          className={`${getLessonColor(event)} text-white p-2 rounded text-xs cursor-pointer hover:opacity-90 transition-all absolute left-2 right-2 ${
                            isHalfHour ? 'bottom-0 translate-y-1/2' : 'top-2'
                          }`}
                          style={{
                            zIndex: isHalfHour ? 2 : 1,
                          }}
                        >
                          <div className='mb-1 font-medium'>
                            {event.topic?.heading}
                          </div>
                          <div className='flex items-center gap-1 text-white/80'>
                            <Clock className='w-3 h-3' />
                            <span>
                              {formatTime(event.date)} -{' '}
                              {formatTime(event.date + 3600)}
                            </span>
                          </div>
                          {event.teacher && (
                            <div className='text-white/70 mt-1 text-[10px]'>
                              {event.teacher.first_name}{' '}
                              {event.teacher.last_name}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
