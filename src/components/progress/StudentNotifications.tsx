import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { notificationT, TeacherT, userDataT } from '../../types';
import homeImg from '../../assets/home.svg';
import { User } from 'firebase/auth';
import { db } from '../../firebase/firebase-config';
import { useEffect, useState } from 'react';

const ViewNotificationModal = (props: {
  isOn: boolean;
  setIsOn: (v: boolean) => void;
  notification: notificationT;
  user_id: string;
  markAsRead: (user_id: string, notification_id: string) => void;
}) => {
  const { isOn, setIsOn, notification, markAsRead, user_id } = props;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${
        isOn ? '' : 'hidden'
      }`}
    >
      <div className='relative w-full max-w-lg p-8 bg-white shadow-2xl dark:bg-black-pearl-950 rounded-xl'>
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
        <h2 className='mb-4 text-2xl font-bold text-black dark:text-white'>
          {notification.heading}
        </h2>
        <div
          className={` ${
            notification.teacher
              ? 'mb-2 text-lg text-gray-700 dark:text-gray-300'
              : 'hidden'
          }`}
        >
          <span className='font-semibold'>Teacher:</span>
          {notification.teacher?.first_name +
            ' ' +
            notification.teacher?.last_name}
        </div>

        <div className='mb-4 text-gray-600 dark:text-gray-400'>
          <span className='font-semibold'>Message:</span> {notification.message}
        </div>

        <div className='flex justify-end mt-6'>
          <button
            className='px-6 py-2 text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700'
            onClick={() => {
              if (!notification.read) {
                markAsRead(user_id, notification.id);
              }
              setIsOn(false);
            }}
          >
            {!notification.read ? ' Mark as Read' : 'close'}
          </button>
        </div>
      </div>
    </div>
  );
};

const markAsRead = async (user_id: string, notification_id: string) => {
  try {
    const userDocRef = doc(db, 'userData', user_id);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      console.warn('User not found:', user_id);
      return;
    }

    const userData = docSnap.data() as userDataT;
    const notificationsRaw = Array.isArray(userData.notifications)
      ? userData.notifications
      : [];

    const updatedNotifications: notificationT[] = notificationsRaw.map((n) =>
      n.id === notification_id
        ? { ...n, read: true } // mark as read
        : n
    );

    await updateDoc(userDocRef, {
      notifications: updatedNotifications,
    });

    console.log('Notification marked as read:', notification_id);
  } catch (err) {
    console.error('Error marking notification as read:', err);
  }
};
const Notification = (props: {
  notification: notificationT;
  user_id: string;
}) => {
  const { teacher, message_type, read, heading } = props.notification;
  const [isOn, setIsOn] = useState(false);

  return (
    <>
      <ViewNotificationModal
        notification={props.notification}
        isOn={isOn}
        setIsOn={setIsOn}
        markAsRead={markAsRead}
        user_id={props.user_id}
      />
      {teacher ? (
        <div
          className={`flex justify-between w-full h-24 bg-gray-200 rounded-2xl hover:bg-gray-300 duration-200 hover:scale-105 ${
            message_type === 'regular'
              ? 'border-b-slate-500'
              : message_type === 'positive'
              ? 'border-b-green-600'
              : 'border-b-torch-red-600'
          } border-b-2 p-4`}
        >
          {/* Left side (clickable area) */}
          <div
            onClick={() => {
              setIsOn(true);
            }}
            className='flex items-center flex-1 gap-2 cursor-pointer'
          >
            {/* Teacher name block */}
            <div className='flex items-center gap-2'>
              <img className='w-10 h-10 aspect-square invert' src={homeImg} />
              <p className='whitespace-nowrap'>
                {teacher.first_name} {teacher.last_name}
              </p>
            </div>

            {/* Heading in the center of left block */}
            <div className='flex justify-center flex-1'>
              <p className='text-center'>{heading}</p>
            </div>
          </div>

          {/* Right side (button) */}
          <div className='flex items-center'>
            <button
              className={`${
                read
                  ? 'hidden'
                  : '  text-white h-8 bg-black-pearl-900 rounded-lg text-lg px-4 cursor-pointer underline underline-offset-1'
              }`}
            >
              Mark As Read
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`flex justify-between w-full p-4 h-24 bg-gray-300 rounded-2xl hover:bg-gray-200 duration-200 hover:scale-105 ${
            message_type === 'regular'
              ? 'border-b-slate-500'
              : message_type === 'positive'
              ? 'border-b-green-600'
              : 'border-b-torch-red-600'
          } border-b-2`}
        >
          <div>
            <img src={homeImg} />
          </div>
          <div>
            <p>{heading}</p>
          </div>
        </div>
      )}
    </>
  );
};

export const StudentNotifications = (props: { user: User }) => {
  const userDocRef = doc(db, 'userData', props.user.uid);
  const [notifications, setNotifications] = useState<notificationT[]>([]);
  const [activeBtn, setActiveBtn] = useState(0);
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

      // Run async logic separately
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
          })
        );

        setNotifications((prev) => {
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(buffer);
          return prevStr === newStr ? prev : buffer;
        });
      };

      enrichNotifications();
    });

    return () => unsubscribe();
  }, [userDocRef]);
  const filteredNotifications = notifications.filter((notification) =>
    activeBtn === 0 ? !notification.read : notification.read
  );
  return (
    <div className='flex justify-center w-full py-16 bg-gray-100'>
      <div className='flex flex-col w-full max-w-2xl'>
        <div className='flex '>
          <button
            onClick={() => {
              if (activeBtn !== 0) {
                setActiveBtn(0);
              }
            }}
            className={`${
              activeBtn === 0 ? 'bg-white' : 'bg-gray-200'
            } w-20 h-8  rounded-tl-2xl`}
          >
            New
          </button>
          <button
            onClick={() => {
              if (activeBtn !== 1) {
                setActiveBtn(1);
              }
            }}
            className={`${
              activeBtn === 1 ? 'bg-white' : 'bg-gray-200'
            } w-20 h-8  rounded-tr-2xl`}
          >
            Read
          </button>
        </div>
        <div className='flex flex-col items-center gap-8 p-12 bg-white shadow-2xl rounded-b-2xl rounded-tr-2xl '>
          {filteredNotifications.length === 0 ? (
            <p className='mb-4 text-lg text-gray-700'>
              You don't have any notifications.
            </p>
          ) : (
            filteredNotifications.map((notification, _index) => {
              return (
                <Notification
                  key={_index}
                  user_id={props.user.uid}
                  notification={notification}
                />
              );
            })
          )}

          <p className='text-sm text-gray-500'>
            Please check back later for updates.
          </p>
        </div>
      </div>
    </div>
  );
};
