import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

type ClassDoc = {
  date?: number;
  status?: string;
  teacher_id?: string;
  student_id?: string;
  link?: string;
  student_link?: string;
  teacher_link?: string;
};

/* =====================================================
   SCHEDULED CLASS MAINTENANCE (every 2 min)
   1) TEST: write student_link for upcoming classes
   2) Clean up old unaccepted classes and refund students
   ===================================================== */
export const cleanUpOldClasses = onSchedule('every 2 minutes', async () => {
  const now = Math.floor(Date.now() / 1000);
  const tenMinutesFromNow = now + 10 * 60;

  console.log(
    `[scheduledFunctions] cleanUpOldClasses invoked at ${now} (window: ${now} - ${tenMinutesFromNow})`,
  );

  const upcomingSnapshot = await db
    .collection('classes')
    .where('status', '==', 'scheduled')
    .where('date', '>=', now)
    .where('date', '<=', tenMinutesFromNow)
    .get();

  console.log(
    `[scheduledFunctions] Upcoming scheduled classes in 10-minute window: ${upcomingSnapshot.size}`,
  );

  // Note: Zoom meetings and links are created when teacher accepts the lesson (acceptLesson function).
  // Links are automatically populated via createZoomMeeting and stored in teacher_link and student_link fields.
  // This scheduled function just logs the status of upcoming lessons.

  for (const docSnap of upcomingSnapshot.docs) {
    const cls = docSnap.data() as ClassDoc;
    const classId = docSnap.id;

    console.log(
      `[scheduledFunctions] Upcoming lesson ${classId} at ${cls.date}. Teacher link: ${cls.teacher_link ? 'EXISTS' : 'MISSING'}. Student link: ${cls.student_link ? 'EXISTS' : 'MISSING'}`,
    );
  }

  const snapshot = await db
    .collection('classes')
    .where('date', '<', now - 3600)
    .where('status', '==', 'scheduled')
    .get();

  console.log(
    `[scheduledFunctions] Old scheduled classes eligible for cleanup query: ${snapshot.size}`,
  );

  const batch = db.batch();

  for (const docSnap of snapshot.docs) {
    const cls = docSnap.data() as ClassDoc;

    if (!cls.teacher_id && cls.student_id) {
      const classRef = docSnap.ref;
      const studentRef = db.collection('users').doc(cls.student_id);

      batch.update(classRef, {
        status: 'cancelled_system',
        cancelled_at: now,
        cancelled_by: 'system',
      });

      batch.update(studentRef, {
        tokens: FieldValue.increment(1),
        used_tokens: FieldValue.increment(-1),
      });
    }
  }

  await batch.commit();

  for (const docSnap of snapshot.docs) {
    const cls = docSnap.data() as ClassDoc;
    if (!cls.teacher_id && cls.student_id) {
      const notificationRef = db
        .collection('users')
        .doc(cls.student_id)
        .collection('notifications')
        .doc();

      await notificationRef.set({
        heading: 'Class Cancelled',
        message:
          'Your class was cancelled because the teacher was unavailable. Your token has been refunded.',
        message_type: 'warning',
        read: false,
        created_at: now,
      });
    }
  }
});
