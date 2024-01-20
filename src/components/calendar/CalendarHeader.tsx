// CalendarHeader.tsx
import React from 'react';

interface CalendarHeaderProps {
  year: number;
  month: number;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  year,
  month,
}) => {
  return (
    <div className='header'>
      <span className='text-lg font-bold'>
        {year} {monthNames[month]}
      </span>
    </div>
  );
};
