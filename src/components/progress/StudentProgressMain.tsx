import { User, onAuthStateChanged } from 'firebase/auth';
// import leftImg from '../../assets/left-arrow.svg';
// import rightImg from '../../assets/right-arrow.svg?url';
import profileImg from '../../assets/profile.svg';
import { useEffect, useState } from 'react';
import { auth } from '../../firebase/firebase-config';
import { ViewLessonModal } from './ViewLessonModal';
import { userDataT } from '../../types';
const ProgressBlock = (props: {
  topic: string;
  date: Date;
  status: string;
  onClick: (lessonData: any) => void;
}) => {
  const myDate = props.date;
  const options: any = {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return (
    <div
      onClick={() =>
        props.onClick({
          topic: props.topic,
          teacher: 'Mr. Smith',
          date: myDate,
          status: props.status,
          description:
            'It is very important to attend this lesson. Please be on time. We will cover the topic in detail. Make sure to review the materials beforehand. If you have any questions, feel free to ask during the lesson. Looking forward to seeing you there! Thank you for your attention.',
        })
      }
      className={`h-24 mx-4 my-4 cursor-pointer ${'bg-black-pearl-800'} rounded-md w-44 hover:bg-black-pearl-700 duration-150 hover:scale-105 shadow-lg`}
    >
      <div className='flex flex-col w-full h-full text-center'>
        <span className='mt-6 text-lg font-medium text-white'>
          {myDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <span className='mt-2 text-xs font-medium text-white '>
          {myDate.toLocaleDateString('en-US', options)}
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
  const classes = userData?.classes || [];
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);
  console.log('userData in ProgressMain: ', userData);
  const totalClasses = userData.tokens + userData.used_tokens;
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
              {classes.map((lesson, index) => {
                if (lesson.date < Date.now() / 1000) {
                  return (
                    <ProgressBlock
                      key={index}
                      date={new Date(lesson.date * 1000)}
                      status={lesson.status}
                      topic={lesson.topic}
                      onClick={handleBlockClick}
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
              {classes.map((lesson, index) => {
                if (lesson.date > Date.now() / 1000) {
                  return (
                    <ProgressBlock
                      key={index}
                      date={new Date(lesson.date * 1000)}
                      status={lesson.status}
                      topic={lesson.topic}
                      onClick={handleBlockClick}
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
