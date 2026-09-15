import { useEffect, useMemo, useState } from 'react';
import { auth, db } from '../firebase/firebase-config';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useOpenGroupLessons } from '../hooks/useOpenGroupLessons';
import { useOpenLessonRequests } from '../hooks/useOpenLessonRequests';
import HistoryView from '../components/dashboard/studentDashboard/HistoryView';
import FeedbackView from '../components/dashboard/shared/FeedbackView';
import { FinishUserSetup } from '../components/dashboard/shared/FinishUserSetup';
import { useLanguage } from '../context/LanguageContext';

export const Dashboard = () => {
  const [searchParams] = useSearchParams();
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
  const enrolledClassIds =
    userMode === 'student'
      ? userData?.classes ?? []
      : userData?.teaching_classes ?? [];

  const { lessons: enrolledLessons, loading: lessonsLoading } =
    useFirebaseLessons({
      classes: enrolledClassIds,
      topicsArr,
      includeCancelled: true,
      linkForViewer: userMode === 'teacher' ? 'teacher' : 'student',
      refetchWhenKey: `${enrolledClassIds.join(',')}-${refetchCounter}`,
    });

  const { lessons: openGroupLessons, loading: openGroupLessonsLoading } =
    useOpenGroupLessons({
      enabled: userMode === 'student',
      refetchWhenKey: `open-group-${refetchCounter}-${userMode}`,
    });

  const { lessons: openLessonRequests, loading: openLessonRequestsLoading } =
    useOpenLessonRequests({
      enabled: userMode === 'teacher',
      refetchWhenKey: `open-requests-${refetchCounter}-${userMode}`,
    });

  const lessons = useMemo(() => {
    if (userMode === 'teacher') {
      const byId = new Map<string, LessonT>();
      for (const lesson of enrolledLessons) {
        byId.set(lesson.id, lesson);
      }
      for (const lesson of openLessonRequests) {
        if (!byId.has(lesson.id)) {
          byId.set(lesson.id, lesson);
        }
      }
      return Array.from(byId.values());
    }

    return enrolledLessons;
  }, [userMode, enrolledLessons, openLessonRequests]);

  const discoverableLessonsLoading =
    userMode === 'student'
      ? openGroupLessonsLoading
      : openLessonRequestsLoading;

  const unCancelledLessons = lessons.filter(
    (lesson) => !lesson.status.startsWith('cancelled'),
  );

  const openGroupLessonsForStudent: LessonT[] =
    userMode === 'student' ? openGroupLessons : [];

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
  const navigate = useNavigate();
  const { toasts, removeToast } = useToast();
  const { t } = useLanguage();

  const validTabs = new Set([
    'dashboard',
    'history',
    'feedback',
    'calendar',
    'notifications',
    'settings',
  ]);
  const openTeacherApply = searchParams.get('apply') === 'teacher';

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && validTabs.has(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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

    if (lessonsLoading || discoverableLessonsLoading) {
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
    discoverableLessonsLoading,
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
            openGroupLessons={openGroupLessonsForStudent}
            topicsArr={topicsArr}
            onRefresh={handleManualRefresh}
            isRefreshing={isManualRefreshing}
          />
        ) : (
          <TeacherDashboardView
            user={user!}
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
            loading={lessonsLoading}
            topicsArr={topicsArr}
            onRefresh={handleManualRefresh}
            isRefreshing={isManualRefreshing}
          />
        );
      case 'feedback':
        return (
          <FeedbackView
            user={user!}
            userData={userData}
            lessons={historyLessons}
            loading={lessonsLoading}
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
            openGroupLessons={openGroupLessonsForStudent}
            topicsArr={topicsArr}
            userMode={userMode}
            teachingClassIds={userData.teaching_classes || []}
            onRefresh={handleManualRefresh}
            isRefreshing={isManualRefreshing}
          />
        );
      case 'assignments':
        return (
          <div className='text-3xl font-semibold text-foreground'>
            {t('dashboard.assignmentsComingSoon')}
          </div>
        );
      case 'notifications':
        return <NotificationsView user={user!} />;
      case 'settings':
        return (
          <SettingsView
            email={user!.email!}
            userData={userData}
            openTeacherApply={openTeacherApply}
          />
        );
      default:
        return userMode === 'student' ? (
          <StudentDashboardView
            user={user!}
            userData={userData}
            lessons={unCancelledLessons}
            openGroupLessons={openGroupLessonsForStudent}
            topicsArr={topicsArr}
            onRefresh={handleManualRefresh}
            isRefreshing={isManualRefreshing}
          />
        ) : (
          <TeacherDashboardView
            user={user!}
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
        <div className='flex overflow-hidden h-dvh bg-background'>
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
          <main className='flex-1 min-w-0 p-4 overflow-hidden sm:p-6 lg:px-8 lg:py-6'>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className='fixed z-30 flex items-center justify-center w-10 h-10 transition-all border rounded-lg shadow-sm lg:hidden top-4 left-4 bg-card border-border text-foreground hover:bg-accent'
            >
              <Menu className='w-5 h-5' />
            </button>

            <div className='h-full mx-auto max-w-7xl pt-14 lg:pt-0'>
              {renderContent()}
            </div>
          </main>
        </div>
      )}
    </>
  );
};
