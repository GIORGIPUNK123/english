import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase-config';
import { LessonT } from '../types';

export type LessonStudentOption = {
  id: string;
  label: string;
};

export const useLessonStudentOptions = (lesson: LessonT | null) => {
  const [options, setOptions] = useState<LessonStudentOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lesson) {
      setOptions([]);
      return;
    }

    const participantIds =
      lesson.participantIds && lesson.participantIds.length > 0
        ? lesson.participantIds
        : lesson.studentId
          ? [lesson.studentId]
          : [];

    if (participantIds.length === 0) {
      setOptions([]);
      return;
    }

    if (
      participantIds.length === 1 &&
      lesson.student &&
      lesson.studentId === participantIds[0]
    ) {
      setOptions([
        {
          id: participantIds[0],
          label:
            `${lesson.student.first_name} ${lesson.student.last_name}`.trim() ||
            'Student',
        },
      ]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const getUsersPublicNames = httpsCallable<
          { userIds: string[] },
          { users: Record<string, { first_name: string; last_name: string }> }
        >(functions, 'getUsersPublicNames');

        const result = await getUsersPublicNames({ userIds: participantIds });
        const users = result.data?.users || {};

        if (cancelled) return;

        setOptions(
          participantIds.map((id) => {
            const profile = users[id];
            const label = profile
              ? `${profile.first_name || 'Student'} ${profile.last_name || ''}`.trim()
              : 'Student';
            return { id, label };
          }),
        );
      } catch {
        if (!cancelled) {
          setOptions(
            participantIds.map((id) => ({
              id,
              label: 'Student',
            })),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [lesson]);

  return { options, loading };
};
