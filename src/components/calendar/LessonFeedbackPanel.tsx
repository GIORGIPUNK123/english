import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';
import { LessonFeedbackEntryT, LessonFeedbackT, LessonT } from '../../types';
import { useLessonFeedback } from '../../hooks/useLessonFeedback';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { isClosedLessonStatus } from '../../utils/lessonStatusUtils';
import { getErrorMessage } from '../../utils/firebaseErrorUtils';
type StudentOption = {
  id: string;
  label: string;
};
interface LessonFeedbackPanelProps {
  lesson: LessonT;
  userId: string;
  userMode: 'student' | 'teacher';
  assignedToMe: boolean;
  studentOptions: StudentOption[];
  onSubmitted?: () => void;
}
const emptyEntry = (studentId: string): LessonFeedbackEntryT => ({
  studentId,
  studentAttended: true,
  rating: 5,
  comment: '',
  materialsLink: '',
});
const AttendanceChoice = ({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: boolean | null;
  onChange: (attended: boolean) => void;
  disabled?: boolean;
}) => {
  const { t } = useLanguage();
  return (
  <div>
    <p className='mb-2 text-xs font-medium text-gray-700 dark:text-gray-300'>
      {label}
    </p>
    <div className='flex gap-2'>
      <button
        type='button'
        disabled={disabled}
        onClick={() => onChange(true)}
        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
          value === true
            ? 'border-green-600 bg-green-50 text-green-800 dark:bg-green-500/20 dark:text-green-200 dark:border-green-500'
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
        }`}
      >
        {t('lessonFeedback.yesAttended')}
      </button>
      <button
        type='button'
        disabled={disabled}
        onClick={() => onChange(false)}
        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
          value === false
            ? 'border-red-600 bg-red-50 text-red-800 dark:bg-red-500/20 dark:text-red-200 dark:border-red-500'
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
        }`}
      >
        {t('lessonFeedback.noMissed')}
      </button>
    </div>
  </div>
  );
};
const StarPicker = ({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
}) => {
  const { t } = useLanguage();
  return (
  <div className='flex items-center gap-1'>
    {Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      const filled = starValue <= value;
      return (
        <button
          key={starValue}
          type='button'
          disabled={disabled}
          onClick={() => onChange?.(starValue)}
          className={`p-0.5 transition-colors ${disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          aria-label={`${starValue} ${starValue === 1 ? t('lessonFeedback.starSingular') : t('lessonFeedback.starPlural')}`}
        >
          <Star
            className={`w-5 h-5 ${
              filled
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      );
    })}
  </div>
  );
};
const StudentTeacherRatingSection = ({
  classId,
  feedback,
  lessonStatus,
  onSubmitted,
}: {
  classId: string;
  feedback: LessonFeedbackT;
  lessonStatus: LessonT['status'];
  onSubmitted?: () => void;
}) => {
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [teacherAttended, setTeacherAttended] = useState<boolean | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const alreadySubmitted = Boolean(feedback.student_teacher_rated_at);
  const handleSubmit = async () => {
    if (teacherAttended === null) {
      addToast({
        title: t('lessonFeedback.attendanceRequired'),
        message: t('lessonFeedback.confirmTeacherAttendedPrompt'),
        type: 'error',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const fn = httpsCallable<
        {
          classId: string;
          teacherAttended: boolean;
          rating?: number;
          comment?: string;
        },
        { success: boolean }
      >(functions, 'submitTeacherRating');
      await fn({
        classId,
        teacherAttended,
        rating: teacherAttended ? rating : undefined,
        comment: comment.trim() || undefined,
      });
      addToast({
        title: t('lessonFeedback.attendanceRecorded'),
        message: teacherAttended
          ? t('lessonFeedback.thanksForRating')
          : t('lessonFeedback.reportSubmitted'),
        type: 'success',
      });
      onSubmitted?.();
    } catch (err: unknown) {
      addToast({
        title: t('lessonFeedback.couldNotSubmit'),
        message: getErrorMessage(err, t('lessonFeedback.tryAgain')),
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (feedback.student_attended === false) {
    return (
      <div className='pt-4 mt-4 border-t border-amber-200 dark:border-amber-500/30'>
        <p className='text-sm text-amber-800 dark:text-amber-200'>
          {t('lessonFeedback.absentNoRating')}
        </p>
      </div>
    );
  }
  return (
    <div className='pt-4 mt-4 space-y-3 border-t border-green-200 dark:border-green-500/30'>
      <div>
        <p className='text-xs font-medium tracking-wide text-green-800 uppercase dark:text-green-300'>
          {t('lessonFeedback.confirmTeacherAttendance')}
        </p>
        <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
          {lessonStatus === 'missed_teacher'
            ? t('lessonFeedback.teacherReportedMissing')
            : t('lessonFeedback.didTeacherAttendQuestion')}
        </p>
      </div>
      {alreadySubmitted ? (
        <div className='space-y-2'>
          <p className='text-sm text-gray-800 dark:text-gray-200'>
            {t('lessonFeedback.youReported')}{' '}
            <span className='font-medium'>
              {feedback.student_teacher_attended
                ? t('lessonFeedback.teacherAttended')
                : t('lessonFeedback.teacherMissed')}
            </span>
          </p>
          {feedback.student_teacher_attended && (
            <StarPicker value={feedback.student_teacher_rating || 0} disabled />
          )}
          {feedback.student_teacher_comment && (
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {feedback.student_teacher_comment}
            </p>
          )}
        </div>
      ) : (
        <>
          <AttendanceChoice
            label={t('lessonFeedback.didTeacherAttendLabel')}
            value={teacherAttended}
            onChange={setTeacherAttended}
          />
          {teacherAttended === true && (
            <>
              <StarPicker value={rating} onChange={setRating} />
              <div>
                <label className='block mb-1 text-xs text-gray-600 dark:text-gray-400'>
                  {t('lessonFeedback.commentOptional')}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white'
                  placeholder={t('lessonFeedback.commentPlaceholderPositive')}
                />
              </div>
            </>
          )}
          {teacherAttended === false && (
            <div>
              <label className='block mb-1 text-xs text-gray-600 dark:text-gray-400'>
                {t('lessonFeedback.commentOptional')}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white'
                placeholder={t('lessonFeedback.commentPlaceholderNegative')}
              />
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || teacherAttended === null}
            className='w-full px-4 py-2.5 text-sm font-medium text-white transition-all bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting
              ? t('lessonFeedback.submitting')
              : t('lessonFeedback.submitAttendance')}
          </button>
        </>
      )}
    </div>
  );
};
export const LessonFeedbackPanel = ({
  lesson,
  userId,
  userMode,
  assignedToMe,
  studentOptions,
  onSubmitted,
}: LessonFeedbackPanelProps) => {
  const isClosedLesson = isClosedLessonStatus(lesson.status);
  const { feedback, loading } = useLessonFeedback(
    isClosedLesson && userMode === 'student' ? lesson.id : null,
    userMode === 'student' ? userId : null,
  );
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherAttended, setTeacherAttended] = useState<boolean | null>(null);
  const [entries, setEntries] = useState<LessonFeedbackEntryT[]>([]);
  const markReadAttemptedRef = useRef(false);
  const lessonEnded =
    Math.floor(Date.now() / 1000) >= lesson.date + 3600 ||
    lesson.status === 'in-progress';
  const canTeacherSubmit =
    userMode === 'teacher' &&
    assignedToMe &&
    !isClosedLesson &&
    !lesson.status.startsWith('cancelled') &&
    lessonEnded &&
    studentOptions.length > 0;
  useEffect(() => {
    if (canTeacherSubmit) {
      setEntries(studentOptions.map((s) => emptyEntry(s.id)));
      setTeacherAttended(null);
    }
  }, [canTeacherSubmit, studentOptions]);
  const unread = useMemo(
    () => Boolean(feedback && !feedback.read_at),
    [feedback],
  );
  const markRead = async () => {
    if (!feedback || feedback.read_at) {
      return;
    }
    try {
      const fn = httpsCallable<{ classId: string }, { success: boolean }>(
        functions,
        'markLessonFeedbackRead',
      );
      await fn({ classId: lesson.id });
    } catch {
      // Non-blocking.
    }
  };
  useEffect(() => {
    if (!feedback || feedback.read_at || userMode !== 'student') {
      markReadAttemptedRef.current = false;
      return;
    }
    if (markReadAttemptedRef.current) {
      return;
    }
    markReadAttemptedRef.current = true;
    void markRead();
  }, [feedback, userMode, lesson.id]);
  const updateEntry = (
    studentId: string,
    patch: Partial<LessonFeedbackEntryT>,
  ) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId ? { ...entry, ...patch } : entry,
      ),
    );
  };
  const handleTeacherSubmit = async () => {
    if (teacherAttended === null) {
      addToast({
        title: t('lessonFeedback.attendanceRequired'),
        message: t('lessonFeedback.confirmYouAttendedPrompt'),
        type: 'error',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const fn = httpsCallable<
        {
          classId: string;
          teacherAttended: boolean;
          entries?: LessonFeedbackEntryT[];
        },
        { success: boolean }
      >(functions, 'submitLessonFeedback');
      if (!teacherAttended) {
        await fn({ classId: lesson.id, teacherAttended: false });
        addToast({
          title: t('lessonFeedback.markedMissedTitle'),
          message: t('lessonFeedback.markedMissedMessage'),
          type: 'success',
        });
        onSubmitted?.();
        return;
      }
      const invalidAttended = entries.some(
        (entry) => entry.studentAttended && !entry.comment.trim(),
      );
      if (invalidAttended) {
        addToast({
          title: t('lessonFeedback.feedbackRequiredTitle'),
          message: t('lessonFeedback.feedbackRequiredMessage'),
          type: 'error',
        });
        return;
      }
      await fn({
        classId: lesson.id,
        teacherAttended: true,
        entries: entries.map((entry) => ({
          ...entry,
          materialsLink: entry.materialsLink?.trim() || undefined,
          comment: entry.comment.trim(),
        })),
      });
      addToast({
        title: t('lessonFeedback.lessonCompletedTitle'),
        message: t('lessonFeedback.lessonCompletedMessage'),
        type: 'success',
      });
      onSubmitted?.();
    } catch (err: unknown) {
      addToast({
        title: t('lessonFeedback.couldNotSubmit'),
        message: getErrorMessage(err, t('lessonFeedback.tryAgain')),
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (userMode === 'student') {
    if (!isClosedLesson) {
      return null;
    }
    if (loading) {
      return (
        <div className='p-4 text-sm text-gray-500 border border-gray-200 rounded-lg dark:border-gray-700 dark:text-gray-400'>
          {t('lessonFeedback.loadingLesson')}
        </div>
      );
    }
    if (!feedback) {
      return (
        <div className='p-4 text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-400'>
          {t('lessonFeedback.waitingForTeacherToClose')}
        </div>
      );
    }
    if (feedback.teacher_attended === false) {
      return (
        <div className='p-5 space-y-4 border border-amber-200 rounded-xl bg-amber-50/80 dark:bg-amber-500/10 dark:border-amber-500/30'>
          <p className='text-sm font-medium text-amber-900 dark:text-amber-200'>
            {t('lessonFeedback.teacherMissedLesson')}
          </p>
          <StudentTeacherRatingSection
            classId={lesson.id}
            feedback={feedback}
            lessonStatus={lesson.status}
            onSubmitted={onSubmitted}
          />
        </div>
      );
    }
    if (feedback.student_attended === false) {
      return (
        <div className='p-5 space-y-3 border border-amber-200 rounded-xl bg-amber-50/80 dark:bg-amber-500/10 dark:border-amber-500/30'>
          <p className='text-sm font-medium text-amber-900 dark:text-amber-200'>
            {t('lessonFeedback.markedAbsent')}
          </p>
          {feedback.comment && (
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {feedback.comment}
            </p>
          )}
        </div>
      );
    }
    return (
      <div className='p-5 space-y-4 border border-green-200 rounded-xl bg-green-50/80 dark:bg-green-500/10 dark:border-green-500/30'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <p className='text-xs font-medium tracking-wide text-green-700 uppercase dark:text-green-300'>
              {t('lessonFeedback.teacherFeedback')}
            </p>
            {unread && (
              <span className='inline-block mt-1 px-2 py-0.5 text-[11px] rounded-full bg-green-600 text-white'>
                {t('lessonFeedback.newBadge')}
              </span>
            )}
          </div>
          {typeof feedback.rating === 'number' && feedback.rating > 0 && (
            <div className='flex items-center gap-1'>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`w-4 h-4 ${
                    index < (feedback.rating || 0)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        {feedback.comment && (
          <p className='text-sm leading-relaxed text-gray-800 whitespace-pre-wrap dark:text-gray-100'>
            {feedback.comment}
          </p>
        )}
        {feedback.materials_link && (
          <a
            href={feedback.materials_link}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline'
          >
            <ExternalLink className='w-4 h-4' />
            {t('lessonFeedback.openMaterials')}
          </a>
        )}
        <StudentTeacherRatingSection
          classId={lesson.id}
          feedback={feedback}
          lessonStatus={lesson.status}
          onSubmitted={onSubmitted}
        />
      </div>
    );
  }
  if (isClosedLesson && assignedToMe) {
    const attendanceLine = lesson.attendanceSummary
      ? t('lessonFeedback.studentsAttended')
          .replace('{attended}', String(lesson.attendanceSummary.attended))
          .replace('{total}', String(lesson.attendanceSummary.total))
      : null;

    return (
      <div className='p-5 space-y-3 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700'>
        <p className='text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400'>
          {t('lessonFeedback.lessonClosed')}
        </p>
        <p className='text-sm text-gray-800 dark:text-gray-200'>
          {lesson.status === 'missed_teacher'
            ? t('lessonFeedback.youReportedMissing')
            : t('lessonFeedback.attendanceSubmitted')}
        </p>
        {attendanceLine && (
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {attendanceLine}
          </p>
        )}
      </div>
    );
  }

  if (!canTeacherSubmit) {
    return (
      <div className='p-4 text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-400'>
        {t('lessonFeedback.opensAfterLesson')}
      </div>
    );
  }
  return (
    <div className='p-5 space-y-4 border border-purple-200 rounded-xl bg-purple-50/70 dark:bg-purple-500/10 dark:border-purple-500/30'>
      <div>
        <p className='text-xs font-medium tracking-wide text-purple-700 uppercase dark:text-purple-300'>
          {t('lessonFeedback.completeLesson')}
        </p>
        <p className='mt-1 text-sm text-gray-700 dark:text-gray-300'>
          {t('lessonFeedback.completeLessonHint')}
        </p>
      </div>
      <AttendanceChoice
        label={t('lessonFeedback.didYouAttend')}
        value={teacherAttended}
        onChange={setTeacherAttended}
      />
      {teacherAttended === false && (
        <button
          onClick={handleTeacherSubmit}
          disabled={isSubmitting}
          className='w-full px-4 py-3 text-sm font-medium text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting
            ? t('lessonFeedback.submitting')
            : t('lessonFeedback.iMissedLesson')}
        </button>
      )}
      {teacherAttended === true &&
        entries.map((entry) => {
          const student = studentOptions.find((s) => s.id === entry.studentId);
          return (
            <div
              key={entry.studentId}
              className='p-4 space-y-3 bg-white border border-gray-200 rounded-lg dark:bg-gray-900/40 dark:border-gray-700'
            >
              <p className='text-sm font-medium text-gray-900 dark:text-white'>
                {student?.label || t('lessonFeedback.studentFallback')}
              </p>
              <AttendanceChoice
                label={t('lessonFeedback.didStudentAttend')}
                value={entry.studentAttended}
                onChange={(attended) =>
                  updateEntry(entry.studentId, { studentAttended: attended })
                }
              />
              {entry.studentAttended ? (
                <>
                  <div>
                    <label className='block mb-1 text-xs text-gray-600 dark:text-gray-400'>
                      {t('lessonFeedback.rating')}
                    </label>
                    <select
                      value={entry.rating}
                      onChange={(e) =>
                        updateEntry(entry.studentId, {
                          rating: Number(e.target.value),
                        })
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white'
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value}{' '}
                          {value === 1
                            ? t('lessonFeedback.starSingular')
                            : t('lessonFeedback.starPlural')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block mb-1 text-xs text-gray-600 dark:text-gray-400'>
                      {t('lessonFeedback.feedbackComment')}
                    </label>
                    <textarea
                      value={entry.comment}
                      onChange={(e) =>
                        updateEntry(entry.studentId, { comment: e.target.value })
                      }
                      rows={4}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white'
                      placeholder={t('lessonFeedback.feedbackCommentPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className='block mb-1 text-xs text-gray-600 dark:text-gray-400'>
                      {t('lessonFeedback.materialsLink')}
                    </label>
                    <input
                      type='url'
                      value={entry.materialsLink || ''}
                      onChange={(e) =>
                        updateEntry(entry.studentId, {
                          materialsLink: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white'
                      placeholder='https://...'
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className='block mb-1 text-xs text-gray-600 dark:text-gray-400'>
                    {t('lessonFeedback.noteOptional')}
                  </label>
                  <textarea
                    value={entry.comment}
                    onChange={(e) =>
                      updateEntry(entry.studentId, { comment: e.target.value })
                    }
                    rows={2}
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white'
                    placeholder={t('lessonFeedback.notePlaceholder')}
                  />
                </div>
              )}
            </div>
          );
        })}
      {teacherAttended === true && (
        <button
          onClick={handleTeacherSubmit}
          disabled={isSubmitting}
          className='w-full px-4 py-3 text-sm font-medium text-white transition-all bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting
            ? t('lessonFeedback.submitting')
            : t('lessonFeedback.submitAttendanceFeedback')}
        </button>
      )}
    </div>
  );
};
