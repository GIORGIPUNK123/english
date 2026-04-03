import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { ClassesT, LessonT, TeacherT, TopicT } from '../types';

export const useFirebaseLessons = ({
  classes: classIds,
  topicsArr,
  includeCancelled: cancelledIncluded,
}: {
  classes?: string[];
  topicsArr: TopicT[];
  includeCancelled?: boolean;
}) => {
  const [lessons, setLessons] = useState<LessonT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicsArr.length === 0) {
      setLoading(false);
      return;
    }

    const fetchLessons = async () => {
      setLoading(true);
      let classIdsToFetch = classIds;
      const isGlobalFetch = !classIdsToFetch;

      if (!classIdsToFetch) {
        const classesSnapshot = await getDocs(collection(db, 'classes'));
        classIdsToFetch = classesSnapshot.docs.map((d) => d.id);
      }

      if (!classIdsToFetch.length) {
        setLessons([]);
        setLoading(false);
        return;
      }

      const lessonsPromises = classIdsToFetch.map(async (classId) => {
        const classRef = doc(db, 'classes', classId);
        const classSnap = await getDoc(classRef);

        if (!classSnap.exists()) {
          return {
            id: classId,
            date: 0,
            status: 'scheduled' as const,
            topic: null,
            teacher: null,
            link: null,
          };
        }

        const classData = classSnap.data() as ClassesT;

        if (isGlobalFetch && classData.student_id === classData.teacher_id) {
          return null;
        }

        const topic =
          topicsArr.find((t) => t.id === classData.topic_id) || null;

        let teacher: TeacherT | null = null;
        if (classData.teacher_id) {
          const teacherSnap = await getDoc(
            doc(db, 'teachers', classData.teacher_id),
          );
          if (teacherSnap.exists()) {
            teacher = teacherSnap.data() as TeacherT;
          } else {
            // Fallback: teacher profiles may live in users collection.
            const teacherUserSnap = await getDoc(
              doc(db, 'users', classData.teacher_id),
            );
            if (teacherUserSnap.exists()) {
              const teacherUser = teacherUserSnap.data() as {
                first_name?: string;
                last_name?: string;
                rating?: number;
                img?: string;
              };
              teacher = {
                first_name: teacherUser.first_name || 'Teacher',
                last_name: teacherUser.last_name || '',
                rating: teacherUser.rating || 0,
                img: teacherUser.img || '',
              };
            }
          }
        }

        return {
          id: classSnap.id,
          date: classData.date,
          status: classData.status,
          topic: topic ? { id: topic.id, heading: topic.heading } : null,
          teacher: teacher
            ? {
                first_name: teacher.first_name,
                last_name: teacher.last_name,
                rating: teacher.rating,
                img: teacher.img,
              }
            : null,
          link: classIdsToFetch
            ? classData.student_link
            : classData.teacher_link,
        };
      });

      const fetchedLessons = (await Promise.all(lessonsPromises)).filter(
        (lesson): lesson is LessonT => lesson !== null,
      );

      // Filter out cancelled lessons if not included
      const filteredLessons = cancelledIncluded
        ? fetchedLessons
        : fetchedLessons.filter(
            (lesson) => !lesson.status.startsWith('cancelled'),
          );

      setLessons(filteredLessons);
      setLoading(false);
    };

    fetchLessons();
  }, [classIds, topicsArr, cancelledIncluded]);

  return { lessons, loading };
};
