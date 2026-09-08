import { Clock, Calendar, RotateCw } from 'lucide-react';
import { LessonT, TopicT, UserDataT } from '../../../types';
import { LessonDetailModal } from '../../calendar/LessonDetailModal';
import { useState } from 'react';
import { ScheduleLessonModal } from '../../calendar/ScheduleLessonModal';
import { User } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../firebase/firebase-config';
import { useScheduleLessonModal } from '../../../hooks/useScheduleLessonModal';

import { TopUpModal } from '../studentDashboard/TopUpModal';
import { InfoWidget } from '../shared/atoms/InfoWidget';
import { PendingRequests } from './PendingRequests';
import { TipWidget } from '../shared/atoms/TipWidget';
import { useToast } from '../../../context/ToastContext';
import { getFirebaseErrorCode } from '../../../utils/firebaseErrorUtils';
import { getTokenBalances } from '../../../utils/tokenUtils';
import { useLanguage } from '../../../context/LanguageContext';

interface StudentDashboardViewProps {
  user: User;
  userData: UserDataT;
  lessons: LessonT[];
  openGroupLessons?: LessonT[];
  topicsArr: TopicT[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const StudentDashboardView = ({
  user,
  userData,
  lessons,
  openGroupLessons = [],
  topicsArr,
  onRefresh,
  isRefreshing = false,
}: StudentDashboardViewProps) => {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [joiningGroupLessonId, setJoiningGroupLessonId] = useState<
    string | null
  >(null);
  const { addToast } = useToast();
  const { t } = useLanguage();

  // Custom hooks
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
    openScheduleModalWithDefaultTime,
    closeScheduleModal,
    rescheduleLesson,
    setRescheduleLesson,
    setShowScheduleModal,
  } = useScheduleLessonModal(topicsArr);

  const [selectedLesson, setSelectedLesson] = useState<LessonT | null>(null);
  const tokenBalances = getTokenBalances(userData);
  // Computed values
  const capitalNames = [
    userData.first_name.charAt(0).toUpperCase() + userData.first_name.slice(1),
    userData.last_name.charAt(0).toUpperCase() + userData.last_name.slice(1),
  ];
  const upcomingLessons = lessons.filter(
    (lesson) =>
      lesson.status === 'scheduled' &&
      lesson.date >= Math.floor(Date.now() / 1000) &&
      lesson.teacher !== null,
  );

  const pendingRequests = lessons.filter(
    (lesson) =>
      lesson.status === 'scheduled' &&
      lesson.date > Math.floor(Date.now() / 1000) &&
      lesson.teacher === null,
  );

  const discoverableGroupLessons = openGroupLessons
    .slice()
    .sort((a, b) => a.date - b.date)
    .slice(0, 8);

  const joinGroupLesson = async (lessonId: string) => {
    setJoiningGroupLessonId(lessonId);
    try {
      const fn = httpsCallable<
        { classId: string },
        {
          success: boolean;
          alreadyJoined: boolean;
          participantCount: number;
          maxParticipants: number;
        }
      >(functions, 'joinGroupLesson');

      const result = await fn({ classId: lessonId });
      const payload = result.data;

      addToast({
        title: payload.alreadyJoined
          ? t('calendar.alreadyJoinedTitle')
          : t('calendar.joinedGroupTitle'),
        message: payload.alreadyJoined
          ? t('calendar.alreadyJoinedMessage')
          : `${t('calendar.joinedSuccessMessage')} (${payload.participantCount}/${payload.maxParticipants} students).`,
        type: 'success',
      });

      onRefresh?.();
    } catch (error: unknown) {
      let message = t('calendar.joinFailedMessage');
      const code = getFirebaseErrorCode(error);
      if (code === 'failed-precondition') {
        message = t('calendar.classFullMessage');
      } else if (code === 'unauthenticated') {
        message = t('auth.loginFailed');
      }

      addToast({
        title: t('calendar.joinFailedTitle'),
        message,
        type: 'error',
      });
    } finally {
      setJoiningGroupLessonId(null);
    }
  };

  return (
    <div className='h-full overflow-y-auto'>
      {/* Modals */}
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

      {selectedLesson && (
        <LessonDetailModal
          setRescheduleLesson={setRescheduleLesson}
          setScheduleModalIsOpen={setShowScheduleModal}
          setScheduleTime={setScheduleTime}
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          userId={user.uid}
        />
      )}

      {/* Welcome Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between gap-3 mb-2'>
          <h1 className='text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl'>
            {t('dashboard.welcomeStudent')}, {capitalNames[0]}
          </h1>
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
        <TipWidget
          tip={`${t('dashboard.welcomeStudent')}! ${t('dashboard.tokenDetailsOneOnOne')}: ${tokenBalances.oneOnOne}, ${t('dashboard.tokenDetailsGroup')}: ${tokenBalances.group}, ${t('dashboard.tokenDetailsFlexible')}: ${tokenBalances.legacy}.`}
        />
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 gap-3 mb-8 lg:grid-cols-4 sm:gap-4'>
        <InfoWidget
          type='tokens'
          userData={userData}
          setShowTopUpModal={setShowTopUpModal}
          lessons={lessons}
        />
        <InfoWidget
          type='upcomingLessons'
          userData={userData}
          lessons={lessons}
          upcommingLessons={upcomingLessons}
        />
        <InfoWidget
          type='pendingRequests'
          userData={userData}
          pendingRequests={pendingRequests}
        />
        <InfoWidget
          type='hoursCompleted'
          userData={userData}
          lessons={lessons}
        />
      </div>

      {/* Two Column Layout */}
      <div className='grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2 sm:gap-6'>
        {/* Upcoming Lessons */}
        <div className='p-4 border sm:p-6 bg-card border-border rounded-xl'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-foreground sm:text-xl'>
              {t('dashboard.upcomingLessons')}
            </h2>
            <button className='text-xs text-blue-500 transition-all sm:text-sm dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300'>
              {t('dashboard.viewAll')}
            </button>
          </div>
          <div className='space-y-3'>
            {upcomingLessons.map((lesson) => {
              const lessonDate = new Date(lesson.date * 1000);
              const formattedDate = lessonDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = lessonDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
              const teacherName = lesson.teacher
                ? `${lesson.teacher.first_name} ${lesson.teacher.last_name}`.trim()
                : 'TBA';
              const teacherInitials = lesson.teacher
                ? `${lesson.teacher.first_name.charAt(0)}${lesson.teacher.last_name.charAt(0)}`
                    .toUpperCase()
                    .trim() || 'T'
                : 'T';

              return (
                <div
                  key={lesson.id}
                  className='p-3 transition-all border rounded-lg cursor-pointer bg-muted/40 border-border hover:bg-accent/50'
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <div className='flex items-start gap-3'>
                    <div className='relative flex items-center justify-center w-10 h-10 rounded-lg shrink-0 brand-mark'>
                      <span className='text-sm font-semibold text-white'>
                        {teacherInitials}
                      </span>
                      {lesson.teacher?.img && (
                        <img
                          src={lesson.teacher.img}
                          alt={`${teacherName} avatar`}
                          className='absolute inset-0 object-cover w-full h-full rounded-lg'
                          loading='lazy'
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='mb-1 text-sm font-medium text-foreground sm:text-base'>
                        {teacherName}
                      </h4>
                      <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                        <Calendar className='w-3 h-3' />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <Clock className='w-3 h-3' />
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={openScheduleModalWithDefaultTime}
            className='w-full mt-4 px-4 py-2.5 text-sm sm:text-base btn-primary'
          >
            {t('dashboard.scheduleNewLesson')}
          </button>
        </div>

        {/* Pending Requests */}
        <PendingRequests
          pendingRequests={pendingRequests}
          setSelectedLesson={setSelectedLesson}
        />
      </div>

      <div className='mb-6 p-4 border sm:p-6 bg-card border-border rounded-xl'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-foreground sm:text-xl'>
            {t('dashboard.openGroupClasses')}
          </h2>
          <span className='text-xs text-muted-foreground'>
            {discoverableGroupLessons.length} {t('dashboard.available')}
          </span>
        </div>

        {discoverableGroupLessons.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            {t('dashboard.noOpenGroupClasses')}
          </p>
        ) : (
          <div className='space-y-3'>
            {discoverableGroupLessons.map((lesson) => {
              const lessonDate = new Date(lesson.date * 1000);
              return (
                <div
                  key={lesson.id}
                  className='p-3 border rounded-lg bg-muted/40 border-border'
                >
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                      <p className='text-sm font-medium text-foreground sm:text-base'>
                        {lesson.topic?.heading || t('calendar.groupClass')}
                      </p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {lessonDate.toLocaleDateString()} at{' '}
                        {lessonDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {lesson.participantCount}/{lesson.maxParticipants}{' '}
                        {t('calendar.joined')}
                      </p>
                    </div>
                    <button
                      onClick={() => joinGroupLesson(lesson.id)}
                      disabled={joiningGroupLessonId === lesson.id}
                      className='px-3 py-2 text-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {joiningGroupLessonId === lesson.id
                        ? t('dashboard.joining')
                        : t('dashboard.joinGroup')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <TopUpModal
          isOpen={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
          tokenBalances={tokenBalances}
        />
      )}
    </div>
  );
};
