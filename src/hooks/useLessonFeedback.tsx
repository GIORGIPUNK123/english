import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { LessonFeedbackT } from '../types';

export const useLessonFeedback = (
  classId: string | null,
  studentId: string | null,
) => {
  const [feedback, setFeedback] = useState<LessonFeedbackT | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!classId || !studentId) {
      setFeedback(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const feedbackRef = doc(db, 'classes', classId, 'feedback', studentId);
    const unsubscribe = onSnapshot(
      feedbackRef,
      (snap) => {
        setFeedback(snap.exists() ? (snap.data() as LessonFeedbackT) : null);
        setLoading(false);
      },
      () => {
        setFeedback(null);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [classId, studentId]);

  return { feedback, loading };
};
