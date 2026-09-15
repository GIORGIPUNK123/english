import { httpsCallable } from 'firebase/functions';
import { useToast } from '../context/ToastContext';
import { functions } from '../firebase/firebase-config';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorUtils';

// Returns a function that marks a notification as read by ID.
// Resolves to true on success, false on failure (after showing an error toast).
export const useMarkAsRead = () => {
  const { addToast } = useToast();

  return async (notificationId: string): Promise<boolean> => {
    try {
      const markNotificationAsReadFn = httpsCallable(
        functions,
        'markNotificationAsRead',
      );
      await markNotificationAsReadFn({ notificationId });
      return true;
    } catch (err) {
      const friendlyMessages: Record<string, string> = {
        unauthenticated: 'Please log in and try again.',
        'permission-denied': "You don't have permission to do that.",
        'not-found': 'This notification no longer exists.',
        'failed-precondition': 'Please refresh and try again.',
        internal: 'Something went wrong. Please try again later.',
      };
      const errorMessage = getFirebaseErrorMessage(
        err,
        friendlyMessages,
        'Failed to mark as read',
      );
      console.error('Error marking notification as read:', err);
      addToast({
        title: 'Error',
        message: errorMessage,
        type: 'error',
        duration: 4000,
      });
      return false;
    }
  };
};
