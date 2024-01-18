import { useState } from 'react';
import homeImg from '../assets/home.svg';
const Lesson = (props: { name: string; time: string }) => {
  return (
    <div className='p-1 mb-1 text-sm text-white bg-purple-400 rounded event'>
      <span className='event-name'> {props.name} </span>
      <span className='time'> {props.time} </span>
    </div>
  );
};
const Block = (props: { name?: string; time?: number }) => {
  return (
    <td className='w-20 h-full cursor-pointer bg-slate-200 hover:bg-gray-300'>
      <div className='flex justify-center items-center w-full h-full'>
        {props.name && (
          <div className='inset-0 flex-col justify-center items-center w-[90%] h-[80%] text-white bg-purple-400 rounded text-md text-center'>
            <span className='text-sm'>{props.name}</span>
            <span className='text-sm'>{props.time}</span>
          </div>
        )}
      </div>
    </td>
  );
};
const TimeBlock = (props: { time: string }) => {
  return (
    <div className='flex flex-col items-center h-20'>
      <span>{props.time}</span>
    </div>
  );
};
const TableHead = (props: { text: string }) => {
  return (
    <th className='p-2 w-10 h-10 text-xs border-r lg:w-30 md:w-30 sm:w-20 xl:w-40 xl:text-sm'>
      <span>{props.text}</span>
    </th>
  );
};
export const TeacherDashboard = () => {
  const timeArr = Array(24)
    .fill('')
    .map((_, i) => {
      const hour = i < 10 ? `0${i}` : i; // Pad single-digit hours with leading zero
      return `${hour}:00`;
    });
  const [currPg, setCurrPg] = useState(0);
  return (
    <>
      <div className='flex flex-col bg-black-pearl-950'>
        <div className='flex justify-center items-center w-full h-24 rounded-lg'>
          <div className='flex justify-center items-center w-1/4 h-12 text-2xl text-center rounded-lg bg-slate-200'>
            Main
          </div>
        </div>
        <div className='flex justify-between'>
          <div className='ml-8 w-16 h-96 rounded-lg bg-slate-100'>
            <div
              className={`w-full bg-cover rounded-md duration-300 cursor-pointer ${
                currPg === 0 ? 'bg-slate-500' : 'bg-slate-400'
              }  hover:bg-slate-500 aspect-square`}
              style={{ backgroundImage: `url(${homeImg})` }}
            />
          </div>
          {/* <div className=''> */}
          <div className='mx-10 w-full bg-gray-200 rounded-sm'>
            <div className='container mx-auto mt-10 2xl:max-w-full 2xl:px-6'>
              <div className='w-full bg-white rounded shadow wrapper'>
                <div className='flex justify-between p-2 border-b header'>
                  <span className='text-lg font-bold'> 2024 December </span>
                  <div className='buttons'>
                    <button className='p-1'>
                      {/* <img src={leftArrow} alt='leftArrow' /> */}
                    </button>
                    <button className='p-1'>
                      {/* <img src={rightArrow} alt='rightArrow' /> */}
                    </button>
                  </div>
                </div>
                <div className='flex w-full'>
                  <div className='w-[10%] flex flex-col'>
                    <div className='h-7' />
                    {timeArr.map((_) => (
                      <div key={_}>
                        <TimeBlock time={_} />
                      </div>
                    ))}
                  </div>
                  <div className='w-[90%]'>
                    <table className='w-full h-96'>
                      <thead>
                        <tr>
                          <TableHead text='MON' />
                          <TableHead text='TUE' />
                          <TableHead text='WED' />
                          <TableHead text='THU' />
                          <TableHead text='FRI' />
                          <TableHead text='SAT' />
                          <TableHead text='SUN' />
                        </tr>
                      </thead>
                      <tbody>
                        {Array(24)
                          .fill(0)
                          .map((_, rowIndex) => (
                            <tr className='h-20' key={rowIndex}>
                              <Block />
                              <Block name='Lesson' time={10} />
                              <Block />
                              <Block />
                              <Block />
                              <Block />
                              <Block />
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* </div> */}
          <div />
        </div>
      </div>
    </>
  );
};
