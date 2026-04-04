import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from './firebaseAdmin';
import { addNotificationToUser } from './notificationFunctions';
import { FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

/* =====================================================
   HELPER: Convert Storage path to download URL
   ===================================================== */
async function getDownloadURLFromPath(storagePath: string): Promise<string> {
  if (!storagePath) return '';
  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);
    const [downloadURL] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
    });
    return downloadURL;
  } catch (error) {
    console.error('Failed to get download URL:', error);
    return '';
  }
}

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
        student_first_name: user.first_name || '',
        student_last_name: user.last_name || '',
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
    const minTimeFromNow = 24 * 3600; // 24 hours in seconds

    if (!lessonId || !date || !topicId) {
      throw new HttpsError('invalid-argument', 'Missing fields');
    }

    // Check if new time is at least 24 hours from now
    if (date < now + minTimeFromNow) {
      throw new HttpsError(
        'failed-precondition',
        'New lesson must be at least 24 hours from now',
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
  const minTimeForRefund = 24 * 3600; // 24 hours in seconds
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

    const timeUntilLesson = lesson.date - now;

    const status = isStudent ? 'cancelled_student' : 'cancelled_teacher';
    const studentRef = lesson.student_id
      ? db.collection('users').doc(lesson.student_id)
      : null;

    // Determine if token should be refunded (>=24h before lesson start)
    const shouldRefundToken = timeUntilLesson >= minTimeForRefund;

    // Update class
    tx.update(classRef, {
      status,
      cancelled_at: FieldValue.serverTimestamp(),
      cancelled_by: isStudent ? 'student' : 'teacher',
    });

    // Handle student token/account updates when a lesson is cancelled by either side.
    if (studentRef) {
      if (shouldRefundToken) {
        // Refund token only when cancellation is at least 24 hours early.
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

  // Get user data to fetch image URL before transaction
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new HttpsError('not-found', 'User not found');

  const userData = userSnap.data()!;
  let teacherImageURL = '';
  if (userData.pfp_file_path) {
    teacherImageURL = await getDownloadURLFromPath(userData.pfp_file_path);
  }

  await db.runTransaction(async (tx) => {
    const classSnap = await tx.get(classRef);

    if (!classSnap.exists) throw new HttpsError('not-found', 'Class not found');

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
    if (assignedTeacherId === userId) {
      throw new HttpsError(
        'failed-precondition',
        'You already accepted this lesson',
      );
    }

    if (assignedTeacherId && assignedTeacherId !== userId) {
      throw new HttpsError(
        'failed-precondition',
        'This lesson has already been accepted by another teacher',
      );
    }

    tx.update(classRef, {
      teacher_id: userId,
      teacher_first_name: userData.first_name || 'Teacher',
      teacher_last_name: userData.last_name || '',
      teacher_img: teacherImageURL || '',
      teacher_rating: typeof userData.rating === 'number' ? userData.rating : 0,
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

/* =====================================================
   Get USERS PUBLIC NAMES (for legacy class records)
   ===================================================== */

type GetUsersPublicNamesData = {
  userIds: string[];
};

export const getUsersPublicNames = onCall<GetUsersPublicNamesData>(
  async ({ auth, data }) => {
    if (!auth) throw new HttpsError('unauthenticated', 'Login required');

    const userIds = Array.isArray(data?.userIds) ? data.userIds : [];
    if (!userIds.length) {
      return {
        users: {} as Record<string, { first_name: string; last_name: string }>,
      };
    }

    const callerRef = db.collection('users').doc(auth.uid);
    const callerSnap = await callerRef.get();
    if (!callerSnap.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const caller = callerSnap.data()!;
    if (caller?.roles?.teacher !== true) {
      throw new HttpsError(
        'permission-denied',
        'Only teachers can request student names',
      );
    }

    const uniqueIds = [...new Set(userIds)].filter(Boolean).slice(0, 100);

    const users: Record<string, { first_name: string; last_name: string }> = {};

    await Promise.all(
      uniqueIds.map(async (uid) => {
        const snap = await db.collection('users').doc(uid).get();
        if (!snap.exists) return;

        const row = snap.data() as { first_name?: string; last_name?: string };
        users[uid] = {
          first_name: row.first_name || 'Student',
          last_name: row.last_name || '',
        };
      }),
    );

    return { users };
  },
);
