import { User } from 'firebase/auth';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Bell,
  Settings,
  User as UserIcon,
  X,
  History,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NotificationT } from '../../../types';
import { db } from '../../../firebase/firebase-config';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useLanguage } from '../../../context/LanguageContext';

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  userMode: 'student' | 'teacher';
}

const navItems = [
  { id: 'dashboard', key: 'sidebar.dashboard', icon: LayoutDashboard },
  { id: 'courses', key: 'sidebar.courses', icon: BookOpen },
  { id: 'history', key: 'sidebar.history', icon: History },
  { id: 'calendar', key: 'sidebar.calendar', icon: Calendar },
  { id: 'assignments', key: 'sidebar.assignments', icon: FileText },
  { id: 'notifications', key: 'sidebar.notifications', icon: Bell },
  { id: 'settings', key: 'sidebar.settings', icon: Settings },
];

export const DashboardSidebar = ({
  user,
  activeTab,
  onTabChange,
  userName,
  isOpen,
  onClose,
  userMode,
}: SidebarProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useLanguage();
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Get unread count from user document

  const userNotificationsColRef = collection(
    db,
    'users',
    user!.uid,
    'notifications',
  );
  useEffect(() => {
    // Listen to notifications subcollection
    const q = query(userNotificationsColRef); // you can add orderBy if needed
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: NotificationT[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NotificationT[];
      console.log('Notifications:', notifications);
      const unread = notifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [userNotificationsColRef]);
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
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 flex flex-col min-h-screen  z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className='absolute text-gray-500 lg:hidden top-4 right-4 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        >
          <X className='w-6 h-6' />
        </button>

        {/* User Profile Section */}
        <div className='p-6 border-b border-gray-200 dark:border-gray-800'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600'>
              <UserIcon className='w-5 h-5 text-white' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-gray-900 truncate dark:text-white'>
                {userName}
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {userMode === 'teacher' ? t('sidebar.teacher') : t('sidebar.student')}
              </p>
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
                    ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className='shrink-0 w-5 h-5' />
                <span className='flex-1 text-left'>{t(item.key)}</span>
                {showBadge && (
                  <span className='bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-5 text-center'>
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className='p-4 border-t border-gray-200 dark:border-gray-800'>
          <p className='text-xs text-center text-gray-400 dark:text-gray-500'>
            © 2026 {t('sidebar.portal')}
          </p>
        </div>
      </aside>
    </>
  );
};
