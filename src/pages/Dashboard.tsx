import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase-config';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { TopicT, UserDataT } from '../types';
import { DashboardSidebar } from '../components/dashboard/shared/DashboardSidebar';
import { Menu } from 'lucide-react';
import { StudentDashboardView } from '../components/dashboard/studentDashboard/StudentDashboardView';
import { TeacherDashboardView } from '../components/dashboard/teacherDashboard/TeacherDashboardView';
import { NotificationsView } from '../components/dashboard/studentDashboard/NotificationsView';
import { LessonsCalendar } from '../components/calendar/LessonsCalendar';
import { Loading } from './Loading';
import { SettingsView } from '../components/dashboard/studentDashboard/SettingsView';
import { ToastContainer } from '../components/ToastNotification';
import { useToast } from '../context/ToastContext';
import { useUserMode } from '../context/UserModeContext';
import { useFirebaseNotifications } from '../hooks/useFirebaseNotifications';
import { useFirebaseLessons } from '../hooks/useFirebaseLessons';
import HistoryView from '../components/dashboard/studentDashboard/HistoryView';
import { FinishUserSetup } from '../components/dashboard/shared/FinishUserSetup';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserDataT | null>(null);
  const [loading, setLoading] = useState(true);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const { userMode, initializeUserMode } = useUserMode();

  // ✅ MOVE THESE UP
  const [topicsArr, setTopicsArr] = useState<TopicT[]>([]);
  const { lessons } = useFirebaseLessons({
    classes: userMode === 'student' ? userData?.classes : undefined,
    topicsArr,
    includeCancelled: true,
    linkForViewer: userMode === 'teacher' ? 'teacher' : 'student',
    refetchWhenKey:
      userMode === 'teacher'
        ? `${(userData?.teaching_classes || []).join(',')}-${refetchCounter}`
        : `${(userData?.classes || []).join(',')}-${refetchCounter}`,
  });
  const unCancelledLessons = lessons.filter(
    (lesson) => !lesson.status.startsWith('cancelled'),
  );
  const acceptedLessonIds = new Set(userData?.teaching_classes || []);
  const calendarLessons =
    userMode === 'teacher'
      ? unCancelledLessons.filter((l) => {
          const openRequest = l.status === 'scheduled' && l.teacher === null;
          const myLesson = acceptedLessonIds.has(l.id);
          return openRequest || myLesson;
        })
      : unCancelledLessons;
  const historyLessons =
    userMode === 'teacher'
      ? lessons.filter((lesson) => acceptedLessonIds.has(lesson.id))
      : lessons;
  console.log('lessons in dashboard:', lessons);
  console.log('Current user mode:', userMode); // Check current mode
  const navigate = useNavigate();
  const { toasts, removeToast } = useToast();

  useFirebaseNotifications(user?.uid || null);

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

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserDataT;
        setUserData(data);
        // Initialize user mode based on userData
        initializeUserMode(data);
      } else {
        setUserData(null);
        initializeUserMode(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, initializeUserMode]);

  // ✅ SAFE: effect still runs but guards inside
  useEffect(() => {
    if (!userData) return;

    const topicsColRef = collection(db, 'topics');
    const unsubscribe = onSnapshot(topicsColRef, (snapshot) => {
      const topics = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TopicT[];
      setTopicsArr(topics);
    });

    return () => unsubscribe();
  }, [userData]);

  // ✅ RETURNS COME LAST
  if (loading) return <Loading />;

  if (!userData) {
    navigate('/login');
    return null;
  }

  const needsProfileSetup =
    !userData.first_name?.trim() || !userData.last_name?.trim();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return userMode === 'student' ? (
          <StudentDashboardView
            user={user!}
            userData={userData}
            lessons={unCancelledLessons}
            topicsArr={topicsArr}
            onRefresh={() => setRefetchCounter((prev) => prev + 1)}
          />
        ) : (
          <TeacherDashboardView
            userData={userData}
            lessons={unCancelledLessons}
            onRefresh={() => setRefetchCounter((prev) => prev + 1)}
          />
        );
      case 'courses':
        return (
          <div className='text-3xl text-gray-800 dark:text-white '>
            Courses Coming Soon!
          </div>
        );
      case 'history':
        return (
          <HistoryView
            user={user!}
            userData={userData}
            lessons={historyLessons}
            loading={loading}
            topicsArr={topicsArr}
            onRefresh={() => setRefetchCounter((prev) => prev + 1)}
          />
        );
      case 'calendar':
        return (
          <LessonsCalendar
            user={user!}
            userData={userData}
            lessons={calendarLessons}
            topicsArr={topicsArr}
            userMode={userMode}
            teachingClassIds={userData.teaching_classes || []}
            onRefresh={() => setRefetchCounter((prev) => prev + 1)}
          />
        );
      case 'assignments':
        return (
          <div className='text-3xl text-gray-800 dark:text-white '>
            Assignments Coming Soon!
          </div>
        );
      case 'notifications':
        return <NotificationsView user={user!} />;
      case 'settings':
        return <SettingsView email={user!.email!} userData={userData} />;
      default:
        return userMode === 'student' ? (
          <StudentDashboardView
            user={user!}
            userData={userData}
            lessons={unCancelledLessons}
            topicsArr={topicsArr}
            onRefresh={() => setRefetchCounter((prev) => prev + 1)}
          />
        ) : (
          <TeacherDashboardView
            userData={userData}
            lessons={unCancelledLessons}
            onRefresh={() => setRefetchCounter((prev) => prev + 1)}
          />
        );
    }
  };
  const capitalNames = [
    userData.first_name.charAt(0).toUpperCase() + userData.first_name.slice(1),
    userData.last_name.charAt(0).toUpperCase() + userData.last_name.slice(1),
  ];
  return (
    <>
      {user && (
        <div className='min-h-screen dark:bg-[#0f0f0f] flex'>
          <ToastContainer toasts={toasts} onDismiss={removeToast} />
          <FinishUserSetup isOpen={needsProfileSetup} />
          {/* Sidebar */}
          <DashboardSidebar
            user={user}
            userMode={userMode}
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
              className='fixed z-30 flex items-center justify-center w-10 h-10 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg shadow-sm lg:hidden top-4 left-4 dark:bg-gray-800 dark:border-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
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
