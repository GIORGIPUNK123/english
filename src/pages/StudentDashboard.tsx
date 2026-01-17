import { useEffect, useState } from 'react';
// import { Calendar } from '../components/Calendar';
// import homeImg from '../assets/home.svg';
// import calendarImg from '../assets/calendar.svg';
// import { StudentProgressMain } from '../components/progress/StudentProgressMain';
import { auth, db } from '../firebase/firebase-config';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserDataT } from '../types';
import { StudentSidebar } from '../components/studentDashboard/StudentSidebar';
import { Menu } from 'lucide-react';
import { StudentDashboardView } from '../components/studentDashboard/StudentDashboardView';
import { StudentCoursesView } from '../components/studentDashboard/StudentCoursesView';
import { StudentNotificationsView } from '../components/studentDashboard/StudentNotifications';

export const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserDataT | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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
        setUserData(docSnap.data() as UserDataT);
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

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <StudentCoursesView />;
      case 'dashboard':
        return <StudentDashboardView />;
      // case 'calendar':
      //   return <CalendarView />;
      // case 'assignments':
      //   return <AssignmentsView />;
      case 'notifications':
        return <StudentNotificationsView user={user!} />;
      // case 'settings':
      //   return <SettingsView />;
      default:
        return <StudentDashboardView />;
    }
  };

  return (
    <>
      {user && (
        <div className='min-h-screen bg-[#0f0f0f] dark flex'>
          {/* Sidebar */}
          <StudentSidebar
            user={user}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userName={`${capitalNames[0]} ${capitalNames[1]}`}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Content */}
          <main className='flex-1 p-4 overflow-hidden sm:p-6 lg:p-8'>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className='fixed z-30 flex items-center justify-center w-10 h-10 text-white transition-all bg-gray-800 border border-gray-700 rounded-lg lg:hidden top-4 left-4 hover:bg-gray-700'
            >
              <Menu className='w-5 h-5' />
            </button>

            <div className='h-full mx-auto max-w-7xl lg:mt-0 mt-14'>
              {renderContent()}
            </div>
          </main>
        </div>
      )}
    </>
  );
};
