import { LessonT } from '../types';

/** Count distinct student UIDs across lessons (participant_ids + legacy student_id). */
export const countUniqueLessonStudents = (lessons: LessonT[]): number => {
  const studentIds = new Set<string>();

  for (const lesson of lessons) {
    for (const participantId of lesson.participantIds || []) {
      if (participantId) {
        studentIds.add(participantId);
      }
    }
    if (lesson.studentId) {
      studentIds.add(lesson.studentId);
    }
  }

  return studentIds.size;
};
