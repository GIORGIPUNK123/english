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
  const images = [homeImg, calendarImg, calendarImg, calendarImg, calendarImg];
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
            <div className='flex items-center justify-center w-full h-24 rounded-lg'>
              <div className='flex items-center justify-center w-1/4 h-12 text-2xl text-center rounded-lg bg-slate-200'>
                Main
              </div>
            </div>

            <div className='flex justify-between'>
              <div className='flex flex-col justify-between w-16 ml-8 rounded-lg h-96 bg-slate-100'>
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
                        currPg === i ? 'bg-indigo-950' : 'bg-slate-600'
                      }  hover:bg-slate-800 aspect-square`}
                      style={{ backgroundImage: `url(${images[i]})` }}
                    />
                  ))}
              </div>
              {currPg === 1 && <TeacherCalendar />}
              {currPg === 0 && <StudentProgressMain />}
            </div>
          </div>
        )}
      </>
    );
  }
};
