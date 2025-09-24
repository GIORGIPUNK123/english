import { isCurrentDay } from '../../utils/calendarUtils';

export const CalendarHeader = (props: { monday: Date }) => {
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
