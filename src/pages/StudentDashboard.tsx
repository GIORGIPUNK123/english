import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase-config';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { ClassesT, LessonT, TeacherT, TopicT, UserDataT } from '../types';
import { DashboardSidebar } from '../components/dashboard/shared/DashboardSidebar';
import { Menu } from 'lucide-react';
import { DashboardView } from '../components/dashboard/views/DashboardView';
import { NotificationsView } from '../components/dashboard/views/NotificationsView';
import { StudentCalendar } from '../components/calendar/StudentCalendar';
import { Loading } from './Loading';
import { SettingsView } from '../components/dashboard/views/SettingsView';
import { ToastContainer } from '../components/ToastNotification';
import { useToast } from '../context/ToastContext';
import { useFirebaseNotifications } from '../hooks/useFirebaseNotifications';

export const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserDataT | null>(null);
  const [loading, setLoading] = useState(true);
  console.log('User Data:', userData);
  // ✅ MOVE THESE UP
  const [topicsArr, setTopicsArr] = useState<TopicT[]>([]);
  const [lessons, setLessons] = useState<LessonT[]>([]);

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
        setUserData(docSnap.data() as UserDataT);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
    if (!userData || topicsArr.length === 0) return;

    const fetchLessons = async () => {
      const lessonsPromises = userData.classes.map(async (classId) => {
        const classRef = doc(db, 'classes', classId);
        const classSnap = await getDoc(classRef);

        if (!classSnap.exists()) {
          return {
            date: 0,
            status: 'scheduled',
            topic: null,
            teacher: null,
          } as LessonT;
        }

        const classData = classSnap.data() as ClassesT;

        const topic =
          topicsArr.find((t) => t.id === classData.topic_id) || null;

        let teacher: TeacherT | null = null;
        if (classData.teacher_id) {
          const teacherSnap = await getDoc(
            doc(db, 'teachers', classData.teacher_id),
          );
          if (teacherSnap.exists()) {
            teacher = teacherSnap.data() as TeacherT;
          }
        }

        return {
          id: classSnap.id,
          date: classData.date,
          status: classData.status,
          topic: topic ? { id: topic.id, heading: topic.heading } : null,
          teacher: teacher
            ? {
                first_name: teacher.first_name,
                last_name: teacher.last_name,
                rating: teacher.rating,
                img: teacher.img,
              }
            : null,
        } as LessonT;
      });

      setLessons(await Promise.all(lessonsPromises));
    };

    fetchLessons();
  }, [userData, topicsArr]);

  // ✅ RETURNS COME LAST
  if (loading) return <Loading />;

  if (!userData) {
    navigate('/login');
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            user={user!}
            userData={userData}
            lessons={lessons}
            topicsArr={topicsArr}
            userType='student'
          />
        );
      case 'courses':
        return (
          <div className='text-3xl text-gray-800 dark:text-white '>
            Courses Coming Soon!
          </div>
        );
      // <StudentCoursesView />;
      case 'calendar':
        return (
          <StudentCalendar
            user={user!}
            userData={userData}
            lessons={lessons}
            topicsArr={topicsArr}
          />
        );
      case 'assignments':
        return (
          <div className='text-3xl text-gray-800 dark:text-white '>
            Assignments Coming Soon!
          </div>
        );
      case 'notifications':
        return <NotificationsView userId={user!.uid} userType='student' />;
      case 'settings':
        return (
          <SettingsView
            email={user!.email!}
            userData={userData}
            capitalNames={capitalNames}
            userType='student'
          />
        );
      default:
        return (
          <DashboardView
            user={user!}
            userData={userData}
            lessons={lessons}
            topicsArr={topicsArr}
            userType='student'
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
          {/* Sidebar */}
          <DashboardSidebar
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
