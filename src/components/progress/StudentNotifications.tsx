import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { notificationT, TeacherT, userDataT } from '../../types';
import homeImg from '../../assets/home.svg';
import { User } from 'firebase/auth';
import { db } from '../../firebase/firebase-config';
import { useEffect, useState } from 'react';
import { useTimeAgo } from '../../hooks/useTimeAgo';

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
  notification: notificationT;
  user_id: string;
  markAsRead: (user_id: string, notification_id: string) => void;
}) => (
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
      isOn ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
  >
    <div className='relative w-full max-w-3xl p-8 transition-transform transform scale-100 bg-white shadow-2xl dark:bg-gray-900 rounded-xl'>
      <button
        className='absolute text-gray-400 top-4 right-4 hover:text-gray-900 dark:hover:text-white'
        onClick={() => setIsOn(false)}
      >
        <span className='sr-only'>Close modal</span>
        <svg className='w-5 h-5' fill='none' viewBox='0 0 20 20'>
          <path
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M6 6l8 8M6 14L14 6'
          />
        </svg>
      </button>

      <h2 className='mb-2 text-2xl font-bold text-black dark:text-white'>
        {notification.heading}
      </h2>

      <div className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
        {notification.created_at
          ? useTimeAgo(notification.created_at)
          : 'Unknown'}
      </div>

      {notification.teacher && (
        <div className='mb-2 text-lg text-gray-700 dark:text-gray-300'>
          <span className='font-semibold'>Teacher:</span>{' '}
          {notification.teacher.first_name +
            ' ' +
            notification.teacher.last_name}
        </div>
      )}

      <div className='mb-4 text-gray-600 dark:text-gray-400'>
        <span className='font-semibold'>Message:</span> {notification.message}
      </div>

      <div className='flex justify-end mt-6'>
        <button
          className='px-6 py-2 text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700'
          onClick={() => {
            if (!notification.read) markAsRead(user_id, notification.id);
            setIsOn(false);
          }}
        >
          {!notification.read ? 'Mark as Read' : 'Close'}
        </button>
      </div>
    </div>
  </div>
);

/* ---------- Mark notification as read ---------- */
const markAsRead = async (user_id: string, notification_id: string) => {
  try {
    const userDocRef = doc(db, 'userData', user_id);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) return;

    const userData = docSnap.data() as userDataT;
    const notificationsRaw = Array.isArray(userData.notifications)
      ? userData.notifications
      : [];

    const updatedNotifications: notificationT[] = notificationsRaw.map((n) =>
      n.id === notification_id ? { ...n, read: true } : n,
    );

    await updateDoc(userDocRef, { notifications: updatedNotifications });
  } catch (err) {
    console.error('Error marking notification as read:', err);
  }
};

/* ---------- Single notification card ---------- */
const NotificationCard = ({
  notification,
  user_id,
}: {
  notification: notificationT;
  user_id: string;
}) => {
  const [isOn, setIsOn] = useState(false);

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
        onClick={() => setIsOn(true)}
        className={`flex justify-between items-center w-full p-4 rounded-xl shadow-md cursor-pointer transition transform hover:scale-[1.02] hover:shadow-lg ${
          notification.read
            ? 'bg-gray-50 dark:bg-gray-800'
            : 'bg-blue-50 dark:bg-blue-900'
        } border-l-4 ${
          notification.message_type === 'regular'
            ? 'border-gray-400'
            : notification.message_type === 'positive'
              ? 'border-green-500'
              : 'border-red-500'
        }`}
      >
        <div className='flex items-center gap-4'>
          <img className='w-12 h-12 aspect-square invert' src={homeImg} />
          <div className='flex flex-col'>
            <p className='font-semibold text-gray-900 dark:text-white'>
              {notification.heading}
            </p>
            {notification.created_at && (
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {useTimeAgo(notification.created_at)}
              </p>
            )}
            {notification.teacher && (
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                {notification.teacher.first_name}{' '}
                {notification.teacher.last_name}
              </p>
            )}
          </div>
        </div>

        {!notification.read && (
          <span className='text-sm font-bold text-blue-600 dark:text-blue-400'>
            New
          </span>
        )}
      </div>
    </>
  );
};

/* ---------- Notifications Container ---------- */
export const StudentNotifications = ({ user }: { user: User }) => {
  const userDocRef = doc(db, 'userData', user.uid);
  const [notifications, setNotifications] = useState<notificationT[]>([]);
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');

  useEffect(() => {
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (!docSnap.exists()) {
        setNotifications([]);
        return;
      }

      const userData = docSnap.data() as userDataT;
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

  const filteredNotifications = notifications.filter((n) =>
    activeTab === 'unread' ? !n.read : n.read,
  );

  return (
    <div className='flex flex-col w-full h-full px-6 py-16 bg-gray-100 rounded-md md:px-12 '>
      {/* Tabs */}
      <div className='flex justify-start gap-4 mb-6'>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-5 py-2 rounded-full font-semibold transition ${
            activeTab === 'unread'
              ? 'bg-indigo-800 text-white shadow-md'
              : 'bg-indigo-950 text-gray-700 dark:text-gray-300'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
        <button
          onClick={() => setActiveTab('read')}
          className={`px-5 py-2 rounded-full font-semibold transition ${
            activeTab === 'read'
              ? 'bg-indigo-800 text-white shadow-md'
              : 'bg-indigo-950 text-gray-700 dark:text-gray-300'
          }`}
        >
          Read ({notifications.filter((n) => n.read).length})
        </button>
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <p className='mt-10 text-center text-gray-700 dark:text-gray-400'>
          You don't have any {activeTab} notifications.
        </p>
      ) : (
        <div className='flex flex-col gap-4'>
          {filteredNotifications.map((n) => (
            <NotificationCard key={n.id} notification={n} user_id={user.uid} />
          ))}
        </div>
      )}
    </div>
  );
};
