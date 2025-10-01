import { useEffect, useState } from 'react';
import { RenderTimeBlocks } from '../components/calendar/CalendarHelpers';
import { CalendarControls } from '../components/calendar/CalendarControls';
import { CalendarTable } from '../components/calendar/CalendarTable';
import { CalendarAddLessonModal } from '../components/calendar/CalendarAddLessonModal';
import { ClassesT, LessonT, TeacherT, TopicT, userDataT } from '../types';
import { generateHoursArr } from '../utils/calendarUtils';
import { collection, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { User } from 'firebase/auth';

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

export const TeacherCalendar = (props: { user: User; userData: userDataT }) => {
  // Helper functions and constants
  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const now = new Date();
  const [monday, setMonday] = useState(getMonday(now));

  const [isModalOn, setIsModalOn] = useState(false);
  const [topicsArr, setTopicsArr] = useState<TopicT[]>([]);
  const [defaultBlockDate, setDefaultBlockDate] = useState<Date>(new Date());
  const availableHours = generateHoursArr();

  const daysOptions = Array.from({ length: 31 }).map((_, idx) => ({
    id: idx + 1,
    label: (idx + 1).toString(),
    value: idx + 1,
  }));

  const selectObjects = {
    hoursObj: {
      defaultId: defaultBlockDate.getHours(),
      options: availableHours.map((x) => ({ id: x, label: x.toString() })),
    },
    topicsObj: {
      defaultId: defaultBlockDate.getDay(),
      options: availableHours.map((x) => ({ id: x, label: x.toString() })),
    },
    daysObj: {
      defaultId: defaultBlockDate.getDay(),
      options: daysOptions,
    },
    monthsObj: {
      defaultId: defaultBlockDate.getMonth(),
      options: monthNames.map((name, idx) => ({ id: idx, label: name })),
    },
  };

  // Fetch topics from Firestore
  const [lessons, setLessons] = useState<LessonT[]>([]);

  useEffect(() => {
    console.log('Fetching topics from Firestore...');
    const topicsColRef = collection(db, 'topics');

    const unsubscribe = onSnapshot(topicsColRef, (snapshot) => {
      const topics: TopicT[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TopicT[];

      console.log('topicsArr: ', topics);
      setTopicsArr(topics);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const lessonsPromises = props.userData.classes.map(async (c) => {
          try {
            // 1️⃣ Fetch class document
            const classRef = doc(db, 'classes', c.id);
            const classSnap = await getDoc(classRef);

            if (!classSnap.exists()) {
              return {
                date: 0,
                status: 'scheduled',
                topic: null,
                teacher: null,
              } as LessonT;
            }

            const classData = classSnap.data() as ClassesT & { id: string };

            // 2️⃣ Lookup topic from topicsArr
            const topicData =
              topicsArr.find((t) => t.id === classData.topic_id) || null;

            // 3️⃣ Fetch teacher info safely
            const teacherData: TeacherT | null = classData.teacher_id
              ? await (async () => {
                  try {
                    const teacherRef = doc(
                      db,
                      'teachers',
                      classData.teacher_id
                    );
                    const teacherSnap = await getDoc(teacherRef);
                    return teacherSnap.exists()
                      ? (teacherSnap.data() as TeacherT)
                      : null;
                  } catch (err) {
                    console.error(
                      `Error fetching teacher ${classData.teacher_id}:`,
                      err
                    );
                    return null;
                  }
                })()
              : null;

            return {
              date: classData.date,
              status: classData.status,
              topic: topicData
                ? { heading: topicData.heading, id: topicData.id }
                : null,
              teacher: teacherData
                ? {
                    first_name: teacherData.first_name,
                    last_name: teacherData.last_name,
                    rating: teacherData.rating,
                    img: teacherData.img,
                  }
                : null,
            } as LessonT;
          } catch (err) {
            console.error(`Error fetching class ${c.id}:`, err);
            return {
              date: 0,
              status: 'scheduled',
              topic: null,
              teacher: null,
            } as LessonT;
          }
        });

        const initialLessons = await Promise.all(lessonsPromises);
        setLessons(initialLessons);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setLessons([]); // fallback if something totally unexpected happens
      }
    };

    fetchLessons();
  }, [props.userData.classes, topicsArr]);

  console.log('lessons: ', lessons);
  if (topicsArr.length === 0) {
    return <div>Loading...</div>;
  } else {
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
                  lessons={lessons}
                  defaultDate={defaultBlockDate}
                  setDefaultBlockDate={setDefaultBlockDate}
                  topicsArr={topicsArr}
                  isOn={isModalOn}
                  setIsOn={setIsModalOn}
                  selectObjects={selectObjects}
                  user={props.user}
                  userData={props.userData}
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
  }
};
