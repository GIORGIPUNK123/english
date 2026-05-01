import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from './firebaseAdmin';
import { addNotificationToUser } from './notificationFunctions';
import {
  createZoomMeeting,
  updateZoomMeeting,
  deleteZoomMeeting,
} from './zoomFunctions';
import { FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

const GROUP_MAX_PARTICIPANTS = 5;
const GROUP_MIN_VALID_PARTICIPANTS = 2;

type LessonType = '1on1' | 'group';
type TokenSource = 'group' | '1on1' | 'legacy';
type CancelledByT = 'student' | 'teacher' | 'system';
type ClassStatusT =
  | 'finished'
  | 'scheduled'
  | 'in-progress'
  | 'missed_student'
  | 'missed_teacher'
  | 'cancelled_student'
  | 'cancelled_teacher'
  | 'cancelled_system';

type UserDoc = {
  first_name?: string;
  last_name?: string;
  tokens?: number;
  used_tokens?: number;
  group_tokens?: number;
  used_group_tokens?: number;
  one_on_one_tokens?: number;
  used_one_on_one_tokens?: number;
  pfp_file_path?: string;
  rating?: number;
  roles?: {
    student?: boolean;
    teacher?: boolean;
  };
};

type FirestoreClassDoc = {
  date?: number;
  status?: ClassStatusT | string;
  topic_id?: string;
  level?: string;
  student_id?: string;
  student_first_name?: string;
  student_last_name?: string;
  teacher_id?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  teacher_img?: string;
  teacher_rating?: number;
  teacher_link?: string;
  student_link?: string;
  zoom_meeting_id?: number | null;
  lesson_type?: LessonType;
  max_students?: number;
  participant_ids?: string[];
  participant_token_sources?: Record<string, TokenSource | string>;
  participant_count?: number;
  created_by?: string;
  valid_min_students?: number;
  cancelled_by?: CancelledByT;
  cancelled_reason?: string;
};

const isCancelledStatus = (status?: string): boolean => {
  return (
    status === 'cancelled_student' ||
    status === 'cancelled_teacher' ||
    status === 'cancelled_system'
  );
};

const getLessonType = (lesson: FirestoreClassDoc): LessonType => {
  if (
    lesson.lesson_type === 'group' ||
    (typeof lesson.max_students === 'number' && lesson.max_students > 1)
  ) {
    return 'group';
  }

  return '1on1';
};

const getParticipantIds = (lesson: FirestoreClassDoc): string[] => {
  const participantIds = Array.isArray(lesson.participant_ids)
    ? lesson.participant_ids.filter(
        (participantId): participantId is string =>
          typeof participantId === 'string' && participantId.length > 0,
      )
    : [];

  if (participantIds.length > 0) {
    return [...new Set(participantIds)];
  }

  if (lesson.student_id) {
    return [lesson.student_id];
  }

  return [];
};

const getMaxParticipants = (lesson: FirestoreClassDoc): number => {
  if (typeof lesson.max_students === 'number' && lesson.max_students > 0) {
    return lesson.max_students;
  }

  return getLessonType(lesson) === 'group' ? GROUP_MAX_PARTICIPANTS : 1;
};

const getCreatorId = (lesson: FirestoreClassDoc): string => {
  const participantIds = getParticipantIds(lesson);
  return lesson.created_by || lesson.student_id || participantIds[0] || '';
};

const getTokenValue = (value: unknown): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};

const getTokenSourceForCharge = (
  user: UserDoc,
  lessonType: LessonType,
): TokenSource | null => {
  const legacyTokens = getTokenValue(user.tokens);

  if (lessonType === 'group') {
    if (getTokenValue(user.group_tokens) > 0) {
      return 'group';
    }

    return legacyTokens > 0 ? 'legacy' : null;
  }

  if (getTokenValue(user.one_on_one_tokens) > 0) {
    return '1on1';
  }

  return legacyTokens > 0 ? 'legacy' : null;
};

const getTokenChargeUpdate = (tokenSource: TokenSource): Record<string, unknown> => {
  if (tokenSource === 'group') {
    return {
      group_tokens: FieldValue.increment(-1),
      used_group_tokens: FieldValue.increment(1),
    };
  }

  if (tokenSource === '1on1') {
    return {
      one_on_one_tokens: FieldValue.increment(-1),
      used_one_on_one_tokens: FieldValue.increment(1),
    };
  }

  return {
    tokens: FieldValue.increment(-1),
    used_tokens: FieldValue.increment(1),
  };
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

const getParticipantTokenSources = (
  lesson: FirestoreClassDoc,
): Record<string, TokenSource> => {
  const rawSources = lesson.participant_token_sources;

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

const getParticipantTokenSourceForUser = (
  lesson: FirestoreClassDoc,
  userId: string,
): TokenSource => {
  const participantTokenSources = getParticipantTokenSources(lesson);
  return participantTokenSources[userId] || 'legacy';
};

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
  level: string;
  lessonType?: LessonType;
};

export const scheduleLesson = onCall<ScheduleLessonData>(
  async ({ auth, data }) => {
    if (!auth) throw new HttpsError('unauthenticated', 'Login required');

    const { date, topicId, level, lessonType } = data;
    const userId = auth.uid;

    if (!date || !topicId || !level) {
      throw new HttpsError('invalid-argument', 'Missing fields');
    }

    if (lessonType && lessonType !== '1on1' && lessonType !== 'group') {
      throw new HttpsError('invalid-argument', 'Invalid lesson type');
    }

    const normalizedLessonType: LessonType = lessonType || '1on1';
    const maxParticipants =
      normalizedLessonType === 'group' ? GROUP_MAX_PARTICIPANTS : 1;

    const userRef = db.collection('users').doc(userId);
    const classRef = db.collection('classes').doc();

    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new HttpsError('not-found', 'User not found');

      const user = (userSnap.data() || {}) as UserDoc;
      const tokenSource = getTokenSourceForCharge(user, normalizedLessonType);

      if (!tokenSource) {
        throw new HttpsError(
          'failed-precondition',
          normalizedLessonType === 'group'
            ? 'No group class tokens available'
            : 'No 1-on-1 tokens available',
        );
      }

      tx.set(classRef, {
        date,
        status: 'scheduled',
        topic_id: topicId,
        level,
        lesson_type: normalizedLessonType,
        max_students: maxParticipants,
        participant_ids: [userId],
        participant_token_sources: {
          [userId]: tokenSource,
        },
        participant_count: 1,
        valid_min_students:
          normalizedLessonType === 'group' ? GROUP_MIN_VALID_PARTICIPANTS : 1,
        created_by: userId,
        student_id: userId,
        student_first_name: user.first_name || '',
        student_last_name: user.last_name || '',
        teacher_id: '',
        teacher_link: '',
        student_link: '',
        zoom_meeting_id: null,
      });

      tx.update(userRef, {
        ...getTokenChargeUpdate(tokenSource),
        classes: FieldValue.arrayUnion(classRef.id),
      });
    });

    return {
      classId: classRef.id,
      lessonType: normalizedLessonType,
      participantCount: 1,
      maxParticipants,
    };
  },
);

/* =====================================================
   JOIN GROUP LESSON
   ===================================================== */
type JoinGroupLessonData = {
  classId: string;
};

export const joinGroupLesson = onCall<JoinGroupLessonData>(
  async ({ auth, data }) => {
    if (!auth) throw new HttpsError('unauthenticated', 'Login required');

    const { classId } = data;
    if (!classId) throw new HttpsError('invalid-argument', 'Missing classId');

    const userId = auth.uid;
    const now = Math.floor(Date.now() / 1000);
    const classRef = db.collection('classes').doc(classId);
    const userRef = db.collection('users').doc(userId);

    let alreadyJoined = false;
    let participantCount = 0;
    let maxParticipants = GROUP_MAX_PARTICIPANTS;
    let teacherId = '';

    await db.runTransaction(async (tx) => {
      const [classSnap, userSnap] = await Promise.all([
        tx.get(classRef),
        tx.get(userRef),
      ]);

      if (!classSnap.exists) {
        throw new HttpsError('not-found', 'Class not found');
      }

      if (!userSnap.exists) {
        throw new HttpsError('not-found', 'User not found');
      }

      const lesson = (classSnap.data() || {}) as FirestoreClassDoc;
      const user = (userSnap.data() || {}) as UserDoc;
      const lessonType = getLessonType(lesson);
      const status = lesson.status || 'scheduled';

      if (lessonType !== 'group') {
        throw new HttpsError(
          'failed-precondition',
          'Only group lessons can be joined',
        );
      }

      if (status !== 'scheduled' || isCancelledStatus(status)) {
        throw new HttpsError(
          'failed-precondition',
          'Only active scheduled group lessons can be joined',
        );
      }

      if (!lesson.date || lesson.date <= now) {
        throw new HttpsError(
          'failed-precondition',
          'Cannot join a lesson that has already started',
        );
      }

      if (lesson.teacher_id === userId) {
        throw new HttpsError(
          'failed-precondition',
          'Teacher cannot join as a student',
        );
      }

      const participantIds = getParticipantIds(lesson);
      const participantTokenSources = getParticipantTokenSources(lesson);
      maxParticipants = getMaxParticipants(lesson);
      teacherId = lesson.teacher_id || '';

      if (participantIds.includes(userId)) {
        alreadyJoined = true;
        participantCount = participantIds.length;
        return;
      }

      if (participantIds.length >= maxParticipants) {
        throw new HttpsError('failed-precondition', 'Group class is full');
      }

      const tokenSource = getTokenSourceForCharge(user, 'group');
      if (!tokenSource) {
        throw new HttpsError(
          'failed-precondition',
          'No group class tokens available',
        );
      }

      const nextParticipantIds = [...participantIds, userId];
      const nextParticipantTokenSources = {
        ...participantTokenSources,
        [userId]: tokenSource,
      };
      participantCount = nextParticipantIds.length;

      const classUpdates: Record<string, unknown> = {
        participant_ids: nextParticipantIds,
        participant_token_sources: nextParticipantTokenSources,
        participant_count: nextParticipantIds.length,
      };

      if (!lesson.student_id) {
        classUpdates.student_id = userId;
        classUpdates.student_first_name = user.first_name || '';
        classUpdates.student_last_name = user.last_name || '';
      }

      tx.update(classRef, classUpdates);
      tx.update(userRef, {
        ...getTokenChargeUpdate(tokenSource),
        classes: FieldValue.arrayUnion(classId),
      });
    });

    if (!alreadyJoined && teacherId) {
      try {
        await addNotificationToUser(
          teacherId,
          'New Student Joined Group Class',
          `A student joined your upcoming group class (${participantCount}/${maxParticipants}).`,
          'group',
        );
      } catch (error) {
        console.error(
          `[joinGroupLesson] Failed to notify teacher ${teacherId} about class ${classId}`,
          error,
        );
      }
    }

    return {
      success: true,
      classId,
      alreadyJoined,
      participantCount,
      maxParticipants,
    };
  },
);

/* =====================================================
   RESCHEDULE LESSON
   ===================================================== */
type RescheduleLessonData = {
  lessonId: string;
  date: number;
  topicId: string;
  level: string;
};

export const rescheduleLesson = onCall<RescheduleLessonData>(
  async ({ auth, data }) => {
    if (!auth) throw new HttpsError('unauthenticated', 'Login required');

    const { lessonId, date, topicId, level } = data;
    const userId = auth.uid;
    const now = Math.floor(Date.now() / 1000);
    const minTimeFromNow = 24 * 3600; // 24 hours in seconds

    if (!lessonId || !date || !topicId || !level) {
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

      const lesson = (classSnap.data() || {}) as FirestoreClassDoc;
      const creatorId = getCreatorId(lesson);

      // Only the class creator can reschedule (works for both 1-on-1 and group).
      if (creatorId !== userId) {
        throw new HttpsError('permission-denied', 'Not allowed to reschedule');
      }

      // Check if lesson is already cancelled
      if (isCancelledStatus(lesson.status)) {
        throw new HttpsError(
          'failed-precondition',
          'Cannot reschedule a cancelled lesson',
        );
      }

      tx.update(classRef, {
        date,
        topic_id: topicId,
        level,
      });
    });

    // Update Zoom meeting if it exists
    try {
      const classSnap = await classRef.get();
      const classData = (classSnap.data() || {}) as FirestoreClassDoc;
      const zoomMeetingId = classData.zoom_meeting_id;

      if (zoomMeetingId) {
        const topicSnap = await db.collection('topics').doc(topicId).get();
        const topicName = topicSnap.exists
          ? topicSnap.data()?.heading
          : 'English Lesson';

        const updated = await updateZoomMeeting({
          meetingId: zoomMeetingId,
          startTime: date,
          topic: topicName || 'English Lesson',
        });

        if (updated) {
          console.log(
            `[rescheduleLesson] Zoom meeting ${zoomMeetingId} rescheduled for class ${lessonId}`,
          );
        } else {
          console.error(
            `[rescheduleLesson] Failed to update Zoom meeting ${zoomMeetingId} for class ${lessonId}`,
          );
        }
      }
    } catch (error) {
      console.error('[rescheduleLesson] Error updating Zoom meeting:', error);
    }

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

  let shouldDeleteZoomMeeting = false;
  let zoomMeetingIdToDelete: number | null = null;
  let classCancelled = false;
  let remainingParticipants = 0;

  await db.runTransaction(async (tx) => {
    const classSnap = await tx.get(classRef);
    if (!classSnap.exists) throw new HttpsError('not-found', 'Class not found');

    const lesson = (classSnap.data() || {}) as FirestoreClassDoc;
    const lessonType = getLessonType(lesson);
    const participantIds = getParticipantIds(lesson);
    const participantTokenSources = getParticipantTokenSources(lesson);

    const isStudent = participantIds.includes(userId);
    const isTeacher = lesson.teacher_id === userId;
    const zoomMeetingId =
      typeof lesson.zoom_meeting_id === 'number'
        ? lesson.zoom_meeting_id
        : null;

    if (!isStudent && !isTeacher) {
      throw new HttpsError('permission-denied', 'Not allowed');
    }

    // Check if already cancelled
    if (isCancelledStatus(lesson.status)) {
      throw new HttpsError(
        'failed-precondition',
        'This lesson is already cancelled',
      );
    }

    const lessonDate = lesson.date || 0;
    const timeUntilLesson = lessonDate - now;

    // Determine if token should be refunded (>=24h before lesson start)
    const shouldRefundToken = timeUntilLesson >= minTimeForRefund;

    if (lessonType === 'group' && isStudent && !isTeacher) {
      const remainingParticipantIds = participantIds.filter(
        (participantId) => participantId !== userId,
      );
      const remainingParticipantTokenSources = remainingParticipantIds.reduce(
        (acc, participantId) => {
          const tokenSource = participantTokenSources[participantId];
          if (tokenSource) {
            acc[participantId] = tokenSource;
          }
          return acc;
        },
        {} as Record<string, TokenSource>,
      );

      remainingParticipants = remainingParticipantIds.length;
      classCancelled = remainingParticipantIds.length === 0;

      const classUpdates: Record<string, unknown> = {
        participant_ids: remainingParticipantIds,
        participant_count: remainingParticipantIds.length,
        participant_token_sources:
          Object.keys(remainingParticipantTokenSources).length > 0
            ? remainingParticipantTokenSources
            : FieldValue.delete(),
      };

      if (classCancelled) {
        classUpdates.status = 'cancelled_student';
        classUpdates.cancelled_by = 'student';
        classUpdates.cancelled_reason = 'no_participants_remaining';
        classUpdates.cancelled_at = FieldValue.serverTimestamp();
        classUpdates.student_id = '';
        classUpdates.student_first_name = '';
        classUpdates.student_last_name = '';

        if (zoomMeetingId) {
          shouldDeleteZoomMeeting = true;
          zoomMeetingIdToDelete = zoomMeetingId;
        }

        if (lesson.teacher_id) {
          const teacherRef = db.collection('users').doc(lesson.teacher_id);
          tx.update(teacherRef, {
            teaching_classes: FieldValue.arrayRemove(classId),
          });
        }
      } else if (!remainingParticipantIds.includes(lesson.student_id || '')) {
        const nextRepresentativeId = remainingParticipantIds[0];
        const nextParticipantRef = db
          .collection('users')
          .doc(nextRepresentativeId);
        const nextParticipantSnap = await tx.get(nextParticipantRef);
        const nextParticipant = (nextParticipantSnap.data() || {}) as UserDoc;

        classUpdates.student_id = nextRepresentativeId;
        classUpdates.student_first_name = nextParticipant.first_name || '';
        classUpdates.student_last_name = nextParticipant.last_name || '';
      }

      tx.update(classRef, classUpdates);

      const callerUpdates: Record<string, unknown> = {
        classes: FieldValue.arrayRemove(classId),
      };

      if (shouldRefundToken) {
        Object.assign(
          callerUpdates,
          getTokenRefundUpdate(
            getParticipantTokenSourceForUser(lesson, userId),
          ),
        );
      }

      tx.update(db.collection('users').doc(userId), callerUpdates);
      return;
    }

    classCancelled = true;
    remainingParticipants = 0;

    const status: ClassStatusT = isTeacher
      ? 'cancelled_teacher'
      : 'cancelled_student';

    tx.update(classRef, {
      status,
      cancelled_at: FieldValue.serverTimestamp(),
      cancelled_by: isTeacher ? 'teacher' : 'student',
      cancelled_reason: isTeacher
        ? 'cancelled_by_teacher'
        : 'cancelled_by_student',
    });

    for (const participantId of participantIds) {
      const participantRef = db.collection('users').doc(participantId);

      const participantUpdates: Record<string, unknown> = {
        classes: FieldValue.arrayRemove(classId),
      };

      if (shouldRefundToken) {
        Object.assign(
          participantUpdates,
          getTokenRefundUpdate(
            getParticipantTokenSourceForUser(lesson, participantId),
          ),
        );
      }

      tx.update(participantRef, participantUpdates);
    }

    if (lesson.teacher_id) {
      const teacherRef = db.collection('users').doc(lesson.teacher_id);
      tx.update(teacherRef, {
        teaching_classes: FieldValue.arrayRemove(classId),
      });
    }

    if (zoomMeetingId) {
      shouldDeleteZoomMeeting = true;
      zoomMeetingIdToDelete = zoomMeetingId;
    }
  });

  if (shouldDeleteZoomMeeting && zoomMeetingIdToDelete) {
    try {
      const deleted = await deleteZoomMeeting(zoomMeetingIdToDelete);
      if (deleted) {
        console.log(
          `[cancelLesson] Zoom meeting ${zoomMeetingIdToDelete} deleted for class ${classId}`,
        );
      } else {
        console.error(
          `[cancelLesson] Failed to delete Zoom meeting ${zoomMeetingIdToDelete} for class ${classId}`,
        );
      }
    } catch (error) {
      console.error('[cancelLesson] Error deleting Zoom meeting:', error);
    }
  }

  return {
    success: true,
    classCancelled,
    remainingParticipants,
  };
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
  let participantIdsForNotification: string[] = [];
  let participantCountForNotification = 0;
  let teacherNameForNotification = 'A teacher';
  let topicNameForNotification = 'this lesson';
  let lessonTypeForNotification: LessonType = '1on1';

  // Get user data to fetch image URL before transaction
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new HttpsError('not-found', 'User not found');

  const userData = (userSnap.data() || {}) as UserDoc;
  let teacherImageURL = '';
  if (userData.pfp_file_path) {
    teacherImageURL = await getDownloadURLFromPath(userData.pfp_file_path);
  }

  await db.runTransaction(async (tx) => {
    const classSnap = await tx.get(classRef);

    if (!classSnap.exists) throw new HttpsError('not-found', 'Class not found');

    const lesson = (classSnap.data() || {}) as FirestoreClassDoc;
    participantIdsForNotification = getParticipantIds(lesson);
    participantCountForNotification = participantIdsForNotification.length;

    teacherNameForNotification =
      userData.first_name && userData.last_name
        ? `${userData.first_name} ${userData.last_name}`
        : 'A teacher';

    if (participantCountForNotification <= 0) {
      throw new HttpsError(
        'failed-precondition',
        'Class has no active students',
      );
    }

    const hasTeacherRole = userData?.roles?.teacher === true;
    if (!hasTeacherRole) {
      throw new HttpsError(
        'permission-denied',
        'Only approved teachers can accept lessons',
      );
    }

    if (participantIdsForNotification.includes(userId)) {
      throw new HttpsError(
        'failed-precondition',
        'You cannot accept your own lesson request',
      );
    }

    if (isCancelledStatus(lesson.status)) {
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
      participant_count: participantCountForNotification,
    });

    tx.update(userRef, {
      teaching_classes: FieldValue.arrayUnion(classId),
    });
  });

  const postAcceptClassSnap = await classRef.get();
  const postAcceptClassData = (postAcceptClassSnap.data() ||
    {}) as FirestoreClassDoc;
  lessonTypeForNotification = getLessonType(postAcceptClassData);
  participantCountForNotification =
    typeof postAcceptClassData.participant_count === 'number'
      ? postAcceptClassData.participant_count
      : participantCountForNotification;

  // Create Zoom meeting AFTER transaction completes
  let zoomMeetingId: number | null = null;

  try {
    const classSnap = await classRef.get();
    const classData = (classSnap.data() || {}) as FirestoreClassDoc;
    const topicId = classData.topic_id;

    const topicSnap = topicId
      ? await db.collection('topics').doc(topicId).get()
      : null;

    const topicName = topicSnap?.exists
      ? topicSnap.data()?.heading
      : 'English Lesson';

    const zoomMeeting = await createZoomMeeting({
      topic: topicName || 'English Lesson',
      startTime: classData.date || Math.floor(Date.now() / 1000),
      duration: 60,
      agenda:
        lessonTypeForNotification === 'group'
          ? `Group lesson with ${participantCountForNotification} students`
          : `Lesson with ${classData.student_first_name || 'student'} ${classData.student_last_name || ''}`,
    });

    if (zoomMeeting) {
      zoomMeetingId = zoomMeeting.id;

      // Update class with Zoom URLs and meeting ID
      await classRef.update({
        zoom_meeting_id: zoomMeetingId,
        teacher_link: zoomMeeting.start_url,
        student_link: zoomMeeting.join_url,
      });

      console.log(
        `[acceptLesson] Zoom meeting created for class ${classId}. Meeting ID: ${zoomMeetingId}`,
      );
    } else {
      console.error(
        `[acceptLesson] Failed to create Zoom meeting for class ${classId}. Lesson will proceed without Zoom link.`,
      );
    }
  } catch (error) {
    console.error('[acceptLesson] Error creating Zoom meeting:', error);
  }

  let notificationsSent = true;
  try {
    const participantNotificationMessage =
      lessonTypeForNotification === 'group'
        ? `${teacherNameForNotification} accepted your group class (${participantCountForNotification} students joined).`
        : `${teacherNameForNotification} accepted your lesson request.`;

    await Promise.all([
      addNotificationToUser(
        userId,
        'Lesson Accepted',
        `You accepted lesson: ${topicNameForNotification}.`,
        'calendar',
      ),
      ...participantIdsForNotification.map((participantId) =>
        addNotificationToUser(
          participantId,
          'Teacher Accepted Your Lesson',
          participantNotificationMessage,
          'calendar',
        ),
      ),
    ]);
  } catch (error) {
    notificationsSent = false;
    console.error(
      '[acceptLesson] Accepted lesson but failed to send notifications',
      error,
    );
  }

  return {
    success: true,
    notificationsSent,
    zoomMeetingCreated: !!zoomMeetingId,
    participantCount: participantCountForNotification,
    lessonType: lessonTypeForNotification,
  };
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
