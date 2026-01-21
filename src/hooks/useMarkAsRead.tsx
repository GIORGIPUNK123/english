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
      await markNotificationAsReadFn({ notificationId });
      addToast({
        title: 'Success',
        message: 'Notification marked as read',
        type: 'success',
        duration: 3000,
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      addToast({
        title: 'Error',
        message: 'Failed to mark notification as read',
        type: 'error',
        duration: 4000,
      });
    }
  };
};
