import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db } from '../firebase/firebase-config';
import { functions } from '../firebase/firebase-config';
import { ClassesT, LessonT, StudentT, TeacherT, TopicT } from '../types';

export const useFirebaseLessons = ({
  classes: classIds,
  topicsArr,
  includeCancelled: cancelledIncluded,
  linkForViewer = 'student',
  /** When this string changes, lessons are refetched (e.g. teaching_classes after accept). */
  refetchWhenKey,
}: {
  classes?: string[];
  topicsArr: TopicT[];
  includeCancelled?: boolean;
  /** Which meeting link to attach (student vs teacher join URL). */
  linkForViewer?: 'student' | 'teacher';
  refetchWhenKey?: string;
}) => {
  const [lessons, setLessons] = useState<LessonT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const classIdsKey = classIds?.join(',') ?? '';

  useEffect(() => {
    if (topicsArr.length === 0) {
      setLoading(false);
      return;
    }

    if (classIds === undefined) {
      setLessons([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchLessons = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!classIds.length) {
          if (!cancelled) {
            setLessons([]);
            setLoading(false);
          }
          return;
        }

        const lessonsPromises: Promise<LessonT | null>[] = classIds.map(
          async (classId) => {
            const classRef = doc(db, 'classes', classId);
            const classSnap = await getDoc(classRef);

            if (!classSnap.exists()) {
              return null;
            }

            const classData = classSnap.data() as ClassesT;

            const lessonType =
              classData.lesson_type ||
              (typeof classData.max_students === 'number' &&
              classData.max_students > 1
                ? 'group'
                : '1on1');

            const participantIds = Array.isArray(classData.participant_ids)
              ? classData.participant_ids.filter((id) => !!id)
              : classData.student_id
                ? [classData.student_id]
                : [];

            const participantCount =
              typeof classData.participant_count === 'number'
                ? classData.participant_count
                : participantIds.length;

            const maxParticipants =
              typeof classData.max_students === 'number' &&
              classData.max_students > 0
                ? classData.max_students
                : lessonType === 'group'
                  ? 5
                  : 1;

            const topic =
              topicsArr.find((t) => t.id === classData.topic_id) || null;

            let teacher: TeacherT | null = null;
            if (classData.teacher_id) {
              teacher = {
                first_name: classData.teacher_first_name || 'Teacher',
                last_name: classData.teacher_last_name || '',
                img: classData.teacher_img || '',
                rating: classData.teacher_rating || 0,
              };
            }

            let student: StudentT | null =
              classData.student_first_name || classData.student_last_name
                ? {
                    first_name: classData.student_first_name || 'Student',
                    last_name: classData.student_last_name || '',
                  }
                : null;

            const link =
              linkForViewer === 'teacher'
                ? classData.teacher_link || null
                : classData.student_link || null;

            return {
              id: classSnap.id,
              date: classData.date,
              status: classData.status,
              lessonType,
              level: classData.level,
              participantIds,
              participantCount,
              maxParticipants,
              topic: topic ? { id: topic.id, heading: topic.heading } : null,
              teacher: teacher
                ? {
                    first_name: teacher.first_name,
                    last_name: teacher.last_name,
                    rating: teacher.rating,
                    img: teacher.img,
                  }
                : null,
              student,
              studentId: classData.student_id || '',
              createdBy: classData.created_by || classData.student_id || '',
              link,
              teacherAttended: classData.teacher_attended ?? null,
              finishedAt: classData.finished_at,
              attendanceSummary: classData.attendance_summary,
            };
          },
        );

        const fetchedLessons = (await Promise.all(lessonsPromises)).filter(
          (lesson): lesson is LessonT => lesson !== null,
        );

        const missingStudentIds = [
          ...new Set(
            fetchedLessons
              .filter((lesson) => !lesson.student && lesson.studentId)
              .map((lesson) => lesson.studentId as string),
          ),
        ];

        let studentNameMap: Record<
          string,
          { first_name: string; last_name: string }
        > = {};
        if (missingStudentIds.length && linkForViewer === 'teacher') {
          try {
            const getUsersPublicNames = httpsCallable<
              { userIds: string[] },
              { users: Record<string, { first_name: string; last_name: string }> }
            >(functions, 'getUsersPublicNames');

            const result = await getUsersPublicNames({
              userIds: missingStudentIds,
            });
            studentNameMap = result.data?.users || {};
          } catch {
            studentNameMap = {};
          }
        }

        if (cancelled) return;

        const lessonsWithStudents: LessonT[] = fetchedLessons.map((lesson) => {
          if (lesson.student || !lesson.studentId) return lesson;

          const profile = studentNameMap[lesson.studentId];
          if (!profile) return lesson;

          return {
            ...lesson,
            student: {
              first_name: profile.first_name || 'Student',
              last_name: profile.last_name || '',
            },
          };
        });

        const filteredLessons = cancelledIncluded
          ? lessonsWithStudents
          : lessonsWithStudents.filter(
              (lesson) => !lesson.status.startsWith('cancelled'),
            );

        setLessons(filteredLessons);
      } catch {
        if (!cancelled) {
          setLessons([]);
          setError('Failed to load lessons.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLessons();

    return () => {
      cancelled = true;
    };
  }, [classIdsKey, topicsArr, cancelledIncluded, linkForViewer, refetchWhenKey]);

  return { lessons, loading, error };
};
