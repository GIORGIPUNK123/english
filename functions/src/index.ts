import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const cleanUpOldClasses = onSchedule('every 5 minutes', async () => {
  const now = Math.floor(Date.now() / 1000); // current Unix timestamp in seconds
  console.log(
    `[CLEANUP] cleanUpOldClasses triggered at ${new Date().toISOString()}`,
  );

  try {
    // Fetch classes older than 1 hour with status 'scheduled'
    const classesSnapshot = await db
      .collection('classes')
      .where('date', '<', now - 3600)
      .where('status', '==', 'scheduled')
      .get();

    console.log(
      `[CLEANUP] Found ${classesSnapshot.size} classes for possible cleanup.`,
    );

    const batch = db.batch();

    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const teacherId = classData.teacher_id;
      const studentId = classData.student_id;
      const topicId = classData.topic_id;

      // Only delete if teacher_id is missing/invalid
      if (!teacherId && studentId) {
        console.log(
          `[CLEANUP] Removing class ${classDoc.id} due to invalid teacher.`,
        );

        // Fetch the topic heading
        let topicHeading = 'Unknown topic';
        if (topicId) {
          const topicDoc = await db.collection('topics').doc(topicId).get();
          if (topicDoc.exists) {
            const topicData = topicDoc.data();
            topicHeading = topicData?.heading ?? 'Unknown topic';
          }
        }

        // Delete the class document
        batch.delete(classDoc.ref);

        const studentRef = db.collection('userData').doc(studentId);
        const studentDoc = await studentRef.get();

        if (studentDoc.exists) {
          const studentData = studentDoc.data()!;

          // Refund token, remove class from user's classes array, add notification
          batch.update(studentRef, {
            token: (studentData.token ?? 0) + 1,
            used_token: Math.max((studentData.used_token ?? 0) - 1, 0),
            classes: admin.firestore.FieldValue.arrayRemove(classDoc.id),
            notifications: admin.firestore.FieldValue.arrayUnion({
              id: db.collection('_').doc().id, // unique notification ID
              heading: 'Class cancelled',
              message: `Your class on "${topicHeading}" was cancelled because the teacher was unavailable. Your token has been refunded.`,
              message_type: 'regular',
              read: false,
              created_at: now,
            }),
          });

          console.log(
            `[CLEANUP] Updated student ${studentId} with notification about "${topicHeading}"`,
          );
        }
      }
    }

    await batch.commit();
    console.log(
      `[CLEANUP] Cleanup completed for ${classesSnapshot.size} classes.`,
    );
  } catch (error) {
    console.error('[CLEANUP] Cleanup error:', error);
  }
});
