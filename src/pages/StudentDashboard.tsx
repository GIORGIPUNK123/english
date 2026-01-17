import { useEffect, useState } from 'react';
import { Calendar } from '../components/Calendar';
import homeImg from '../assets/home.svg';
import calendarImg from '../assets/calendar.svg';
import { StudentProgressMain } from '../components/progress/StudentProgressMain';
import { auth, db } from '../firebase/firebase-config';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import profileImg from '../assets/profile.svg';
import { StudentSettings } from '../components/progress/StudentSettings';
import { doc, onSnapshot } from 'firebase/firestore';
import { userDataT } from '../types';
import { StudentNotifications } from '../components/progress/StudentNotifications';
import { Courses } from '../components/progress/Courses';

export const StudentDashboard = () => {
  const [currPg, setCurrPg] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<userDataT | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const menuItems = [
    { img: homeImg, text: 'Dashboard' },
    { img: calendarImg, text: 'Courses' },
    { img: calendarImg, text: 'Calendar' },
    { img: calendarImg, text: 'Assignments' },
    { img: calendarImg, text: 'Notifications' },
    { img: calendarImg, text: 'Settings' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate('/login');
        return;
      }
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'userData', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data() as userDataT);
      } else {
        console.warn('No data found for this user');
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-black-pearl-950'>
        <span className='text-xl text-white'>Loading...</span>
      </div>
    );
  }

  if (!userData) {
    navigate('/login');
    return null;
  }

  const capitalNames = [
    userData.first_name.charAt(0).toUpperCase() + userData.first_name.slice(1),
    userData.last_name.charAt(0).toUpperCase() + userData.last_name.slice(1),
  ];

  return (
    <>
      {user && (
        <div className='min-h-screen pb-20 bg-gradient-to-br from-black-pearl-950 to-slate-900'>
          <header className='flex items-center justify-between px-16 py-8 shadow-lg bg-black-pearl-950'>
            <h1 className='text-4xl font-bold text-white'>Student Dashboard</h1>
            <div
              onClick={() => {
                setCurrPg(5);
              }}
              className='flex items-center gap-4 px-4 py-2 transition-colors duration-300 rounded-xl hover:cursor-pointer hover:bg-slate-700 hover:text-torch-red-500'
            >
              <img
                src={user.photoURL || profileImg}
                alt='Profile'
                className='w-12 h-12 rounded-full shadow-lg'
              />
              <span className='text-xl text-gray-300'>
                {capitalNames[0]} {capitalNames[1]}
              </span>
            </div>
          </header>

          <div className='flex gap-12 mx-auto mt-14 max-w-[1600px] px-8'>
            {/* Sidebar */}
            <nav className='flex flex-col w-64 gap-3 px-6 py-10 shadow-xl bg-slate-800 rounded-2xl min-h-[700px]'>
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setCurrPg(i)}
                  className={`flex items-center gap-5 px-5 py-4 rounded-xl transition-all duration-200 text-lg font-semibold
                    ${
                      currPg === i
                        ? 'bg-torch-red-700 text-white shadow-lg'
                        : 'bg-slate-700 text-gray-200 hover:bg-torch-red-500 hover:text-white'
                    }
                  `}
                >
                  <img src={item.img} alt={item.text} className='w-7 h-7' />
                  {item.text}
                </button>
              ))}
            </nav>

            {/* Main Content */}
            <main className='flex-1 bg-white rounded-2xl shadow-xl px-14 py-12 min-h-[700px]'>
              {currPg === 0 && (
                <StudentProgressMain
                  userData={userData}
                  capitalNames={capitalNames}
                />
              )}
              {currPg === 1 && user && <Courses userData={userData} />}
              {currPg === 2 && user && (
                <Calendar user={user} userData={userData} />
              )}
              {currPg === 3 && (
                <div className='py-32 text-2xl text-center text-gray-600'>
                  Assignments coming soon!
                </div>
              )}
              {currPg === 4 && (
                <StudentNotifications
                  user={user}
                  // capitalNames={capitalNames}
                />
              )}
              {currPg === 5 && (
                <StudentSettings
                  userData={userData}
                  capitalNames={capitalNames}
                />
              )}
            </main>
          </div>
        </div>
      )}
    </>
  );
};
