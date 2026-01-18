import { useEffect, useState } from 'react';
// import { Calendar } from '../components/Calendar';
// import homeImg from '../assets/home.svg';
// import calendarImg from '../assets/calendar.svg';
// import { StudentProgressMain } from '../components/progress/StudentProgressMain';
import { auth, db } from '../firebase/firebase-config';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { ClassesT, LessonT, TeacherT, TopicT, UserDataT } from '../types';
import { StudentSidebar } from '../components/studentDashboard/StudentSidebar';
import { Menu } from 'lucide-react';
import { StudentDashboardView } from '../components/studentDashboard/StudentDashboardView';
import { StudentCoursesView } from '../components/studentDashboard/StudentCoursesView';
import { StudentNotificationsView } from '../components/studentDashboard/StudentNotifications';
import { StudentCalendar } from '../components/calendar/StudentCalendar';
import { Loading } from './Loading';

export const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserDataT | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ MOVE THESE UP
  const [topicsArr, setTopicsArr] = useState<TopicT[]>([]);
  const [lessons, setLessons] = useState<LessonT[]>([]);

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
      const lessonsPromises = userData.classes.map(async (c) => {
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
        return <StudentDashboardView userData={userData} lessons={lessons} />;
      case 'courses':
        return <StudentCoursesView />;
      case 'calendar':
        return (
          <StudentCalendar
            user={user!}
            userData={userData}
            lessons={lessons}
            topicsArr={topicsArr}
          />
        );
      // case 'assignments':
      //   return <AssignmentsView />;
      case 'notifications':
        return <StudentNotificationsView user={user!} />;
      // case 'settings':
      //   return <SettingsView />;
      default:
        return <StudentDashboardView userData={userData} lessons={lessons} />;
    }
  };
  const capitalNames = [
    userData.first_name.charAt(0).toUpperCase() + userData.first_name.slice(1),
    userData.last_name.charAt(0).toUpperCase() + userData.last_name.slice(1),
  ];
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
