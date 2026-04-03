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

  for (const docSnap of upcomingSnapshot.docs) {
    const cls = docSnap.data() as ClassDoc;
    const classId = docSnap.id;
    const testStudentLink = `TEST_STUDENT_LINK_${classId}_${now}`;

    await docSnap.ref.update({
      student_link: testStudentLink,
      link: testStudentLink,
      test_scheduler_invoked_at: now,
      test_scheduler_mode: true,
    });

    console.log(
      `[scheduledFunctions] TEST student_link written for class ${classId}: ${testStudentLink}`,
    );

    if (cls.teacher_link) {
      console.log(
        `[scheduledFunctions] Existing teacher_link preserved for class ${classId}`,
      );
    }
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
