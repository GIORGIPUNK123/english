import { useState } from 'react';
import { NotificationT } from '../../../../types';
import { useTimeAgo } from '../../../../hooks/useTimeAgo';
import {
  iconMap,
  DefaultIcon,
  colorMap,
  defaultColor,
} from './notificationConfig';
import { NotificationModal } from './NotificationModal';

interface NotificationCardProps {
  notification: NotificationT;
  markAsRead: (notification_id: string) => void;
}

export const NotificationCard = ({
  notification,
  markAsRead,
}: NotificationCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const Icon = iconMap[notification.message_type] || DefaultIcon;
  const colorClass = colorMap[notification.message_type] || defaultColor;

  return (
    <>
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notification={notification}
        markAsRead={markAsRead}
      />
      <div
        className={`p-3 sm:p-4 rounded-lg border transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/70 ${
          notification.read
            ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800'
            : 'bg-white dark:bg-gray-800/60 border-gray-300 dark:border-gray-700'
        }`}
        onClick={() => setIsModalOpen(true)}
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
                <h4 className='flex flex-wrap items-center gap-2 mb-1 text-sm text-gray-900 dark:text-white sm:text-base'>
                  <span>{notification.heading}</span>
                  {!notification.read && (
                    <span className='bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap'>
                      New
                    </span>
                  )}
                </h4>
                <p className='mb-2 text-xs text-gray-600 sm:text-sm dark:text-gray-400 line-clamp-2'>
                  {notification.message}
                </p>
                <p className='text-xs text-gray-500'>
                  {useTimeAgo(notification.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
