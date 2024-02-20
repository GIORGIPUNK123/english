import { useEffect, useState } from 'react';
import { TeacherCalendar } from './TeacherCalendar';
import homeImg from '../assets/home.svg';
import calendarImg from '../assets/calendar.svg';
import { StudentProgressMain } from '../components/progress/StudentProgressMain';
import { auth } from '../firebase/firebase-config';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
export const StudentDashboard = () => {
  const [currPg, setCurrPg] = useState(0);
  const [user, setUser] = useState<User | null | 'loading'>('loading');
  const myObj = [
    { img: homeImg, text: 'Dashboard' },
    { img: calendarImg, text: 'Calendar' },
    { img: calendarImg, text: 'Calendar' },
    { img: calendarImg, text: 'Calendar' },
    { img: calendarImg, text: 'Calendar' },
  ];
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);
  if (user === null) {
    navigate('/');
  } else if (user === 'loading') {
    return null;
  } else {
    return (
      <>
        {user && (
          <div className='flex flex-col bg-black-pearl-950 pb-44'>
            <div className='relative flex items-center justify-center w-full h-24 rounded-lg '>
              <div className='z-10 flex items-center justify-center w-1/4 h-12 text-2xl text-center rounded-lg bg-slate-200'>
                Main
              </div>
              <div className='absolute flex justify-center w-full h-6 top-9 bg-torch-red-700'></div>
            </div>

            <div className='flex p-4 mx-10 mt-10 rounded-md bg-slate-800'>
              <div className='flex flex-col items-center justify-between rounded-lg w-44 h-fit'>
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
                      className={` h-14 rounded-l-md w-full bg-cover items-center justify-center flex duration-300  text-white ${
                        currPg === i
                          ? 'bg-black-pearl-950'
                          : 'hover:bg-black-pearl-950 cursor-pointer'
                      }  `}
                    >
                      {myObj[i].text}
                    </div>
                  ))}
              </div>
              <div className='w-full px-10 py-4 rounded-r-md rounded-bl-md bg-black-pearl-950'>
                {currPg === 0 && <StudentProgressMain />}

                {currPg === 1 && <TeacherCalendar />}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};
