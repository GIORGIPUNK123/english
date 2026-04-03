import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from './firebaseAdmin';
import { addNotificationToUser } from './notificationFunctions';
import { FieldValue } from 'firebase-admin/firestore';

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
        teacher_link: '',
        student_link: '',
      });

      tx.update(userRef, {
        tokens: FieldValue.increment(-1),
        used_tokens: FieldValue.increment(1),
        classes: FieldValue.arrayUnion(classRef.id),
      });
    });

    return { classId: classRef.id };
  },
);

/* =====================================================
   RESCHEDULE LESSON
   ===================================================== */
type RescheduleLessonData = {
  lessonId: string;
  date: number;
  topicId: string;
};

export const rescheduleLesson = onCall<RescheduleLessonData>(
  async ({ auth, data }) => {
    if (!auth) throw new HttpsError('unauthenticated', 'Login required');

    const { lessonId, date, topicId } = data;
    const userId = auth.uid;
    const now = Math.floor(Date.now() / 1000);
    const minTimeFromNow = 6 * 3600; // 6 hours in seconds
    const minTimeForAcceptedLesson = 12 * 3600; // 12 hours in seconds

    if (!lessonId || !date || !topicId) {
      throw new HttpsError('invalid-argument', 'Missing fields');
    }

    // Check if new time is at least 6 hours from now
    if (date < now + minTimeFromNow) {
      throw new HttpsError(
        'failed-precondition',
        'New lesson must be at least 6 hours from now',
      );
    }

    const userRef = db.collection('users').doc(userId);
    const classRef = db.collection('classes').doc(lessonId);

    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const classSnap = await tx.get(classRef);

      if (!userSnap.exists) throw new HttpsError('not-found', 'User not found');
      if (!classSnap.exists)
        throw new HttpsError('not-found', 'Class not found');

      const lesson = classSnap.data()!;

      // Check if user is the student
      if (lesson.student_id !== userId) {
        throw new HttpsError('permission-denied', 'Not allowed to reschedule');
      }

      // Check if lesson is already cancelled
      if (
        lesson.status === 'cancelled_student' ||
        lesson.status === 'cancelled_teacher'
      ) {
        throw new HttpsError(
          'failed-precondition',
          'Cannot reschedule a cancelled lesson',
        );
      }

      // If teacher has accepted the lesson, check 12-hour constraint
      if (lesson.teacher_id?.trim()) {
        if (date < now + minTimeForAcceptedLesson) {
          throw new HttpsError(
            'failed-precondition',
            'For accepted lessons, you must reschedule at least 12 hours in advance',
          );
        }
      }

      tx.update(classRef, {
        date,
        topic_id: topicId,
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
  const now = Math.floor(Date.now() / 1000);
  const minTimeForRefund = 12 * 3600; // 12 hours in seconds
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

    // Check if already cancelled
    if (
      lesson.status === 'cancelled_student' ||
      lesson.status === 'cancelled_teacher'
    ) {
      throw new HttpsError(
        'failed-precondition',
        'This lesson is already cancelled',
      );
    }

    const status = isStudent ? 'cancelled_student' : 'cancelled_teacher';
    const studentRef = lesson.student_id
      ? db.collection('users').doc(lesson.student_id)
      : null;

    // Determine if token should be refunded
    const teacherAccepted = lesson.teacher_id?.trim();
    const timeUntilLesson = lesson.date - now;
    const shouldRefundToken =
      !teacherAccepted || timeUntilLesson >= minTimeForRefund;

    // Update class
    tx.update(classRef, {
      status,
      cancelled_at: FieldValue.serverTimestamp(),
      cancelled_by: isStudent ? 'student' : 'teacher',
    });

    // Handle student refund (only for student cancellations, and only if applicable)
    if (isStudent && studentRef) {
      if (shouldRefundToken) {
        // Refund token
        tx.update(studentRef, {
          tokens: FieldValue.increment(1),
          used_tokens: FieldValue.increment(-1),
        });
      }
      // Always remove from classes array
      tx.update(studentRef, {
        classes: FieldValue.arrayRemove(classId),
      });
    }
  });

  return { success: true };
});

/* =====================================================
   Accept LESSON
   ===================================================== */

type AcceptLessonData = {
  classId: string;
};

export const acceptLesson = onCall<AcceptLessonData>(async ({ auth, data }) => {
  if (!auth) throw new HttpsError('unauthenticated', 'Login required');

  const { classId } = data;
  if (!classId) throw new HttpsError('invalid-argument', 'Missing classId');

  const userId = auth.uid;
  const userRef = db.collection('users').doc(userId);
  const classRef = db.collection('classes').doc(classId);
  let studentIdForNotification = '';
  let teacherNameForNotification = 'A teacher';
  let topicNameForNotification = 'this lesson';

  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const classSnap = await tx.get(classRef);

    if (!userSnap.exists) throw new HttpsError('not-found', 'User not found');
    if (!classSnap.exists) throw new HttpsError('not-found', 'Class not found');

    const userData = userSnap.data()!;
    const lesson = classSnap.data()!;

    studentIdForNotification = lesson.student_id;
    teacherNameForNotification =
      userData.first_name && userData.last_name
        ? `${userData.first_name} ${userData.last_name}`
        : 'A teacher';

    const hasTeacherRole = userData?.roles?.teacher === true;
    if (!hasTeacherRole) {
      throw new HttpsError(
        'permission-denied',
        'Only approved teachers can accept lessons',
      );
    }

    if (lesson.student_id === userId) {
      throw new HttpsError(
        'failed-precondition',
        'You cannot accept your own lesson request',
      );
    }

    if (
      lesson.status === 'cancelled_student' ||
      lesson.status === 'cancelled_teacher' ||
      lesson.status === 'cancelled_system'
    ) {
      throw new HttpsError(
        'failed-precondition',
        'Cancelled lessons cannot be accepted',
      );
    }

    if (lesson.status !== 'scheduled') {
      throw new HttpsError(
        'failed-precondition',
        'Only scheduled lessons can be accepted',
      );
    }

    if (lesson.topic_id) {
      const topicRef = db.collection('topics').doc(lesson.topic_id);
      const topicSnap = await tx.get(topicRef);
      if (topicSnap.exists) {
        const topicData = topicSnap.data();
        topicNameForNotification = topicData?.heading || 'this lesson';
      }
    }

    const assignedTeacherId = lesson.teacher_id || null;
    if (assignedTeacherId && assignedTeacherId !== userId) {
      throw new HttpsError(
        'failed-precondition',
        'This lesson has already been accepted by another teacher',
      );
    }

    tx.update(classRef, {
      teacher_id: userId,
    });

    tx.update(userRef, {
      teaching_classes: FieldValue.arrayUnion(classId),
    });
  });

  let notificationsSent = true;
  try {
    await Promise.all([
      addNotificationToUser(
        userId,
        'Lesson Accepted',
        `You accepted lesson: ${topicNameForNotification}.`,
        'calendar',
      ),
      addNotificationToUser(
        studentIdForNotification,
        'Teacher Accepted Your Lesson',
        `${teacherNameForNotification} accepted your lesson request.`,
        'calendar',
      ),
    ]);
  } catch (error) {
    notificationsSent = false;
    console.error(
      '[acceptLesson] Accepted lesson but failed to send notifications',
      error,
    );
  }

  return { success: true, notificationsSent };
});
