import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/* =====================================================
   CLEAN UP OLD CLASSES (teacher never joined)
   ===================================================== */
export const cleanUpOldClasses = onSchedule('every 5 minutes', async () => {
  const now = Math.floor(Date.now() / 1000);

  const snapshot = await db
    .collection('classes')
    .where('date', '<', now - 3600)
    .where('status', '==', 'scheduled')
    .get();

  const batch = db.batch();

  for (const docSnap of snapshot.docs) {
    const cls = docSnap.data();

    if (!cls.teacher_id && cls.student_id) {
      const classRef = docSnap.ref;
      const studentRef = db.collection('users').doc(cls.student_id);

      batch.update(classRef, {
        status: 'cancelled_teacher',
        cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
        cancelled_by: 'system',
      });

      batch.update(studentRef, {
        tokens: admin.firestore.FieldValue.increment(1),
        used_tokens: admin.firestore.FieldValue.increment(-1),
        classes: admin.firestore.FieldValue.arrayRemove(docSnap.id),
      });

      const notificationRef = db
        .collection('users')
        .doc(cls.student_id)
        .collection('notifications')
        .doc();

      batch.set(notificationRef, {
        created_at: now,
        heading: 'Class Cancelled',
        message:
          'Your class was cancelled because the teacher was unavailable. Your token has been refunded.',
        message_type: 'warning',
        read: false,
      });
    }
  }

  await batch.commit();
});

/* =====================================================
   SCHEDULE LESSON
   ===================================================== */
type ScheduleLessonData = {
  date: number;
  topicId: string;
};

export const scheduleLesson = onCall<ScheduleLessonData>(
  async ({ auth, data }) => {
    if (!auth) throw new HttpsError('unauthenticated', 'Login required');

    const { date, topicId } = data;
    const userId = auth.uid;

    if (!date || !topicId) {
      throw new HttpsError('invalid-argument', 'Missing fields');
    }

    const userRef = db.collection('users').doc(userId);
    const classRef = db.collection('classes').doc();

    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new HttpsError('not-found', 'User not found');

      const user = userSnap.data()!;
      if (user.tokens <= 0) {
        throw new HttpsError('failed-precondition', 'No tokens available');
      }

      tx.set(classRef, {
        date,
        status: 'scheduled',
        topic_id: topicId,
        student_id: userId,
        teacher_id: '',
        link: '',
      });

      tx.update(userRef, {
        tokens: admin.firestore.FieldValue.increment(-1),
        used_tokens: admin.firestore.FieldValue.increment(1),
        classes: admin.firestore.FieldValue.arrayUnion(classRef.id),
      });
    });

    return { classId: classRef.id };
  },
);

/* =====================================================
   CANCEL LESSON
   ===================================================== */
type CancelLessonData = {
  classId: string;
};

export const cancelLesson = onCall<CancelLessonData>(async ({ auth, data }) => {
  if (!auth) throw new HttpsError('unauthenticated', 'Login required');

  const { classId } = data;
  if (!classId) throw new HttpsError('invalid-argument', 'Missing classId');

  const userId = auth.uid;
  const classRef = db.collection('classes').doc(classId);

  await db.runTransaction(async (tx) => {
    const classSnap = await tx.get(classRef);
    if (!classSnap.exists) throw new HttpsError('not-found', 'Class not found');

    const lesson = classSnap.data()!;
    const isStudent = lesson.student_id === userId;
    const isTeacher = lesson.teacher_id === userId;

    if (!isStudent && !isTeacher) {
      throw new HttpsError('permission-denied', 'Not allowed');
    }

    const status = isStudent ? 'cancelled_student' : 'cancelled_teacher';

    const studentRef = lesson.student_id
      ? db.collection('users').doc(lesson.student_id)
      : null;

    const teacherRef = lesson.teacher_id?.trim()
      ? db.collection('teachers').doc(lesson.teacher_id)
      : null;

    // Update class
    tx.update(classRef, {
      status,
      cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
      cancelled_by: isStudent ? 'student' : 'teacher',
    });

    // Refund student
    if (studentRef) {
      tx.update(studentRef, {
        tokens: admin.firestore.FieldValue.increment(1),
        used_tokens: admin.firestore.FieldValue.increment(-1),
        classes: admin.firestore.FieldValue.arrayRemove(classId),
      });
    }

    // Update teacher scheduled classes
    if (teacherRef) {
      tx.update(teacherRef, {
        scheduled_classes: admin.firestore.FieldValue.arrayRemove(classId),
      });
    }
  });

  return { success: true };
});

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
      // Check users (student)
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

        console.warn(
          '[MARK READ] Notification not found in users, checking teachers',
        );
      }

      // Check teachers
      const teacherRef = db.collection('teachers').doc(userId);
      const teacherSnap = await tx.get(teacherRef);

      if (teacherSnap.exists) {
        console.log('[MARK READ] Found user in teachers collection');
        const notificationRef = teacherRef
          .collection('notifications')
          .doc(notificationId);
        const notificationSnap = await tx.get(notificationRef);

        if (notificationSnap.exists) {
          tx.update(notificationRef, { read: true });
          console.log('[MARK READ] Notification marked as read for teacher');
          return;
        }

        console.warn('[MARK READ] Notification not found in teachers');
      }

      console.warn('[MARK READ] User not found in either collection');
      throw new HttpsError('not-found', 'User not found');
    });

    console.log('[MARK READ] Transaction complete');
    return { success: true };
  },
);
