import { useBlockDetails } from '../../hooks/useBlockDetails';
import { LessonT } from '../../types';
import { daysInMonth, isCurrentDay } from '../../utils/calendarUtils';
import { Block } from './CalendarHelpers';
const THead = (props: { monday: Date }) => {
  const numOfDays = daysInMonth(
    props.monday.getMonth(),
    props.monday.getFullYear()
  );
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  return (
    <div className='flex'>
      {Array(7)
        .fill(0)
        .map((_, i) => {
          const dayNumber = props.monday.getDate() + i;
          const adjustedDay =
            dayNumber > numOfDays ? dayNumber - numOfDays : dayNumber;
          const localIsCurrent = isCurrentDay(
            adjustedDay,
            props.monday.getMonth(),
            props.monday.getFullYear()
          );
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
                <span>{adjustedDay}</span>
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
  setClickedBlockDate: (d: Date) => void;
}) => {
  const weekdays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  // Generating hours
  const hours = Array(48).fill(0);
  return (
    <div className='flex'>
      {weekdays.map((_, dayIndex) => (
        <div className='flex flex-col items-center w-full '>
          {hours.map((_, hour) => {
            const { date, isDisabled, currLesson } = useBlockDetails(
              0,
              hour / 2,
              props.monday.getDate() + dayIndex,
              props.monday.getMonth(),
              props.monday.getFullYear(),
              props.lessons
            );
            return (
              //<span className='h-20' >Test</span>
              <Block
                date={date}
                key={`${hour}-${dayIndex}-${date}`}
                name={currLesson?.topic}
                disabled={isDisabled}
                setIsModalOn={props.setIsModalOn}
                setClickedBlockDate={props.setClickedBlockDate}
              />
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
  setClickedBlockDate: (d: Date) => void;
}

export const CalendarTable: React.FC<CalendarTableProps> = ({
  monday,
  lessons,
  setIsModalOn,
  setClickedBlockDate,
}) => {
  return (
    <div className='flex-col w-full h-96'>
      <THead monday={monday} />
      <TBody
        setClickedBlockDate={setClickedBlockDate}
        setIsModalOn={setIsModalOn}
        monday={monday}
        lessons={lessons}
      />
    </div>
  );
};
