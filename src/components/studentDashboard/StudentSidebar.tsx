import { User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Bell,
  Settings,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NotificationT, TeacherT, UserDataT } from '../../types';
import { db } from '../../firebase/firebase-config';

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'assignments', label: 'Assignments', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const StudentSidebar = ({
  user,
  activeTab,
  onTabChange,
  userName,
  isOpen,
  onClose,
}: SidebarProps) => {
  const [notifications, setNotifications] = useState<NotificationT[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const userDocRef = doc(db, 'userData', user!.uid);
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (!docSnap.exists()) {
        setNotifications([]);
        return;
      }

      const userData = docSnap.data() as UserDataT;
      const notificationsRaw = Array.isArray(userData.notifications)
        ? userData.notifications
        : [];

      const enrichNotifications = async () => {
        const buffer = await Promise.all(
          notificationsRaw.map(async (x) => {
            if (x.teacher_id) {
              try {
                const teacherRef = doc(db, 'teachers', x.teacher_id);
                const teacherSnap = await getDoc(teacherRef);
                const teacherData = teacherSnap.exists()
                  ? (teacherSnap.data() as TeacherT)
                  : null;
                return { ...x, teacher: teacherData };
              } catch {
                return { ...x, teacher: null };
              }
            }
            return { ...x, teacher: null };
          }),
        );
        setNotifications((prev) =>
          JSON.stringify(prev) === JSON.stringify(buffer) ? prev : buffer,
        );
      };

      enrichNotifications();
    });

    return () => unsubscribe();
  }, [userDocRef]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 lg:hidden'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col min-h-screen z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className='absolute text-gray-400 lg:hidden top-4 right-4 hover:text-white'
        >
          <X className='w-6 h-6' />
        </button>

        {/* User Profile Section */}
        <div className='p-6 border-b border-gray-800'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
              <UserIcon className='w-5 h-5 text-white' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-white truncate'>{userName}</h3>
              <p className='text-sm text-gray-400'>Student</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 py-4'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showBadge = item.id === 'notifications' && unreadCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-all relative ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <Icon className='flex-shrink-0 w-5 h-5' />
                <span className='flex-1 text-left'>{item.label}</span>
                {showBadge && (
                  <span className='bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center'>
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className='p-4 border-t border-gray-800'>
          <p className='text-xs text-center text-gray-500'>
            © 2026 Student Portal
          </p>
        </div>
      </aside>
    </>
  );
};
