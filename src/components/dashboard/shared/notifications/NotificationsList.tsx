import { NotificationT } from '../../../../types';
import { NotificationCard } from './NotificationCard';
import { Bell } from 'lucide-react';

interface NotificationsListProps {
  notifications: NotificationT[];
  markAsRead: (notification_id: string) => Promise<void>;
}

export const NotificationsList = ({
  notifications,
  markAsRead,
}: NotificationsListProps) => {
  if (notifications.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-12 text-center bg-gray-100 border border-gray-200 rounded-xl dark:bg-gray-900/50 dark:border-gray-800'>
        <Bell className='w-16 h-16 mb-4 text-gray-400 dark:text-gray-600' />
        <p className='text-lg text-gray-600 dark:text-gray-400'>
          No notifications
        </p>
        <p className='mt-2 text-sm text-gray-500 dark:text-gray-500'>
          You're all caught up!
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      ))}
    </div>
  );
};
