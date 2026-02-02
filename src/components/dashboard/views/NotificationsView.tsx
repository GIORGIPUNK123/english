import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { NotificationT } from '../../../types';
import { NotificationFilters } from '../shared/notifications/NotificationFilters';
import { NotificationsList } from '../shared/notifications/NotificationsList';
import { useMarkAsRead } from '../../../hooks/useMarkAsRead';

interface NotificationsViewProps {
  userId: string;
  userType: 'student' | 'teacher';
}

export const NotificationsView = ({
  userId,
  userType,
}: NotificationsViewProps) => {
  const [notifications, setNotifications] = useState<NotificationT[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const markAsRead = useMarkAsRead();

  useEffect(() => {
    const collectionName = userType === 'student' ? 'users' : 'teachers';
    const notificationsRef = collection(
      db,
      collectionName,
      userId,
      'notifications',
    );
    const q = query(notificationsRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications: NotificationT[] = snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        }),
      ) as NotificationT[];

      setNotifications(fetchedNotifications);
    });

    return () => unsubscribe();
  }, [userId, userType]);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.created_at - a.created_at;
    } else {
      return a.created_at - b.created_at;
    }
  });

  return (
    <div className='p-4 sm:p-6'>
      <h1 className='mb-6 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white'>
        Notifications
      </h1>

      <NotificationFilters
        filter={filter}
        sortOrder={sortOrder}
        onFilterChange={setFilter}
        onSortToggle={() =>
          setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))
        }
      />

      <NotificationsList
        notifications={sortedNotifications}
        markAsRead={markAsRead}
      />
    </div>
  );
};
