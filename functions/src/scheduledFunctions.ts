import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { addNotificationToUser } from './notificationFunctions';
import { deleteZoomMeeting } from './zoomFunctions';

type ClassDoc = {
  date?: number;
  status?: string;
  teacher_id?: string;
  student_id?: string;
  level?: string;
  lesson_type?: '1on1' | 'group';
  max_students?: number;
  participant_ids?: string[];
  participant_token_sources?: Record<string, TokenSource | string>;
  participant_count?: number;
  student_link?: string;
  teacher_link?: string;
  zoom_meeting_id?: number | null;
};

type TokenSource = 'group' | '1on1' | 'legacy';

const getLessonType = (cls: ClassDoc): '1on1' | 'group' => {
  if (
    cls.lesson_type === 'group' ||
    (typeof cls.max_students === 'number' && cls.max_students > 1)
  ) {
    return 'group';
  }

  return '1on1';
};

const getParticipantIds = (cls: ClassDoc): string[] => {
  const participantIds = Array.isArray(cls.participant_ids)
    ? cls.participant_ids.filter(
        (participantId): participantId is string =>
          typeof participantId === 'string' && participantId.length > 0,
      )
    : [];

  if (participantIds.length > 0) {
    return [...new Set(participantIds)];
  }

  if (cls.student_id) {
    return [cls.student_id];
  }

  return [];
};

const getParticipantTokenSources = (
  cls: ClassDoc,
): Record<string, TokenSource> => {
  const rawSources = cls.participant_token_sources;

  if (!rawSources || typeof rawSources !== 'object' || Array.isArray(rawSources)) {
    return {};
  }

  const sources: Record<string, TokenSource> = {};

  for (const [participantId, tokenSource] of Object.entries(rawSources)) {
    if (
      tokenSource === 'group' ||
      tokenSource === '1on1' ||
      tokenSource === 'legacy'
    ) {
      sources[participantId] = tokenSource;
    }
  }

  return sources;
};

const getParticipantTokenSource = (
  cls: ClassDoc,
  participantId: string,
): TokenSource => {
  const tokenSources = getParticipantTokenSources(cls);
  return tokenSources[participantId] || 'legacy';
};

const getTokenRefundUpdate = (tokenSource: TokenSource): Record<string, unknown> => {
  if (tokenSource === 'group') {
    return {
      group_tokens: FieldValue.increment(1),
      used_group_tokens: FieldValue.increment(-1),
    };
  }

  if (tokenSource === '1on1') {
    return {
      one_on_one_tokens: FieldValue.increment(1),
      used_one_on_one_tokens: FieldValue.increment(-1),
    };
  }

  return {
    tokens: FieldValue.increment(1),
    used_tokens: FieldValue.increment(-1),
  };
};

/* =====================================================
   SCHEDULED CLASS MAINTENANCE (every 2 min)
   1) Log upcoming class readiness
   2) Auto-cancel low-enrollment group classes at 1-hour mark
   3) Clean up old unaccepted classes and refund students
   ===================================================== */
export const cleanUpOldClasses = onSchedule('every 2 minutes', async () => {
  const now = Math.floor(Date.now() / 1000);
  const tenMinutesFromNow = now + 10 * 60;
  const oneHourMarkUpperBound = now + 60 * 60;
  const oneHourMarkLowerBound = oneHourMarkUpperBound - 120;

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
    const participantCount = getParticipantIds(cls).length;
    const maxParticipants =
      typeof cls.max_students === 'number'
        ? cls.max_students
        : getLessonType(cls) === 'group'
          ? 5
          : 1;

    console.log(
      `[scheduledFunctions] Upcoming lesson ${classId} at ${cls.date}. Teacher link: ${cls.teacher_link ? 'EXISTS' : 'MISSING'}. Student link: ${cls.student_link ? 'EXISTS' : 'MISSING'}. Participants: ${participantCount}/${maxParticipants}`,
    );
  }

  const lowEnrollmentWindowSnapshot = await db
    .collection('classes')
    .where('status', '==', 'scheduled')
    .where('date', '>=', oneHourMarkLowerBound)
    .where('date', '<=', oneHourMarkUpperBound)
    .get();

  const lowEnrollmentBatch = db.batch();
  const lowEnrollmentCancellations: Array<{
    classId: string;
    participantIds: string[];
    teacherId: string;
    zoomMeetingId: number | null;
  }> = [];

  for (const docSnap of lowEnrollmentWindowSnapshot.docs) {
    const cls = docSnap.data() as ClassDoc;
    const classId = docSnap.id;
    const lessonType = getLessonType(cls);
    const participantIds = getParticipantIds(cls);

    if (lessonType !== 'group' || participantIds.length !== 1) {
      continue;
    }

    const zoomMeetingId =
      typeof cls.zoom_meeting_id === 'number' ? cls.zoom_meeting_id : null;
    const teacherId = cls.teacher_id || '';

    lowEnrollmentBatch.update(docSnap.ref, {
      status: 'cancelled_system',
      cancelled_at: FieldValue.serverTimestamp(),
      cancelled_by: 'system',
      cancelled_reason: 'low_enrollment',
    });

    if (teacherId) {
      lowEnrollmentBatch.update(db.collection('users').doc(teacherId), {
        teaching_classes: FieldValue.arrayRemove(classId),
      });
    }

    for (const participantId of participantIds) {
      lowEnrollmentBatch.update(db.collection('users').doc(participantId), {
        classes: FieldValue.arrayRemove(classId),
        ...getTokenRefundUpdate(getParticipantTokenSource(cls, participantId)),
      });
    }

    lowEnrollmentCancellations.push({
      classId,
      participantIds,
      teacherId,
      zoomMeetingId,
    });
  }

  if (lowEnrollmentCancellations.length > 0) {
    await lowEnrollmentBatch.commit();

    for (const cancellation of lowEnrollmentCancellations) {
      if (cancellation.zoomMeetingId) {
        try {
          await deleteZoomMeeting(cancellation.zoomMeetingId);
        } catch (error) {
          console.error(
            `[scheduledFunctions] Failed to delete Zoom meeting ${cancellation.zoomMeetingId} for low-enrollment class ${cancellation.classId}`,
            error,
          );
        }
      }

      await Promise.all([
        ...cancellation.participantIds.map((participantId) =>
          addNotificationToUser(
            participantId,
            'Group Class Cancelled',
            'Your group class was automatically cancelled because fewer than 2 students were joined 1 hour before start. Your lesson token has been refunded.',
            'warning',
          ),
        ),
        ...(cancellation.teacherId
          ? [
              addNotificationToUser(
                cancellation.teacherId,
                'Group Class Cancelled',
                'A scheduled group class was automatically cancelled due to low enrollment (only 1 student joined at the 1-hour mark).',
                'warning',
              ),
            ]
          : []),
      ]);
    }

    console.log(
      `[scheduledFunctions] Low-enrollment auto-cancellations processed: ${lowEnrollmentCancellations.length}`,
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
  const staleClassCancellations: Array<{
    classId: string;
    participantIds: string[];
  }> = [];

  for (const docSnap of snapshot.docs) {
    const cls = docSnap.data() as ClassDoc;
    const participantIds = getParticipantIds(cls);
    const classId = docSnap.id;

    if (!cls.teacher_id && participantIds.length > 0) {
      const classRef = docSnap.ref;

      batch.update(classRef, {
        status: 'cancelled_system',
        cancelled_at: FieldValue.serverTimestamp(),
        cancelled_by: 'system',
        cancelled_reason: 'teacher_unavailable',
      });

      for (const participantId of participantIds) {
        batch.update(db.collection('users').doc(participantId), {
          classes: FieldValue.arrayRemove(classId),
          ...getTokenRefundUpdate(getParticipantTokenSource(cls, participantId)),
        });
      }

      staleClassCancellations.push({
        classId,
        participantIds,
      });
    }
  }

  await batch.commit();

  for (const cancellation of staleClassCancellations) {
    await Promise.all(
      cancellation.participantIds.map((participantId) =>
        addNotificationToUser(
          participantId,
          'Class Cancelled',
          'Your class was cancelled because the teacher was unavailable. Your lesson token has been refunded.',
          'warning',
        ),
      ),
    );
  }

  const lowEnrollmentRefunds = lowEnrollmentCancellations.reduce(
    (acc, row) => acc + row.participantIds.length,
    0,
  );
  const staleClassRefunds = staleClassCancellations.reduce(
    (acc, row) => acc + row.participantIds.length,
    0,
  );

  console.log(
    `[scheduledFunctions] Cycle summary: upcoming_checked=${upcomingSnapshot.size}, one_hour_window_checked=${lowEnrollmentWindowSnapshot.size}, stale_checked=${snapshot.size}, low_enrollment_cancelled=${lowEnrollmentCancellations.length}, stale_cancelled=${staleClassCancellations.length}, refunds=${lowEnrollmentRefunds + staleClassRefunds}`,
  );
});
