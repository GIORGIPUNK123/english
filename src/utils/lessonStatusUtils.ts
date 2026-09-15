import { LessonT, StatusT, LessonAttendanceSummaryT } from '../types';

/** Per-student absence is on feedback docs — not class.status. */
export type { LessonAttendanceSummaryT };

/** Statuses set when a teacher closes attendance via feedback. */
export const CLOSED_LESSON_STATUSES = [
  'finished',
  'missed_teacher',
  /** @deprecated Legacy only — new writes use `finished` + per-student feedback. */
  'missed_student',
] as const satisfies readonly StatusT[];

export type ClosedLessonStatusT = (typeof CLOSED_LESSON_STATUSES)[number];

export const isClosedLessonStatus = (
  status: StatusT,
): status is ClosedLessonStatusT =>
  (CLOSED_LESSON_STATUSES as readonly StatusT[]).includes(status);

/**
 * Maps class-level status for UI labels.
 * `missed_student` on the class doc is legacy; use feedback.student_attended instead.
 */
export const getLessonDisplayStatus = (lesson: Pick<LessonT, 'status'>): StatusT => {
  if (lesson.status === 'missed_student') {
    return 'finished';
  }
  return lesson.status;
};

export const formatAttendanceSummary = (
  summary: LessonAttendanceSummaryT | undefined,
): string | null => {
  if (!summary || summary.total <= 0) {
    return null;
  }
  return `${summary.attended}/${summary.total} students attended`;
};
