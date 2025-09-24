import React from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarBody } from './CalendarBody';
import { LessonT } from '../../types';

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
      <CalendarHeader monday={monday} />
      {/* Hour lines overlay */}
      {/* <div className='absolute top-14 left-0 w-full h-[calc(100%-3.5rem)] pointer-events-none z-10'>
        {Array.from({ length: 23 }).map((_, i) => (
          <div
            key={i}
            className='absolute left-0 w-full border-t border-gray-400'
            style={{
              top: `${((i + 1) * 100) / 48}%`,
            }}
          />
        ))}
      </div> */}

      <CalendarBody
        setDefaultBlockDate={setDefaultBlockDate}
        setIsModalOn={setIsModalOn}
        monday={monday}
        lessons={lessons}
      />
    </div>
  );
};
