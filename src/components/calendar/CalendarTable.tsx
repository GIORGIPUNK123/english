import { useBlockDetails } from '../../hooks/useBlockDetails';
import { LessonType } from '../../types';
import { daysInMonth, isCurrentDay } from '../../utils/calendarUtils';
import { Block } from '../CalendarHelpers';

const TableHeadBlock = (props: {
  weekDay: number;
  day: number;
  current?: boolean;
}) => {
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <th
      className={` ${
        props.current
          ? ' text-red-500 text-lg bg-gradient-to-b from-white to-slate-200 '
          : ''
      } p-2 w-10 h-10 text-xs border-r lg:w-30 md:w-30 sm:w-20 xl:w-40 xl:text-sm  `}
    >
      <div className='flex flex-col'>
        <span>{props.day}</span>
        <span>{weekDays[props.weekDay - 1]}</span>
      </div>
    </th>
  );
};

const THead = (props: { monday: Date }) => {
  const numOfDays = daysInMonth(
    props.monday.getMonth(),
    props.monday.getFullYear()
  );
  return Array(7)
    .fill(0)
    .map((_, i) => {
      const dayNumber = props.monday.getDate() + i;
      const adjustedDay =
        dayNumber > numOfDays ? dayNumber - numOfDays : dayNumber;
      return (
        <TableHeadBlock
          key={i}
          day={adjustedDay}
          weekDay={i + 1}
          current={isCurrentDay(
            adjustedDay,
            props.monday.getMonth(),
            props.monday.getFullYear()
          )}
        />
      );
    });
};

const TBody = (props: { monday: Date; lessons: LessonType[] }) => (
  <thead>
    {Array(24)
      .fill(0)
      .map((_, rowIndex) => (
        // Rows
        <tr className='h-20' key={rowIndex}>
          {Array(7)
            .fill(0)
            .map((_, colIndex) => {
              // Colls
              const { date, isDisabled, currLesson } = useBlockDetails(
                rowIndex,
                props.monday.getDate() + colIndex,
                props.monday.getMonth(),
                props.monday.getFullYear(),
                new Date(),
                props.lessons
              );

              return (
                <Block
                  blockDay={props.monday.getDate() + colIndex}
                  blockTime={rowIndex}
                  blockYear={props.monday.getFullYear()}
                  blockMonth={props.monday.getMonth()}
                  key={`${rowIndex}-${colIndex}-${date}`}
                  time={currLesson?.time}
                  name={currLesson?.topic}
                  disabled={isDisabled}
                />
              );
            })}
        </tr>
      ))}
  </thead>
);

interface CalendarTableProps {
  monday: Date;
  lessons: LessonType[];
}
export const CalendarTable: React.FC<CalendarTableProps> = ({
  monday,
  lessons,
}) => {
  return (
    <table className='w-full h-96'>
      <thead>
        <tr>
          <THead monday={monday} />
        </tr>
      </thead>
      <TBody monday={monday} lessons={lessons} />
    </table>
  );
};
