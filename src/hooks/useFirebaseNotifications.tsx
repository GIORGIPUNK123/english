import { useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { NotificationT } from '../types';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

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
    if (!userId) return;

    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: NotificationT[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NotificationT[];

      // On initial load, just store existing IDs
      if (isInitialLoad.current) {
        notifications.forEach((notif) =>
          previousNotificationIds.current.add(notif.id),
        );
        isInitialLoad.current = false;
        return;
      }

      // Check for new notifications and show toast
      notifications.forEach((notif) => {
        if (!previousNotificationIds.current.has(notif.id)) {
          previousNotificationIds.current.add(notif.id);
          addToast({
            title: notif.heading,
            message: notif.message,
            type: mapMessageTypeToToastType(notif.message_type),
            duration: 7000,
          });
        }
      });
    });

    return () => unsubscribe();
  }, [userId, addToast]);
}
