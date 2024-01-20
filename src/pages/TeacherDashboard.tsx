import { useState } from 'react';
import { TeacherCalendar } from './TeacherCalendar';
import homeImg from '../assets/home.svg';
import calendarImg from '../assets/calendar.svg';
export const TeacherDashboard = () => {
  const [currPg, setCurrPg] = useState(1);
  const images = [homeImg, calendarImg, calendarImg, calendarImg, calendarImg];

  return (
    <>
      <div className='flex flex-col bg-black-pearl-950'>
        <div className='flex justify-center items-center w-full h-24 rounded-lg'>
          <div className='flex justify-center items-center w-1/4 h-12 text-2xl text-center rounded-lg bg-slate-200'>
            Main
          </div>
        </div>

        <div className='flex justify-between'>
          <div className='flex flex-col justify-between ml-8 w-16 h-96 rounded-lg bg-slate-100'>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  onClick={() => {
                    if (i !== currPg) {
                      setCurrPg(i);
                    }
                  }}
                  key={i}
                  className={`w-full bg-cover rounded-md duration-300 cursor-pointer ${
                    currPg === i ? 'bg-slate-500' : 'bg-slate-400'
                  }  hover:bg-slate-500 aspect-square`}
                  style={{ backgroundImage: `url(${images[i]})` }}
                />
              ))}
          </div>
          {currPg === 1 && <TeacherCalendar />}

          <div />
        </div>
      </div>
    </>
  );
};
