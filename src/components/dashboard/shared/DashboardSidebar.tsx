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
  MessageSquare,
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
  { id: 'feedback', key: 'sidebar.feedback', icon: MessageSquare },
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
  useEffect(() => {
    if (!user?.uid) return;

    const notificationsRef = collection(
      db,
      'users',
      user.uid,
      'notifications',
    );
    const q = query(notificationsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: NotificationT[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NotificationT[];
      const unread = notifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user.uid]);
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
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 min-h-screen border-r bg-sidebar border-sidebar-border transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className='absolute transition-colors lg:hidden top-4 right-4 text-muted-foreground hover:text-foreground'
        >
          <X className='w-6 h-6' />
        </button>

        {/* User Profile Section */}
        <div className='p-6 border-b border-sidebar-border'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg brand-mark'>
              <UserIcon className='w-5 h-5' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold truncate text-sidebar-foreground'>
                {userName}
              </h3>
              <p className='text-sm text-muted-foreground'>
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
                className={`relative flex items-center w-full gap-3 px-6 py-3 transition-all ${
                  isActive
                    ? 'bg-brand-muted text-brand border-r-2 border-brand'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className='w-5 h-5 shrink-0' />
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
        <div className='p-4 border-t border-sidebar-border'>
          <p className='text-xs text-center text-muted-foreground'>
            © 2026 {t('sidebar.portal')}
          </p>
        </div>
      </aside>
    </>
  );
};
