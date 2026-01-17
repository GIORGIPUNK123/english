import { useEffect, useState } from 'react';
import {
  Filter,
  AlertCircle,
  CheckCircle,
  Info,
  BookOpen,
  FileText,
  Calendar,
  Users,
  Award,
  X,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { formatDistanceToNow, getTime } from 'date-fns';
import { User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { NotificationT, TeacherT, UserDataT } from '../../types';
import { useTimeAgo } from '../../hooks/useTimeAgo';

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  course: BookOpen,
  assignment: FileText,
  calendar: Calendar,
  group: Users,
  achievement: Award,
};

const DefaultIcon = Info;

const colorMap = {
  info: 'bg-blue-500/10 text-blue-400',
  success: 'bg-green-500/10 text-green-400',
  warning: 'bg-yellow-500/10 text-yellow-400',
  course: 'bg-purple-500/10 text-purple-400',
  assignment: 'bg-orange-500/10 text-orange-400',
  calendar: 'bg-cyan-500/10 text-cyan-400',
  group: 'bg-pink-500/10 text-pink-400',
  achievement: 'bg-amber-500/10 text-amber-400',
};
const defaultColor = 'bg-gray-500/10 text-gray-400';
const NotificationCard = (props: {
  notification: NotificationT;
  user_id: string;
}) => {
  const { notification, user_id } = props;
  const [isOn, setIsOn] = useState(false);
  const Icon = iconMap[notification.message_type] || DefaultIcon;
  const colorClass = colorMap[notification.message_type] || defaultColor;
  return (
    <>
      <ViewNotificationModal
        isOn={isOn}
        setIsOn={setIsOn}
        notification={notification}
        user_id={user_id}
        markAsRead={markAsRead}
      />
      <div
        className={`p-3 sm:p-4 rounded-lg border transition-all cursor-pointer hover:bg-gray-800/70 ${
          notification.read
            ? 'bg-gray-800/30 border-gray-800'
            : 'bg-gray-800/60 border-gray-700'
        }`}
        onClick={() => setIsOn(true)}
      >
        <div className='flex items-start gap-3'>
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
          >
            <Icon className='w-4 h-4 sm:w-5 sm:h-5' />
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-2'>
              <div className='flex-1 min-w-0'>
                <h4 className='flex flex-wrap items-center gap-2 mb-1 text-sm text-white sm:text-base'>
                  <span>{notification.heading}</span>
                  {!notification.read && (
                    <span className='bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap'>
                      New
                    </span>
                  )}
                </h4>
                <p className='mb-2 text-xs text-gray-400 sm:text-sm line-clamp-2'>
                  {notification.message}
                </p>
                <p className='text-xs text-gray-500'>
                  {notification.created_at
                    ? useTimeAgo(notification.created_at)
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div
        className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm'
        onClick={() => setIsOn(false)}
      /> */}
    </>
  );
};

/* ---------- Modal for viewing a single notification ---------- */
const ViewNotificationModal = ({
  isOn,
  setIsOn,
  notification,
  user_id,
  markAsRead,
}: {
  isOn: boolean;
  setIsOn: (v: boolean) => void;
  notification: NotificationT;
  user_id: string;
  markAsRead: (user_id: string, notification_id: string) => void;
}) => {
  const Icon = iconMap[notification.message_type] || DefaultIcon;
  const colorClass = colorMap[notification.message_type] || defaultColor;

  return (
    <>
      {/* Modal */}
      <div
        className={` ${isOn ? 'block' : 'hidden'} fixed inset-0 z-50 flex items-center justify-center p-4`}
      >
        <div className='bg-gray-900 border border-gray-700 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl'>
          {/* Header */}
          <div className='flex items-start justify-between p-6 border-b border-gray-800'>
            <div className='flex items-start gap-4'>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
              >
                <Icon className='w-6 h-6' />
              </div>
              <div>
                <h2 className='mb-1 text-lg text-white sm:text-xl'>
                  {notification.heading}
                </h2>
                <p className='text-xs text-gray-500 sm:text-sm'>
                  {notification.created_at
                    ? useTimeAgo(notification.created_at)
                    : 'Unknown'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOn(false)}
              className='p-1 text-gray-400 transition-colors hover:text-white'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Content */}
          <div className='p-6'>
            {notification.teacher && (
              <div className='p-3 mb-4 border border-gray-700 rounded-lg bg-gray-800/40'>
                <p className='mb-1 text-xs text-gray-400'>From</p>
                <p className='text-sm text-white'>
                  {notification.teacher.first_name}{' '}
                  {notification.teacher.last_name}
                </p>
              </div>
            )}

            <div className='mb-6'>
              <p className='mb-2 text-xs text-gray-400'>Message</p>
              <p className='text-sm leading-relaxed text-gray-300 whitespace-pre-wrap sm:text-base'>
                {notification.message}
              </p>
            </div>

            <div className='flex items-center gap-2'>
              {!notification.read ? (
                <span className='inline-flex items-center gap-2 text-xs sm:text-sm text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg'>
                  <span className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></span>
                  Unread
                </span>
              ) : (
                <span className='inline-flex items-center gap-2 text-xs sm:text-sm text-gray-400 bg-gray-800/40 px-3 py-1.5 rounded-lg'>
                  <CheckCircle className='w-3 h-3' />
                  Read
                </span>
              )}

              <span
                className={`text-xs sm:text-sm px-3 py-1.5 rounded-lg ${colorClass}`}
              >
                {notification.message_type.charAt(0).toUpperCase() +
                  notification.message_type.slice(1)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className='flex gap-3 p-6 border-t border-gray-800'>
            <button
              onClick={() => setIsOn(false)}
              className='flex-1 px-4 py-2 text-sm text-white transition-all bg-gray-800 rounded-lg hover:bg-gray-700 sm:text-base'
            >
              Close
            </button>
            {!notification.read && (
              <button
                onClick={() => markAsRead(user_id, notification.id)}
                className='flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 sm:text-base'
              >
                <CheckCircle className='w-4 h-4' />
                Mark as Read
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* ---------- Mark notification as read ---------- */
const markAsRead = async (user_id: string, notification_id: string) => {
  try {
    const userDocRef = doc(db, 'userData', user_id);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) return;

    const userData = docSnap.data() as UserDataT;
    const notificationsRaw = Array.isArray(userData.notifications)
      ? userData.notifications
      : [];

    const updatedNotifications: NotificationT[] = notificationsRaw.map((n) =>
      n.id === notification_id ? { ...n, read: true } : n,
    );

    await updateDoc(userDocRef, { notifications: updatedNotifications });
  } catch (err) {
    console.error('Error marking notification as read:', err);
  }
};
export const StudentNotificationsView = (props: { user: User }) => {
  const { user } = props;
  const userDocRef = doc(db, 'userData', user.uid);
  const [notifications, setNotifications] = useState<NotificationT[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const timeA = a.created_at;
    const timeB = b.created_at;
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };
  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='mb-2 text-xl text-white sm:text-2xl lg:text-3xl'>
          Notifications
        </h1>
        <p className='text-sm text-gray-400 sm:text-base'>
          You have {unreadCount} unread{' '}
          {unreadCount === 1 ? 'notification' : 'notifications'}
        </p>
      </div>

      {/* Filter and Sort Buttons */}
      <div className='flex flex-wrap items-center justify-between gap-3 mb-6'>
        {/* Filter Buttons */}
        <div className='flex flex-wrap items-center gap-2'>
          <Filter className='hidden w-4 h-4 text-gray-400 sm:block' />
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              Read
            </button>
          </div>
        </div>

        {/* Sort Button */}
        <button
          onClick={toggleSortOrder}
          className='flex items-center gap-2 px-3 py-2 text-sm text-gray-400 transition-all bg-gray-800 rounded-lg sm:px-4 hover:bg-gray-700 hover:text-gray-200 sm:text-base'
          title={sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
        >
          {sortOrder === 'desc' ? (
            <>
              <ArrowDown className='w-4 h-4' />
              <span className='hidden sm:inline'>Newest</span>
            </>
          ) : (
            <>
              <ArrowUp className='w-4 h-4' />
              <span className='hidden sm:inline'>Oldest</span>
            </>
          )}
        </button>
      </div>
      {/* Notifications List */}
      <div className='flex-1 space-y-3 overflow-y-auto'>
        {sortedNotifications.length === 0 ? (
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <p className='mb-1 text-sm text-gray-400 sm:text-base'>
                No notifications
              </p>
              <p className='text-xs text-gray-500 sm:text-sm'>
                {filter === 'unread' && "You're all caught up!"}
                {filter === 'read' && 'No read notifications yet'}
                {filter === 'all' && 'Check back later for updates'}
              </p>
            </div>
          </div>
        ) : (
          sortedNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              user_id={user.uid}
            />
          ))
        )}
      </div>
    </div>
  );
};
