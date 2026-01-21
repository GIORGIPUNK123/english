import { useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { NotificationT, UserDataT } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

// Import your Firebase config
// import { db } from '@/firebase/config';
// import { doc, onSnapshot } from 'firebase/firestore';

// Map your message_type to toast type
function mapMessageTypeToToastType(
  messageType: NotificationT['message_type'],
): 'info' | 'success' | 'warning' | 'error' {
  switch (messageType) {
    case 'success':
    case 'achievement':
      return 'success';
    case 'warning':
      return 'warning';
    case 'info':
    case 'course':
    case 'assignment':
    case 'calendar':
    case 'group':
      return 'info';
    default:
      return 'info';
  }
}

export function useFirebaseNotifications(userId: string | null) {
  const { addToast } = useToast();
  const previousNotificationIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!userId) {
      return;
    }
    // Firestore listener for user data
    const userDocRef = doc(db, 'userData', userId); // Adjust collection name as needed

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (!docSnapshot.exists()) {
        return;
      }

      const userData = docSnapshot.data() as UserDataT;
      const notifications = userData.notifications || [];

      // On initial load, just store existing notification IDs without showing toasts
      if (isInitialLoad.current) {
        notifications.forEach((notif) => {
          previousNotificationIds.current.add(notif.id);
        });
        isInitialLoad.current = false;
        return;
      }

      // Check for new notifications
      notifications.forEach((notif) => {
        // If this notification ID hasn't been seen before, it's new!
        if (!previousNotificationIds.current.has(notif.id)) {
          previousNotificationIds.current.add(notif.id);
          // Show toast for new notification
          addToast({
            title: notif.heading,
            message: notif.message,
            type: mapMessageTypeToToastType(notif.message_type),
            duration: 7000, // Show for 7 seconds since it's important
          });
        }
      });
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userId, addToast]);
}
