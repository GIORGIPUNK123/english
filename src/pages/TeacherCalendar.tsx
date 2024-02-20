import { useState } from 'react';
import { RenderTimeBlocks } from '../components/calendar/CalendarHelpers';
import { CalendarControls } from '../components/calendar/CalendarControls';
import { CalendarTable } from '../components/calendar/CalendarTable';
import { CalendarAddLessonModal } from '../components/calendar/CalendarAddLessonModal';
import { TopicT } from '../types';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const TeacherCalendar = () => {
  // Helper functions and constants
  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const timeArr = Array(24)
    .fill('')
    .map((_, i) => `${i < 10 ? `0${i}` : i}:00`);

  const now = new Date();
  const [monday, setMonday] = useState(getMonday(now));
  const lessons = [
    { year: 2024, day: 19, month: 0, time: 11, topic: 'Freedom' },
    // Add other lesson entries as needed
  ];
  const [isModalOn, setIsModalOn] = useState(false);
  const topicsArr: TopicT[] = [
    {
      text: 'General',
      value: 'general',
      id: 0,
    },
    {
      text: 'Freedom',
      value: 'freedom',
      id: 1,
    },
    {
      text: 'Globalization',
      value: 'globalization',
      id: 2,
    },
    {
      text: 'Global Warming',
      value: 'global_warming',
      id: 3,
    },
    {
      text: 'Nature',
      value: 'nature',
      id: 4,
    },
  ];
  const [clickedBlockDate, setClickedBlockDate] = useState<null | Date>(null);
  return (
    <div className='w-full bg-gray-200 rounded-sm '>
      <div className='container flex items-center justify-center p-5 2xl:max-w-full 2xl:px-6'>
        <div className='w-full bg-white rounded shadow wrapper'>
          <div className='flex justify-between p-2 border-b header'>
            <span className='text-lg font-bold'>
              {monday.getFullYear()} {monthNames[monday.getMonth()]}
            </span>
            <CalendarControls setMonday={setMonday} />
          </div>
          <div className='flex w-full'>
            <div className='w-[10%] flex flex-col'>
              <div className='h-14' />
              <RenderTimeBlocks arr={timeArr} />
            </div>
            <div className='w-[90%] '>
              <CalendarAddLessonModal
                defaultDate={clickedBlockDate}
                topicsArr={topicsArr}
                isOn={isModalOn}
                setIsOn={setIsModalOn}
              />
              <CalendarTable
                setClickedBlockDate={setClickedBlockDate}
                setIsModalOn={setIsModalOn}
                monday={monday}
                lessons={lessons}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
