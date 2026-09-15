import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from './firebaseAdmin';

/**
 * Helper function to add a notification to user's subcollection
 * Use this throughout your functions to create notifications
 */
export async function addNotificationToUser(
  userId: string,
  heading: string,
  message: string,
  messageType:
    | 'info'
    | 'success'
    | 'warning'
    | 'course'
    | 'assignment'
    | 'calendar'
    | 'group'
    | 'achievement' = 'info',
) {
  const notificationId = db.collection('users').doc().id;
  await db
    .collection('users')
    .doc(userId)
    .collection('notifications')
    .doc(notificationId)
    .set({
      created_at: Math.floor(Date.now() / 1000),
      heading,
      message,
      message_type: messageType,
      read: false,
    });
  return notificationId;
}

/* =====================================================
   TEACHER APPLICATION NOTIFICATION
   ===================================================== */
type NotifyTeacherApplicationData = {
  studentName: string;
  studentEmail?: string;
};

export const notifyTeacherApplication = onCall<NotifyTeacherApplicationData>(
  async ({ auth, data }) => {
    console.log('[TEACHER APP] Function invoked');
    if (!auth) throw new HttpsError('unauthenticated', 'Login required');

    const { studentName } = data;
    if (!studentName) {
      throw new HttpsError('invalid-argument', 'Missing studentName');
    }

    const studentId = auth.uid;

    try {
      // Create a confirmation notification for the student
      await addNotificationToUser(
        studentId,
        'Teacher Application Submitted',
        `Your teacher application has been received. Our team will review it and get back to you within 3-5 business days.`,
        'achievement',
      );

      console.log(
        `[TEACHER APP] Notification created for student ${studentId}`,
      );

      return { success: true, message: 'Application notification sent' };
    } catch (error: unknown) {
      console.error('[TEACHER APP] Error:', error);
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new HttpsError(
        'internal',
        'Failed to process application: ' + message,
      );
    }
  },
);

/* =====================================================
   MARK NOTIFICATION AS READ
   ===================================================== */
type MarkNotificationAsReadData = {
  notificationId: string;
};

export const markNotificationAsRead = onCall<MarkNotificationAsReadData>(
  async ({ auth, data }) => {
    console.log('[MARK READ] Function invoked');
    if (!auth) throw new HttpsError('unauthenticated', 'Login required');

    const { notificationId } = data;
    if (!notificationId) {
      throw new HttpsError('invalid-argument', 'Missing notificationId');
    }

    const userId = auth.uid;
    console.log(
      `[MARK READ] User ID: ${userId}, Notification ID: ${notificationId}`,
    );

    await db.runTransaction(async (tx) => {
      // Check users
      const userRef = db.collection('users').doc(userId);
      const userSnap = await tx.get(userRef);

      if (userSnap.exists) {
        console.log('[MARK READ] Found user in users collection');
        const notificationRef = userRef
          .collection('notifications')
          .doc(notificationId);
        const notificationSnap = await tx.get(notificationRef);

        if (notificationSnap.exists) {
          tx.update(notificationRef, { read: true });
          console.log('[MARK READ] Notification marked as read for student');
          return;
        }
        console.warn('[MARK READ] Notification not found in users collection');
        throw new HttpsError('not-found', 'Notification not found');
      }

      throw new HttpsError('not-found', 'User not found');
    });

    console.log('[MARK READ] Transaction complete');
    return { success: true };
  },
);
