import { httpsCallable } from 'firebase/functions';
import { useToast } from '../context/ToastContext';
import { functions } from '../firebase/firebase-config';

// Returns a function that marks a notification as read by ID
export const useMarkAsRead = () => {
  const { addToast } = useToast();

  return async (notificationId: string) => {
    try {
      const markNotificationAsReadFn = httpsCallable(
        functions,
        'markNotificationAsRead',
      );
      const result = await markNotificationAsReadFn({ notificationId });
      console.log('Mark as read result:', result);
      addToast({
        title: 'Success',
        message: 'Notification marked as read',
        type: 'success',
        duration: 3000,
      });
    } catch (err) {
      const error = err as { message?: string; code?: string };
      const code = error?.code || '';
      const friendlyMessages: Record<string, string> = {
        unauthenticated: 'Please log in and try again.',
        'permission-denied': "You don't have permission to do that.",
        'not-found': 'This notification no longer exists.',
        'failed-precondition': 'Please refresh and try again.',
        internal: 'Something went wrong. Please try again later.',
      };
      const errorMessage =
        (code && friendlyMessages[code]) ||
        (error?.message
          ? `Failed to mark as read (${error.message})`
          : 'Failed to mark as read');
      console.error('Error marking notification as read:', err);
      addToast({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        duration: 4000,
      });
    }
  };
};
