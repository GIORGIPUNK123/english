import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { db } from './firebaseAdmin';
import { addNotificationToUser } from './notificationFunctions';

type FeedbackEntryInput = {
  studentId: string;
  studentAttended: boolean;
  rating?: number;
  comment?: string;
  materialsLink?: string;
};

type ClassDoc = {
  teacher_id?: string;
  status?: string;
  date?: number;
  participant_ids?: string[];
  student_id?: string;
  lesson_type?: '1on1' | 'group';
  max_students?: number;
};

/** Lesson closed by teacher feedback — per-student absence is NOT reflected here. */
const CLOSED_CLASS_STATUSES = new Set(['finished', 'missed_teacher', 'missed_student']);

const LESSON_DURATION_SECONDS = 3600;

const getParticipantIds = (classData: ClassDoc): string[] => {
  if (Array.isArray(classData.participant_ids) && classData.participant_ids.length) {
    return classData.participant_ids;
  }
  if (classData.student_id) {
    return [classData.student_id];
  }
  return [];
};

const assertLessonReadyForTeacherReport = (
  classData: ClassDoc,
  now: number,
) => {
  if (CLOSED_CLASS_STATUSES.has(classData.status || '')) {
    throw new HttpsError('failed-precondition', 'This lesson was already closed');
  }

  if (classData.status?.startsWith('cancelled')) {
    throw new HttpsError(
      'failed-precondition',
      'Cannot submit feedback for a cancelled lesson',
    );
  }

  const lessonEnd = (classData.date || 0) + LESSON_DURATION_SECONDS;
  if (now < lessonEnd && classData.status !== 'in-progress') {
    throw new HttpsError(
      'failed-precondition',
      'Attendance and feedback can be submitted after the lesson ends',
    );
  }
};

export const submitLessonFeedback = onCall<{
  classId: string;
  teacherAttended: boolean;
  entries?: FeedbackEntryInput[];
}>(async ({ auth, data }) => {
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Login required');
  }

  const { classId, teacherAttended, entries = [] } = data;
  if (!classId || typeof teacherAttended !== 'boolean') {
    throw new HttpsError(
      'invalid-argument',
      'classId and teacherAttended are required',
    );
  }

  const classRef = db.collection('classes').doc(classId);
  const classSnap = await classRef.get();
  if (!classSnap.exists) {
    throw new HttpsError('not-found', 'Lesson not found');
  }

  const classData = classSnap.data() as ClassDoc;
  if (classData.teacher_id !== auth.uid) {
    throw new HttpsError(
      'permission-denied',
      'Only the assigned teacher can submit feedback',
    );
  }

  const now = Math.floor(Date.now() / 1000);
  assertLessonReadyForTeacherReport(classData, now);

  const participantIds = getParticipantIds(classData);
  if (participantIds.length === 0) {
    throw new HttpsError('failed-precondition', 'This lesson has no students');
  }

  const submittedAt = now;
  const batch = db.batch();

  if (!teacherAttended) {
    batch.update(classRef, {
      status: 'missed_teacher',
      teacher_attended: false,
      finished_at: submittedAt,
      finished_by: auth.uid,
      attendance_summary: {
        total: participantIds.length,
        attended: 0,
        absent: participantIds.length,
      },
    });

    for (const studentId of participantIds) {
      batch.set(classRef.collection('feedback').doc(studentId), {
        teacher_attended: false,
        student_attended: null,
        rating: null,
        comment: null,
        materials_link: null,
        created_at: submittedAt,
        read_at: null,
        teacher_id: auth.uid,
      });
    }

    await batch.commit();

    for (const studentId of participantIds) {
      await addNotificationToUser(
        studentId,
        'Teacher missed lesson',
        'Your teacher reported missing this lesson. Open History to confirm what happened.',
        'warning',
      );
    }

    return { success: true, status: 'missed_teacher', studentCount: participantIds.length };
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new HttpsError(
      'invalid-argument',
      'Student attendance entries are required when you attended',
    );
  }

  const participantSet = new Set(participantIds);
  if (entries.length !== participantIds.length) {
    throw new HttpsError(
      'invalid-argument',
      'Attendance must be recorded for every student in this lesson',
    );
  }

  const seenStudentIds = new Set<string>();
  let attendedCount = 0;
  let absentCount = 0;

  for (const entry of entries) {
    if (seenStudentIds.has(entry.studentId)) {
      throw new HttpsError(
        'invalid-argument',
        'Each student may only appear once in attendance',
      );
    }
    seenStudentIds.add(entry.studentId);

    if (!participantSet.has(entry.studentId)) {
      throw new HttpsError(
        'invalid-argument',
        `Student ${entry.studentId} is not a participant in this lesson`,
      );
    }

    if (typeof entry.studentAttended !== 'boolean') {
      throw new HttpsError(
        'invalid-argument',
        'studentAttended is required for each student',
      );
    }

    if (entry.studentAttended) {
      attendedCount += 1;
      if (typeof entry.rating !== 'number' || entry.rating < 1 || entry.rating > 5) {
        throw new HttpsError(
          'invalid-argument',
          'Rating must be between 1 and 5 for students who attended',
        );
      }
      if (!entry.comment?.trim()) {
        throw new HttpsError(
          'invalid-argument',
          'Comment is required for students who attended',
        );
      }
      if (entry.materialsLink && !/^https?:\/\//i.test(entry.materialsLink)) {
        throw new HttpsError(
          'invalid-argument',
          'Materials link must be a valid http(s) URL',
        );
      }
    } else {
      absentCount += 1;
    }
  }

  if (seenStudentIds.size !== participantIds.length) {
    throw new HttpsError(
      'invalid-argument',
      'Attendance must be recorded for every student in this lesson',
    );
  }

  // Class status is always `finished` when the teacher attended and closed the
  // lesson. Individual absences are stored on each feedback doc only.
  batch.update(classRef, {
    status: 'finished',
    teacher_attended: true,
    finished_at: submittedAt,
    finished_by: auth.uid,
    attendance_summary: {
      total: participantIds.length,
      attended: attendedCount,
      absent: absentCount,
    },
  });

  for (const entry of entries) {
    const feedbackRef = classRef.collection('feedback').doc(entry.studentId);

    if (entry.studentAttended) {
      batch.set(feedbackRef, {
        teacher_attended: true,
        student_attended: true,
        rating: entry.rating,
        comment: entry.comment!.trim(),
        materials_link: entry.materialsLink?.trim() || null,
        created_at: submittedAt,
        read_at: null,
        teacher_id: auth.uid,
      });

      batch.set(
        db
          .collection('users')
          .doc(entry.studentId)
          .collection('student_ratings')
          .doc(auth.uid),
        {
          rating: entry.rating,
          comment: entry.comment!.trim(),
          class_id: classId,
          rated_at: submittedAt,
        },
      );
    } else {
      batch.set(feedbackRef, {
        teacher_attended: true,
        student_attended: false,
        rating: null,
        comment: entry.comment?.trim() || 'Student did not attend this lesson.',
        materials_link: null,
        created_at: submittedAt,
        read_at: null,
        teacher_id: auth.uid,
      });
    }
  }

  await batch.commit();

  for (const entry of entries) {
    if (!entry.studentAttended) {
      await addNotificationToUser(
        entry.studentId,
        'Lesson attendance recorded',
        'Your teacher marked you as absent for a lesson. Open History for details.',
        'warning',
      );
      continue;
    }

    await addNotificationToUser(
      entry.studentId,
      'Lesson feedback ready',
      'Your teacher posted feedback for a completed lesson. Open History to read it.',
      'info',
    );
  }

  return {
    success: true,
    status: 'finished',
    studentCount: entries.length,
    attendanceSummary: {
      total: participantIds.length,
      attended: attendedCount,
      absent: absentCount,
    },
  };
});

export const markLessonFeedbackRead = onCall<{ classId: string }>(
  async ({ auth, data }) => {
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Login required');
    }

    const { classId } = data;
    if (!classId) {
      throw new HttpsError('invalid-argument', 'classId is required');
    }

    const feedbackRef = db
      .collection('classes')
      .doc(classId)
      .collection('feedback')
      .doc(auth.uid);

    const feedbackSnap = await feedbackRef.get();
    if (!feedbackSnap.exists) {
      throw new HttpsError('not-found', 'Feedback not found');
    }

    await feedbackRef.update({
      read_at: Math.floor(Date.now() / 1000),
    });

    return { success: true };
  },
);

export const submitTeacherRating = onCall<{
  classId: string;
  teacherAttended: boolean;
  rating?: number;
  comment?: string;
}>(async ({ auth, data }) => {
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Login required');
  }

  const { classId, teacherAttended, rating, comment } = data;
  if (!classId || typeof teacherAttended !== 'boolean') {
    throw new HttpsError(
      'invalid-argument',
      'classId and teacherAttended are required',
    );
  }

  const classRef = db.collection('classes').doc(classId);
  const classSnap = await classRef.get();
  if (!classSnap.exists) {
    throw new HttpsError('not-found', 'Lesson not found');
  }

  const classData = classSnap.data() as ClassDoc;
  if (!CLOSED_CLASS_STATUSES.has(classData.status || '')) {
    throw new HttpsError(
      'failed-precondition',
      'Attendance can be confirmed after the lesson is closed by the teacher',
    );
  }

  const participantIds = getParticipantIds(classData);
  if (!participantIds.includes(auth.uid)) {
    throw new HttpsError(
      'permission-denied',
      'Only students from this lesson can confirm attendance',
    );
  }

  const teacherId = classData.teacher_id;
  if (!teacherId) {
    throw new HttpsError('failed-precondition', 'This lesson has no assigned teacher');
  }

  const feedbackRef = classRef.collection('feedback').doc(auth.uid);
  const feedbackSnap = await feedbackRef.get();
  if (!feedbackSnap.exists) {
    throw new HttpsError('not-found', 'Lesson record not found');
  }

  const feedbackData = feedbackSnap.data() as {
    student_teacher_rated_at?: number | null;
    student_attended?: boolean | null;
  };

  if (feedbackData.student_teacher_rated_at) {
    throw new HttpsError('already-exists', 'You have already submitted attendance');
  }

  if (feedbackData.student_attended === false) {
    throw new HttpsError(
      'failed-precondition',
      'You were marked absent for this lesson and cannot rate the teacher',
    );
  }

  if (teacherAttended) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new HttpsError(
        'invalid-argument',
        'Rating must be between 1 and 5 when the teacher attended',
      );
    }
  }

  const ratedAt = Math.floor(Date.now() / 1000);
  const trimmedComment = comment?.trim() || null;
  const batch = db.batch();

  batch.update(feedbackRef, {
    student_teacher_attended: teacherAttended,
    student_teacher_rating: teacherAttended ? rating : null,
    student_teacher_comment: trimmedComment,
    student_teacher_rated_at: ratedAt,
  });

  if (teacherAttended && typeof rating === 'number') {
    batch.set(
      db
        .collection('users')
        .doc(teacherId)
        .collection('teacher_ratings')
        .doc(auth.uid),
      {
        rating,
        comment: trimmedComment,
        class_id: classId,
        rated_at: ratedAt,
      },
    );
  }

  await batch.commit();

  return { success: true };
});
