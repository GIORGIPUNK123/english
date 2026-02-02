import { X, CheckCircle } from 'lucide-react';
import { NotificationT } from '../../../../types';
import { useTimeAgo } from '../../../../hooks/useTimeAgo';
import {
  iconMap,
  DefaultIcon,
  colorMap,
  defaultColor,
} from './notificationConfig';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationT;
  markAsRead: (notification_id: string) => void;
}

export const NotificationModal = ({
  isOpen,
  onClose,
  notification,
  markAsRead,
}: NotificationModalProps) => {
  const Icon = iconMap[notification.message_type] || DefaultIcon;
  const colorClass = colorMap[notification.message_type] || defaultColor;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl'>
        {/* Header */}
        <div className='flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-800'>
          <div className='flex items-start gap-4'>
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
            >
              <Icon className='w-6 h-6' />
            </div>
            <div>
              <h2 className='mb-1 text-lg text-gray-900 dark:text-white sm:text-xl'>
                {notification.heading}
              </h2>
              <p className='text-xs text-gray-500 sm:text-sm'>
                {useTimeAgo(notification.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1 text-gray-600 transition-colors dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {notification.teacher && (
            <div className='p-3 mb-4 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700'>
              <p className='mb-1 text-xs text-gray-600 dark:text-gray-400'>
                From
              </p>
              <p className='text-sm text-gray-900 dark:text-white'>
                {notification.teacher
                  ? `${notification.teacher.first_name} ${notification.teacher.last_name}`
                  : 'Teacher'}
              </p>
            </div>
          )}

          <div className='mb-6'>
            <p className='mb-2 text-xs text-gray-600 dark:text-gray-400'>
              Message
            </p>
            <p className='text-sm leading-relaxed text-gray-700 whitespace-pre-wrap sm:text-base dark:text-gray-300'>
              {notification.message}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            {!notification.read ? (
              <span className='inline-flex items-center gap-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg'>
                <span className='w-2 h-2 bg-blue-500 rounded-full dark:bg-blue-400 animate-pulse'></span>
                Unread
              </span>
            ) : (
              <span className='inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/40 px-3 py-1.5 rounded-lg'>
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
        <div className='flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800'>
          <button
            onClick={onClose}
            className='flex-1 px-4 py-2 text-sm text-gray-900 transition-all bg-gray-200 rounded-lg dark:bg-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 sm:text-base'
          >
            Close
          </button>
          {!notification.read && (
            <button
              onClick={() => {
                markAsRead(notification.id);
                onClose();
              }}
              className='flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 sm:text-base'
            >
              <CheckCircle className='w-4 h-4' />
              Mark as Read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
