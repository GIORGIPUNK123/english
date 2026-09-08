import React, { useState } from 'react';
import { LessonT, StatusT, TopicT, UserDataT } from '../../../types';
import {
  formatAttendanceSummary,
  getLessonDisplayStatus,
} from '../../../utils/lessonStatusUtils';
import { LessonDetailModal } from '../../calendar/LessonDetailModal';
import { Eye, History, RotateCw } from 'lucide-react';
import { useScheduleLessonModal } from '../../../hooks/useScheduleLessonModal';
import { ScheduleLessonModal } from '../../calendar/ScheduleLessonModal';
import { User } from 'firebase/auth';
import { useUserMode } from '../../../context/UserModeContext';
import { getTokenBalances } from '../../../utils/tokenUtils';
import { useLanguage } from '../../../context/LanguageContext';

interface HistoryViewProps {
  user: User;
  userData: UserDataT;
  lessons: LessonT[];
  loading: boolean;
  topicsArr: TopicT[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

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

const HistoryView: React.FC<HistoryViewProps> = ({
  user,
  userData,
  lessons,
  loading,
  topicsArr,
  onRefresh,
  isRefreshing = false,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<LessonT | null>(null);
  const { userMode } = useUserMode();
  const { t } = useLanguage();
  const teachingClassIds = new Set(userData.teaching_classes || []);
  const tokenBalances = getTokenBalances(userData);

  const showDetails = (lesson: LessonT) => {
    setSelectedLesson(lesson);
  };

  const closeModal = () => {
    setSelectedLesson(null);
  };

  const getStatusConfig = (status: StatusT) => {
    const statusConfig: Record<
      StatusT,
      { bgColor: string; textColor: string; label: string }
    > = {
      finished: {
        bgColor: 'bg-green-500/15',
        textColor: 'text-green-700 dark:text-green-300',
        label: t('calendar.finished'),
      },
      cancelled_student: {
        bgColor: 'bg-red-500/15',
        textColor: 'text-red-700 dark:text-red-300',
        label: t('calendar.cancelledByStudent'),
      },
      cancelled_teacher: {
        bgColor: 'bg-red-500/15',
        textColor: 'text-red-700 dark:text-red-300',
        label: t('calendar.cancelledByTeacher'),
      },
      cancelled_system: {
        bgColor: 'bg-red-500/15',
        textColor: 'text-red-700 dark:text-red-300',
        label: t('calendar.cancelledBySystem'),
      },
      scheduled: {
        bgColor: 'bg-blue-500/15',
        textColor: 'text-blue-700 dark:text-blue-300',
        label: t('calendar.scheduledLesson'),
      },
      'in-progress': {
        bgColor: 'bg-orange-500/15',
        textColor: 'text-orange-700 dark:text-orange-300',
        label: t('calendar.inProgress'),
      },
      missed_student: {
        bgColor: 'bg-red-500/15',
        textColor: 'text-red-700 dark:text-red-300',
        label: t('calendar.missedByStudent'),
      },
      missed_teacher: {
        bgColor: 'bg-red-500/15',
        textColor: 'text-red-700 dark:text-red-300',
        label: t('calendar.missedByTeacher'),
      },
    };
    return statusConfig[status];
  };

  const {
    showScheduleModal,
    scheduleTime,
    selectedTopicId,
    selectedLevel,
    lessonType,
    selectedDate,
    setScheduleTime,
    setSelectedTopicId,
    setSelectedLevel,
    setLessonType,
    setSelectedDate,
    closeScheduleModal,
    rescheduleLesson,
    setRescheduleLesson,
    setShowScheduleModal,
  } = useScheduleLessonModal(topicsArr);

  const renderLessonCard = (lesson: LessonT) => {
    const displayStatus = getLessonDisplayStatus(lesson);
    const statusConfig = getStatusConfig(displayStatus);
    const attendanceLine = formatAttendanceSummary(lesson.attendanceSummary);
    const teacherName = lesson.teacher
      ? `${lesson.teacher.first_name} ${lesson.teacher.last_name}`.trim()
      : t('calendar.notAssigned');

    return (
      <button
        key={lesson.id}
        type='button'
        onClick={() => showDetails(lesson)}
        className='w-full p-4 text-left border rounded-xl bg-card border-border hover:border-brand/40 hover:bg-brand-muted'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex flex-wrap items-center gap-2 mb-2'>
              <h3 className='font-semibold truncate text-foreground'>
                {lesson.topic?.heading || t('calendar.untitledLesson')}
              </h3>
              <span
                className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}
              >
                {statusConfig.label}
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
              {userMode === 'teacher' && attendanceLine && (
                <span className='sm:col-span-2'>{attendanceLine}</span>
              )}
            </div>
          </div>
          <span className='flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg text-brand bg-brand-muted'>
            <Eye className='w-3.5 h-3.5' />
            {t('calendar.view')}
          </span>
        </div>
      </button>
    );
  };

  return (
    <>
      <div className='h-full overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex items-center justify-between gap-3 mb-2'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-brand-muted'>
                <History className='w-5 h-5 text-brand' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl'>
                  {t('dashboard.lessonHistory')}
                </h1>
                <p className='text-sm text-muted-foreground'>
                  {lessons.length} {t('dashboard.lessonsFound')}
                </p>
              </div>
            </div>
            <button
              onClick={onRefresh}
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

        {showScheduleModal && scheduleTime && (
          <ScheduleLessonModal
            scheduleTime={scheduleTime}
            onScheduleTimeChange={setScheduleTime}
            selectedTopicId={selectedTopicId}
            onTopicChange={setSelectedTopicId}
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            topicsArr={topicsArr}
            lessonType={lessonType}
            onLessonTypeChange={setLessonType}
            availableTopics={topicsArr}
            lessons={lessons}
            onClose={closeScheduleModal}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            userUid={user.uid}
            tokenBalances={tokenBalances}
            rescheduleLesson={rescheduleLesson}
            setRescheduleLesson={setRescheduleLesson}
          />
        )}

        {loading ? (
          <div className='flex items-center justify-center h-40'>
            <div className='w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin' />
          </div>
        ) : lessons.length > 0 ? (
          <div className='space-y-3'>
            {lessons.map((lesson) => renderLessonCard(lesson))}
          </div>
        ) : (
          <div className='p-8 text-center border border-dashed rounded-xl border-border'>
            <History className='w-10 h-10 mx-auto mb-3 opacity-60 text-muted-foreground' />
            <p className='text-sm font-medium text-foreground'>
              {t('dashboard.noLessonsFound')}
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {t('dashboard.historyWillAppearHere')}
            </p>
          </div>
        )}
      </div>

      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={closeModal}
          setRescheduleLesson={setRescheduleLesson}
          setScheduleModalIsOpen={setShowScheduleModal}
          setScheduleTime={setScheduleTime}
          assignedToMe={
            userMode === 'teacher' && teachingClassIds.has(selectedLesson.id)
          }
          userId={user.uid}
        />
      )}
    </>
  );
};

export default HistoryView;
