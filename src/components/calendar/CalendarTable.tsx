import { useBlockDetails } from '../../hooks/useBlockDetails';
import { LessonT } from '../../types';
import {
  daysInMonth,
  isCurrentDay,
  myGetHourCorrectly,
} from '../../utils/calendarUtils';
import { Block } from './CalendarHelpers';
const THead = (props: { monday: Date }) => {
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  return (
    <div className='flex'>
      {Array(7)
        .fill(0)
        .map((_, i) => {
          const date = new Date(props.monday);
          date.setDate(props.monday.getDate() + i);
          const dayNumber = date.getDate();
          const month = date.getMonth();
          const year = date.getFullYear();
          const localIsCurrent = isCurrentDay(dayNumber, month, year);
          return (
            <div
              key={i}
              className={`${
                localIsCurrent
                  ? ' text-red-500 bg-gradient-to-b from-white to-slate-200'
                  : ''
              } p-2 h-14 text-sm border-r w-full xl:text-sm`}
            >
              <div className='flex flex-col items-center justify-center w-full'>
                <span>{dayNumber}</span>
                <span>{weekDays[i]}</span>
              </div>
            </div>
          );
        })}
    </div>
  );
};
const TBody = (props: {
  monday: Date;
  lessons: LessonT[];
  setIsModalOn: (x: boolean) => void;
  setDefaultBlockDate: (d: Date) => void;
}) => {
  const availableHours = Array(48).fill(0); // 48 half-hour blocks
  const weekdays = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className='flex flex-col w-full'>
      {availableHours.map((_, hourIdx) => (
        <div
          key={hourIdx}
          className={`flex w-full  ${hourIdx % 2 === 0 ? '' : ''} `}
        >
          {weekdays.map((dayIndex) => {
            const [myHour, myMinute] = myGetHourCorrectly(hourIdx / 2);
            const { date, isDisabled, currLesson } = useBlockDetails(
              myMinute,
              myHour,
              props.monday.getDate() + dayIndex,
              props.monday.getMonth(),
              props.monday.getFullYear(),
              props.lessons
            );
            return (
              <div className='w-full' key={`${hourIdx}-${dayIndex}`}>
                <Block
                  border={false}
                  date={date}
                  name={currLesson?.topic}
                  disabled={isDisabled}
                  setIsModalOn={props.setIsModalOn}
                  setDefaultBlockDate={props.setDefaultBlockDate}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
interface CalendarTableProps {
  monday: Date;
  lessons: LessonT[];
  setIsModalOn: (x: boolean) => void;
  setDefaultBlockDate: (d: Date) => void;
}

export const CalendarTable: React.FC<CalendarTableProps> = ({
  monday,
  lessons,
  setIsModalOn,
  setDefaultBlockDate,
}) => {
  return (
    <div className='relative w-full'>
      <THead monday={monday} />
      {/* Hour lines overlay */}
      <div className='absolute top-14 left-0 w-full h-[calc(100%-3.5rem)] pointer-events-none z-10'>
        {Array.from({ length: 23 }).map((_, i) => (
          <div
            key={i}
            className='absolute left-0 w-full border-t border-gray-400'
            style={{
              top: `${((i + 1) * 100) / 48}%`, // Corrected: every 2 blocks (1 hour)
            }}
          />
        ))}
      </div>
      <TBody
        setDefaultBlockDate={setDefaultBlockDate}
        setIsModalOn={setIsModalOn}
        monday={monday}
        lessons={lessons}
      />
    </div>
  );
};
