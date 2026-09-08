import { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ClipboardCheck,
  MessageSquare,
  RotateCw,
  Star,
} from 'lucide-react';
import { LessonT, UserDataT } from '../../../types';
import { useUserMode } from '../../../context/UserModeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { isClosedLessonStatus } from '../../../utils/lessonStatusUtils';
import { useStudentLessonFeedbackMap } from '../../../hooks/useStudentLessonFeedbackMap';
import { LessonFeedbackModal } from '../../calendar/LessonFeedbackModal';

interface FeedbackViewProps {
  user: User;
  userData: UserDataT;
  lessons: LessonT[];
  loading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const LESSON_DURATION_SECONDS = 3600;

const hasLessonEnded = (lesson: LessonT) =>
  Math.floor(Date.now() / 1000) >= lesson.date + LESSON_DURATION_SECONDS ||
  lesson.status === 'in-progress' ||
  isClosedLessonStatus(lesson.status);

const formatLessonDate = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const formatLessonTime = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

export const FeedbackView = ({
  user,
  userData,
  lessons,
  loading = false,
  onRefresh,
  isRefreshing = false,
}: FeedbackViewProps) => {
  const { userMode } = useUserMode();
  const { t } = useLanguage();
  const [selectedLesson, setSelectedLesson] = useState<LessonT | null>(null);
  const [feedbackRefreshKey, setFeedbackRefreshKey] = useState(0);
  const teachingClassIds = useMemo(
    () => new Set(userData.teaching_classes || []),
    [userData.teaching_classes],
  );

  const relevantLessons = useMemo(() => {
    return lessons
      .filter((lesson) => {
        if (lesson.status.startsWith('cancelled')) return false;
        if (userMode === 'teacher') {
          return teachingClassIds.has(lesson.id);
        }
        return Boolean(lesson.teacher);
      })
      .filter(hasLessonEnded)
      .sort((a, b) => b.date - a.date);
  }, [lessons, teachingClassIds, userMode]);

  const closedStudentLessonIds = useMemo(() => {
    if (userMode !== 'student') return [];
    return relevantLessons
      .filter((lesson) => isClosedLessonStatus(lesson.status))
      .map((lesson) => lesson.id);
  }, [relevantLessons, userMode]);

  const { statusByClassId, loading: feedbackStatusesLoading } =
    useStudentLessonFeedbackMap(
      closedStudentLessonIds,
      userMode === 'student' ? user.uid : null,
      feedbackRefreshKey,
    );

  const { actionNeeded, completed } = useMemo(() => {
    if (userMode === 'teacher') {
      return {
        actionNeeded: relevantLessons.filter(
          (lesson) => !isClosedLessonStatus(lesson.status),
        ),
        completed: relevantLessons.filter((lesson) =>
          isClosedLessonStatus(lesson.status),
        ),
      };
    }

    const closed = relevantLessons.filter((lesson) =>
      isClosedLessonStatus(lesson.status),
    );

    const pending: LessonT[] = [];
    const done: LessonT[] = [];

    for (const lesson of closed) {
      const status = statusByClassId[lesson.id];
      if (!status) {
        // Still loading or missing — keep in pending until we know.
        pending.push(lesson);
        continue;
      }
      if (status.completed) {
        done.push(lesson);
      } else {
        pending.push(lesson);
      }
    }

    return { actionNeeded: pending, completed: done };
  }, [relevantLessons, statusByClassId, userMode]);

  const assignedToSelected =
    !!selectedLesson && teachingClassIds.has(selectedLesson.id);

  const isPageLoading =
    loading || (userMode === 'student' && feedbackStatusesLoading);

  const renderLessonCard = (lesson: LessonT, variant: 'action' | 'done') => {
    const teacherName = lesson.teacher
      ? `${lesson.teacher.first_name} ${lesson.teacher.last_name}`.trim()
      : t('calendar.notAssigned');

    return (
      <button
        key={lesson.id}
        type='button'
        onClick={() => setSelectedLesson(lesson)}
        className='w-full p-4 text-left border rounded-xl bg-card border-border hover:border-brand/40 hover:bg-brand-muted'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex flex-wrap items-center gap-2 mb-2'>
              <h3 className='font-semibold truncate text-foreground'>
                {lesson.topic?.heading || t('calendar.untitledLesson')}
              </h3>
              <span
                className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                  variant === 'action'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {variant === 'action'
                  ? userMode === 'teacher'
                    ? t('dashboard.feedbackActionNeeded')
                    : t('dashboard.feedbackReview')
                  : t('dashboard.feedbackCompleted')}
              </span>
            </div>
            <div className='grid grid-cols-1 gap-1 text-sm sm:grid-cols-2 text-muted-foreground'>
              <span>
                {formatLessonDate(lesson.date)} · {formatLessonTime(lesson.date)}
              </span>
              <span>
                {userMode === 'teacher'
                  ? `${lesson.participantCount} student${lesson.participantCount === 1 ? '' : 's'}`
                  : teacherName}
              </span>
            </div>
          </div>
          <span className='flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg text-brand bg-brand-muted'>
            {userMode === 'teacher' ? (
              <ClipboardCheck className='w-3.5 h-3.5' />
            ) : (
              <Star className='w-3.5 h-3.5' />
            )}
            {t('dashboard.openFeedback')}
          </span>
        </div>
      </button>
    );
  };

  const handleFeedbackSubmitted = () => {
    setFeedbackRefreshKey((key) => key + 1);
    onRefresh?.();
    setSelectedLesson(null);
  };

  return (
    <>
      <div className='h-full overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex items-center justify-between gap-3 mb-2'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-brand-muted'>
                <MessageSquare className='w-5 h-5 text-brand' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl'>
                  {t('dashboard.feedback')}
                </h1>
                <p className='text-sm text-muted-foreground'>
                  {userMode === 'teacher'
                    ? t('dashboard.feedbackTeacherSubtitle')
                    : t('dashboard.feedbackStudentSubtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFeedbackRefreshKey((key) => key + 1);
                onRefresh?.();
              }}
              disabled={isRefreshing}
              className='flex items-center gap-2 px-3 py-2 text-sm transition-all rounded-lg bg-accent text-foreground hover:bg-accent/80 disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <RotateCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className='hidden sm:inline'>
                {isRefreshing
                  ? t('dashboard.refreshing')
                  : t('dashboard.refresh')}
              </span>
            </button>
          </div>
        </div>

        {isPageLoading ? (
          <div className='flex items-center justify-center h-40'>
            <div className='w-8 h-8 border-b-2 border-indigo-500 rounded-full animate-spin' />
          </div>
        ) : (
          <div className='space-y-8'>
            <section>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold text-foreground'>
                  {userMode === 'teacher'
                    ? t('dashboard.feedbackNeedsAttention')
                    : t('dashboard.feedbackReady')}
                </h2>
                <span className='text-sm text-muted-foreground'>
                  {actionNeeded.length}
                </span>
              </div>
              {actionNeeded.length > 0 ? (
                <div className='space-y-3'>
                  {actionNeeded.map((lesson) =>
                    renderLessonCard(lesson, 'action'),
                  )}
                </div>
              ) : (
                <div className='p-8 text-center border border-dashed rounded-xl border-border'>
                  <MessageSquare className='w-10 h-10 mx-auto mb-3 opacity-60 text-muted-foreground' />
                  <p className='text-sm font-medium text-foreground'>
                    {t('dashboard.noFeedbackPending')}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {t('dashboard.feedbackEmptyHint')}
                  </p>
                </div>
              )}
            </section>

            <section>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold text-foreground'>
                  {t('dashboard.feedbackCompleted')}
                </h2>
                <span className='text-sm text-muted-foreground'>
                  {completed.length}
                </span>
              </div>
              {completed.length > 0 ? (
                <div className='space-y-3'>
                  {completed.map((lesson) => renderLessonCard(lesson, 'done'))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  {t('dashboard.noCompletedFeedback')}
                </p>
              )}
            </section>
          </div>
        )}
      </div>

      {selectedLesson && (
        <LessonFeedbackModal
          lesson={selectedLesson}
          userId={user.uid}
          userMode={userMode}
          assignedToMe={assignedToSelected}
          onClose={() => setSelectedLesson(null)}
          onSubmitted={handleFeedbackSubmitted}
        />
      )}
    </>
  );
};

export default FeedbackView;
