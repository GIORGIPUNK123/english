import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { LessonFeedbackT } from '../types';

export type StudentFeedbackStatus = {
  feedback: LessonFeedbackT | null;
  /** Student still needs to confirm teacher attendance / rate. */
  needsAction: boolean;
  /** Student is done (rated, or marked absent with nothing left to do). */
  completed: boolean;
};

/**
 * Loads feedback docs for the given class IDs for one student.
 * Used to split Feedback tab into pending vs completed.
 */
export const useStudentLessonFeedbackMap = (
  classIds: string[],
  studentId: string | null,
  refetchKey?: string | number,
) => {
  const [statusByClassId, setStatusByClassId] = useState<
    Record<string, StudentFeedbackStatus>
  >({});
  const [loading, setLoading] = useState(false);

  const classIdsKey = classIds.join(',');

  useEffect(() => {
    if (!studentId || classIds.length === 0) {
      setStatusByClassId({});
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const entries = await Promise.all(
          classIds.map(async (classId) => {
            const snap = await getDoc(
              doc(db, 'classes', classId, 'feedback', studentId),
            );
            const feedback = snap.exists()
              ? (snap.data() as LessonFeedbackT)
              : null;

            const markedAbsent = feedback?.student_attended === false;
            const alreadyRated = Boolean(feedback?.student_teacher_rated_at);
            const completed = markedAbsent || alreadyRated;
            const needsAction = Boolean(feedback) && !completed;

            return [
              classId,
              { feedback, needsAction, completed },
            ] as const;
          }),
        );

        if (cancelled) return;

        setStatusByClassId(Object.fromEntries(entries));
      } catch {
        if (!cancelled) setStatusByClassId({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [classIdsKey, studentId, refetchKey]);

  return { statusByClassId, loading };
};
