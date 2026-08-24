import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase-config';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { LessonT, TopicT, UserDataT } from '../types';
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
import { useLanguage } from '../context/LanguageContext';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserDataT | null>(null);
  const [loading, setLoading] = useState(true);
  const [refetchCounter, setRefetchCounter] = useState(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [hasSeenRefreshLoading, setHasSeenRefreshLoading] = useState(false);

  const { userMode, initializeUserMode } = useUserMode();

  // ✅ MOVE THESE UP
  const [topicsArr, setTopicsArr] = useState<TopicT[]>([]);
  const { lessons, loading: lessonsLoading } = useFirebaseLessons({
    classes: userMode === 'student' ? userData?.classes : undefined,
    topicsArr,
    includeCancelled: true,
    linkForViewer: userMode === 'teacher' ? 'teacher' : 'student',
    refetchWhenKey:
      userMode === 'teacher'
        ? `${(userData?.teaching_classes || []).join(',')}-${refetchCounter}`
        : `${(userData?.classes || []).join(',')}-${refetchCounter}`,
  });

  const { lessons: globallyVisibleLessons, loading: globalLessonsLoading } =
    useFirebaseLessons({
      classes: userMode === 'student' ? undefined : [],
      topicsArr,
      includeCancelled: false,
      linkForViewer: 'student',
      refetchWhenKey: `global-student-${refetchCounter}-${userMode}`,
    });

  const unCancelledLessons = lessons.filter(
    (lesson) => !lesson.status.startsWith('cancelled'),
  );

  const openGroupLessons: LessonT[] =
    userMode === 'student'
      ? globallyVisibleLessons.filter((lesson) => {
          const now = Math.floor(Date.now() / 1000);
          const inFuture = lesson.date > now;
          const hasCapacity = lesson.participantCount < lesson.maxParticipants;
          const isGroup = lesson.lessonType === 'group';
          const isAlreadyInMyClasses = (userData?.classes || []).includes(
            lesson.id,
          );
          const isAlreadyParticipant = (lesson.participantIds || []).includes(
            user?.uid || '',
          );

          return (
            isGroup &&
            lesson.status === 'scheduled' &&
            inFuture &&
            hasCapacity &&
            !isAlreadyInMyClasses &&
            !isAlreadyParticipant
          );
        })
      : [];

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
  const { t } = useLanguage();

  useFirebaseNotifications(user?.uid || null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setUserData(null);
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserDataT;
          setUserData(data);
          initializeUserMode(data);
        } else {
          setUserData(null);
          initializeUserMode(null);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

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

  useEffect(() => {
    if (!isManualRefreshing) return;

    if (topicsArr.length === 0) {
      setIsManualRefreshing(false);
      setHasSeenRefreshLoading(false);
      return;
    }

    if (lessonsLoading || globalLessonsLoading) {
      setHasSeenRefreshLoading(true);
      return;
    }

    if (hasSeenRefreshLoading) {
      setIsManualRefreshing(false);
      setHasSeenRefreshLoading(false);
    }
  }, [
    isManualRefreshing,
    hasSeenRefreshLoading,
    lessonsLoading,
    globalLessonsLoading,
  ]);

  useEffect(() => {
    if (!isManualRefreshing) return;

    const timeoutId = window.setTimeout(() => {
      setIsManualRefreshing(false);
      setHasSeenRefreshLoading(false);
    }, 10000);

    return () => window.clearTimeout(timeoutId);
  }, [isManualRefreshing]);

  const handleManualRefresh = () => {
    setIsManualRefreshing(true);
    setHasSeenRefreshLoading(false);
    setRefetchCounter((prev) => prev + 1);
  };

  // ✅ RETURNS COME LAST
  if (loading || !user) return <Loading />;

  // Auth is present but profile doc not ready yet (e.g. onCreate trigger lag).
  // Do NOT bounce to login — that was stranding signed-in users on /login.
  if (!userData) {
    return <Loading />;
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
            openGroupLessons={openGroupLessons}
            topicsArr={topicsArr}
            onRefresh={handleManualRefresh}
            isRefreshing={isManualRefreshing}
          />
        ) : (
          <TeacherDashboardView
            userData={userData}
            lessons={unCancelledLessons}
            onRefresh={handleManualRefresh}
            isRefreshing={isManualRefreshing}
          />
        );
      case 'courses':
        return (
          <div className='text-3xl text-gray-800 dark:text-white '>
            {t('dashboard.coursesComingSoon')}
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
            onRefresh={handleManualRefresh}
            isRefreshing={isManualRefreshing}
          />
        );
      case 'calendar':
        return (
          <LessonsCalendar
            user={user!}
            userData={userData}
            lessons={calendarLessons}
            openGroupLessons={openGroupLessons}
            topicsArr={topicsArr}
            userMode={userMode}
            teachingClassIds={userData.teaching_classes || []}
            onRefresh={handleManualRefresh}
            isRefreshing={isManualRefreshing}
          />
        );
      case 'assignments':
        return (
          <div className='text-3xl text-gray-800 dark:text-white '>
            {t('dashboard.assignmentsComingSoon')}
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
            openGroupLessons={openGroupLessons}
            topicsArr={topicsArr}
            onRefresh={handleManualRefresh}
            isRefreshing={isManualRefreshing}
          />
        ) : (
          <TeacherDashboardView
            userData={userData}
            lessons={unCancelledLessons}
            onRefresh={handleManualRefresh}
            isRefreshing={isManualRefreshing}
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
