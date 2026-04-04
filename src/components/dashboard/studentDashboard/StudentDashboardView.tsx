import { Clock, Calendar, RotateCw } from 'lucide-react';
import { LessonT, TopicT, UserDataT } from '../../../types';
import { LessonDetailModal } from '../../calendar/LessonDetailModal';
import { useEffect, useState } from 'react';
import { ScheduleLessonModal } from '../../calendar/ScheduleLessonModal';
import { User } from 'firebase/auth';
import { useScheduleLessonModal } from '../../../hooks/useScheduleLessonModal';

import { TopUpModal } from '../studentDashboard/TopUpModal';
import { InfoWidget } from '../shared/atoms/InfoWidget';
import { PendingRequests } from './PendingRequests';
import { FavoriteTeachers } from './FavoriteTeachers';
import { TipWidget } from '../shared/atoms/TipWidget';
import { getStudentRatingAverage } from '../../../firebase/firebaseUserUtils';

interface StudentDashboardViewProps {
  user: User;
  userData: UserDataT;
  lessons: LessonT[];
  topicsArr: TopicT[];
  onRefresh?: () => void;
}

export const StudentDashboardView = ({
  user,
  userData,
  lessons,
  topicsArr,
  onRefresh,
}: StudentDashboardViewProps) => {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [ratingAverage, setRatingAverage] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  // Custom hooks
  const {
    showScheduleModal,
    scheduleTime,
    selectedTopicId,
    lessonType,
    selectedDate,
    setScheduleTime,
    setSelectedTopicId,
    setLessonType,
    setSelectedDate,
    openScheduleModalWithDefaultTime,
    closeScheduleModal,
    rescheduleLesson,
    setRescheduleLesson,
    setShowScheduleModal,
  } = useScheduleLessonModal(topicsArr);

  const [selectedLesson, setSelectedLesson] = useState<LessonT | null>(null);
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

  useEffect(() => {
    let isActive = true;
    const fetchAverage = getStudentRatingAverage;

    fetchAverage()
      .then((result) => {
        if (!isActive) return;
        setRatingCount(result.count || 0);
        setRatingAverage(result.average || 0);
      })
      .catch(() => {
        if (!isActive) return;
        setRatingCount(0);
        setRatingAverage(0);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className='h-full overflow-y-auto'>
      {/* Modals */}
      {showScheduleModal && scheduleTime && (
        <ScheduleLessonModal
          scheduleTime={scheduleTime}
          onScheduleTimeChange={setScheduleTime}
          selectedTopicId={selectedTopicId}
          onTopicChange={setSelectedTopicId}
          topicsArr={topicsArr}
          lessonType={lessonType}
          onLessonTypeChange={setLessonType}
          availableTopics={topicsArr}
          lessons={lessons}
          onClose={closeScheduleModal}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          userUid={user.uid}
          availableTokens={userData.tokens}
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
        />
      )}

      {/* Welcome Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between gap-3 mb-2'>
          <h1 className='text-xl text-gray-900 dark:text-white sm:text-2xl lg:text-3xl'>
            Welcome back, {capitalNames[0]}! 👋
          </h1>
          <button
            onClick={onRefresh}
            className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-all bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          >
            <RotateCw className='w-4 h-4' />
            <span className='hidden sm:inline'>Refresh</span>
          </button>
        </div>
        <TipWidget
          tip={`Welcome back to your dashboard! You have ${userData.tokens} tokens available. Each token = 1 lesson.`}
          // min={true}
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
          type='averageRating'
          userData={userData}
          ratingAverage={ratingAverage}
          ratingCount={ratingCount}
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
        <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg text-gray-900 dark:text-white sm:text-xl'>
              Upcoming Lessons
            </h2>
            <button className='text-xs text-blue-500 transition-all sm:text-sm dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300'>
              View All
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
              return (
                <div
                  key={lesson.id}
                  className='p-3 transition-all border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0`}
                    >
                      <span className='text-sm font-semibold text-white'>
                        {/* {lesson.avatar} */}
                      </span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='mb-1 text-sm text-gray-900 dark:text-white sm:text-base'>
                        {' '}
                        {lesson.teacher
                          ? `${lesson.teacher.first_name} ${lesson.teacher.last_name}`
                          : 'TBA'}
                      </h4>
                      <p className='mb-2 text-xs text-gray-600 sm:text-sm dark:text-gray-400'>
                        {/* {lesson.subject} */}
                      </p>
                      <div className='flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500'>
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
            className='w-full mt-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base'
          >
            + Schedule New Lesson
          </button>
        </div>

        {/* Pending Requests */}
        <PendingRequests
          pendingRequests={pendingRequests}
          setSelectedLesson={setSelectedLesson}
        />
      </div>

      {/* Favorite Teachers */}
      <FavoriteTeachers />

      {/* Top Up Modal */}
      {showTopUpModal && (
        <TopUpModal
          isOpen={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
          currentTokens={userData.tokens}
        />
      )}
    </div>
  );
};
