import { User, onAuthStateChanged } from 'firebase/auth';
// import leftImg from '../../assets/left-arrow.svg';
// import rightImg from '../../assets/right-arrow.svg?url';
import profileImg from '../../assets/profile.svg';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebase-config';
import { ViewLessonModal } from './ViewLessonModal';
import { ClassesT, LessonT, TeacherT, TopicT, userDataT } from '../../types';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
const ProgressBlock = (props: {
  lesson: LessonT;
  onClickFunc: (lessonData: LessonT & { description: string }) => void;
}) => {
  const { lesson, onClickFunc } = props;

  // const options: any = {
  //   timeZone: 'UTC',
  //   year: 'numeric',
  //   month: '2-digit',
  //   day: '2-digit',
  // };
  const dateUnit = new Date(lesson.date * 1000);
  return (
    <div
      onClick={() =>
        onClickFunc({
          ...lesson,
          description:
            'It is very important to attend this lesson. Please be on time. We will cover the topic in detail. Make sure to review the materials beforehand. If you have any questions, feel free to ask during the lesson. Looking forward to seeing you there! Thank you for your attention.',
        })
      }
      className={`h-24 mx-4 my-4 cursor-pointer ${'bg-black-pearl-800'} rounded-md w-44 hover:bg-black-pearl-700 duration-150 hover:scale-105 shadow-lg`}
    >
      <div className='flex flex-col w-full h-full text-center'>
        <span className='mt-6 text-lg font-medium text-white'>
          {dateUnit.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <span className='mt-2 text-xs font-medium text-white '>
          {dateUnit.toLocaleDateString('en-US')}
        </span>
      </div>
    </div>
  );
};

export const StudentProgressMain = (props: {
  userData: userDataT;
  capitalNames: string[];
}) => {
  // console.log('profileImg: ', profileImg);
  const [user, setUser] = useState<User | null>(null);
  const userData = props.userData;
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);
  console.log('userData in ProgressMain: ', userData);
  const totalClasses = userData.tokens + userData.used_tokens;
  const [lessons, setLessons] = useState<LessonT[]>([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // 1️⃣ Fetch all topics
        const topicsColRef = collection(db, 'topics');
        const topicsSnapshot = await getDocs(topicsColRef);
        const topicsArr: TopicT[] = topicsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as TopicT)
        );

        // 2️⃣ Fetch all classes and build lessons
        const lessonsPromises = props.userData.classes.map(async (c) => {
          try {
            // Fetch class document
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

            // Lookup topic from topicsArr
            const topicData =
              topicsArr.find((t) => t.id === classData.topic_id) || null;

            // Fetch teacher info safely
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
        console.error('Error fetching lessons/topics:', err);
        setLessons([]); // fallback if something totally unexpected happens
      }
    };

    fetchLessons();
  }, [props.userData.classes]);

  // console.log('user: ', user);
  // classes.forEach((x) => {
  //   console.log('Lesson:', x.topic, 'Date:', new Date(x.date * 1000));
  // });
  const TopPart = () => {
    return (
      <div className='flex w-full mb-10 bg-white rounded-md shadow-lg'>
        <div className='flex items-center w-1/2'>
          <div
            style={{
              backgroundImage: `url(${
                user?.photoURL ? user.photoURL : profileImg
              })`,
            }}
            className='w-32 h-32 m-4 bg-center bg-no-repeat bg-contain rounded-full shadow-md '
          />

          <span className='ml-4 text-2xl '>
            {props.capitalNames[0]} {props.capitalNames[1]}
          </span>
        </div>
        <div className='flex flex-col justify-center w-1/2 px-10 font-medium'>
          <span className='text-xl text-center'>Class Tokens</span>
          <div className='relative h-5 mt-4 overflow-hidden bg-[#CCCCCC] rounded-full'>
            <div
              style={{
                width: `calc(${userData.used_tokens / totalClasses} * 100%)`,
              }}
              className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r rounded-full bg-torch-red-500`}
            />
          </div>
          <div className='flex justify-between w-full px-2 mt-2 text-lg'>
            <span
              style={{
                width: `${(userData.used_tokens / totalClasses) * 100}%`,
              }}
              className='text-center'
            >
              Spent: {userData.used_tokens}
            </span>
            <span
              style={{
                width: `${(userData.tokens / totalClasses) * 100}%`,
              }}
              className='text-center'
            >
              Remaining: {userData.tokens}
            </span>
          </div>
        </div>
      </div>
    );
  };
  const BottomPart = ({
    handleBlockClick,
  }: {
    handleBlockClick: (lessonData: any) => void;
  }) => {
    return (
      <div className='flex justify-between w-full gap-8 h-fit'>
        <div className='w-1/2 h-full pt-10'>
          <div className='w-full px-4 py-6 mb-6 text-xl font-medium text-center bg-white rounded-md shadow-lg'>
            <span>Finished Classes</span>
          </div>
          <div className='flex items-center justify-center w-full h-full '>
            <div className='flex flex-wrap items-center justify-center w-full h-full py-6 bg-white rounded-md shadow-lg '>
              {lessons.map((lesson, index) => {
                if (lesson.date < Date.now() / 1000) {
                  return (
                    <ProgressBlock
                      key={index}
                      lesson={lesson}
                      // date={new Date(lesson.date * 1000)}
                      // status={lesson.status}
                      // topic={lesson.topic!.heading}
                      // teacher={lesson.teacher}
                      onClickFunc={handleBlockClick}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
        <div className='w-1/2 h-full pt-10'>
          <div className='w-full px-4 py-6 mb-6 text-xl font-medium text-center bg-white rounded-md shadow-lg'>
            <span>Scheduled Classes</span>
          </div>
          <div className='flex items-center justify-center w-full h-full'>
            <div className='flex flex-wrap items-center justify-center w-full h-full py-6 bg-white rounded-md shadow-lg '>
              {lessons.map((lesson, index) => {
                if (lesson.date > Date.now() / 1000) {
                  return (
                    <ProgressBlock
                      key={index}
                      lesson={lesson}
                      onClickFunc={handleBlockClick}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const handleBlockClick = (lessonData: any) => {
    setSelectedLesson(lessonData);
    setModalOpen(true);
  };

  return (
    <div className='w-full p-8 bg-[#CCCCCC] rounded-sm'>
      <TopPart />
      <BottomPart handleBlockClick={handleBlockClick} />
      <ViewLessonModal
        isOn={modalOpen}
        setIsOn={setModalOpen}
        lesson={
          selectedLesson || {
            topic: '',
            teacher: '',
            date: new Date(),
            status: 'scheduled',
            description: '',
          }
        }
      />
    </div>
  );
};
