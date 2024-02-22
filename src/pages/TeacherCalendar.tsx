import { useState } from 'react';
import { RenderTimeBlocks } from '../components/calendar/CalendarHelpers';
import { CalendarControls } from '../components/calendar/CalendarControls';
import { CalendarTable } from '../components/calendar/CalendarTable';
import { CalendarAddLessonModal } from '../components/calendar/CalendarAddLessonModal';
import { TopicT, selectSmallObjectT } from '../types';
import { generateHoursArr } from '../utils/calendarUtils';

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

  const now = new Date();
  const [monday, setMonday] = useState(getMonday(now));
  const lessons = [
    {
      year: 2024,
      day: 19,
      month: 0,
      time: 11,
      topic: 'Freedom',
      date: 512512512,
    },
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
  const [defaultBlockDate, setDefaultBlockDate] = useState<Date>(new Date());
  const availableHours = generateHoursArr();
  const selectObjects: {
    hoursObj: selectSmallObjectT;
    topicsObj: selectSmallObjectT;
  } = {
    hoursObj: {
      defaultId: defaultBlockDate.getHours(),
      options: availableHours.map((x) => {
        return { id: x, label: x.toString() };
      }),
    },
    topicsObj: {
      defaultId: 0,
      options: availableHours.map((x) => {
        return { id: x, label: x.toString() };
      }),
    },
  };

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
              <RenderTimeBlocks />
            </div>
            <div className='w-[90%] '>
              <CalendarAddLessonModal
                defaultDate={defaultBlockDate}
                setDefaultBlockDate={setDefaultBlockDate}
                topicsArr={topicsArr}
                isOn={isModalOn}
                setIsOn={setIsModalOn}
                selectObjects={selectObjects}
              />
              <CalendarTable
                setDefaultBlockDate={setDefaultBlockDate}
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
