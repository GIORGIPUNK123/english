import {
  Clock,
  Calendar,
  AlertCircle,
  Star,
  Video,
  Coins,
  Plus,
} from 'lucide-react';
import { LessonT, TopicT, UserDataT } from '../../../types';
import { LessonDetailModal } from '../../calendar/LessonDetailModal';
import { useState } from 'react';
import { ScheduleLessonModal } from '../../calendar/ScheduleLessonModal';
import { User } from 'firebase/auth';
import { useScheduleLessonModal } from '../../../hooks/useScheduleLessonModal';
import { CancelModal } from '../../calendar/CancelModal';
import { TopUpModal } from './TopUpModal';
export const StudentDashboardView = (props: {
  user: User;
  userData: UserDataT;
  lessons: LessonT[];
  topicsArr: TopicT[];
}) => {
  const { user, userData, lessons, topicsArr } = props;
  const [showTopUpModal, setShowTopUpModal] = useState(false);

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
  } = useScheduleLessonModal(topicsArr);

  const [selectedLesson, setSelectedLesson] = useState<LessonT | null>(null);
  const [cancelLessonId, setCancelLessonId] = useState<string | null>(null);

  // Computed values
  const upcomingLessons = lessons.filter(
    (lesson) =>
      lesson.status === 'scheduled' &&
      lesson.date >= Math.floor(Date.now() / 1000) &&
      lesson.teacher !== null,
  );

  const pendingRequests = lessons.filter(
    (lesson) =>
      lesson.status === 'scheduled' &&
      lesson.date > Math.floor(Date.now() / 1000),
  );

  const stats = [
    {
      label: 'Available Tokens',
      value: userData.tokens,
      icon: Coins,
      color: 'bg-yellow-500',
    },
    {
      label: 'Upcoming Lessons',
      value: upcomingLessons.length,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      label: 'Hours Completed',
      value: lessons.filter((lesson) => lesson.status === 'finished').length,
      icon: Clock,
      color: 'bg-purple-500',
    },
    {
      label: 'Pending Requests',
      value: pendingRequests.length,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
  ];

  const favoriteTeachers = [
    {
      name: 'Sarah Johnson',
      specialty: 'Business English',
      rating: 4.9,
      lessons: 12,
      avatar: 'SJ',
      color: 'bg-blue-500',
    },
    {
      name: 'Michael Chen',
      specialty: 'Conversation',
      rating: 5.0,
      lessons: 8,
      avatar: 'MC',
      color: 'bg-purple-500',
    },
    {
      name: 'Emma Williams',
      specialty: 'Grammar',
      rating: 4.8,
      lessons: 6,
      avatar: 'EW',
      color: 'bg-green-500',
    },
  ];
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
        />
      )}

      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}

      {/* <div className="h-full overflow-y-auto"> */}
      {/* Welcome Section */}
      <div className='mb-8'>
        <h1 className='mb-2 text-xl text-gray-900 dark:text-white sm:text-2xl lg:text-3xl'>
          Welcome back, Giorgi! 👋
        </h1>
        <p className='text-sm text-gray-600 dark:text-gray-400 sm:text-base'>
          You have {userData.tokens} tokens available. Each token = 1 lesson.
        </p>
      </div>
      {/* Stats Grid */}
      <div className='grid grid-cols-2 gap-3 mb-8 lg:grid-cols-4 sm:gap-4'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isTokens = stat.label === 'Available Tokens';
          return (
            <div
              key={stat.label}
              className='p-4 transition-all bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/60'
            >
              <div className='flex items-center justify-between mb-3'>
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.color} flex items-center justify-center`}
                >
                  <Icon className='w-4 h-4 text-white sm:w-5 sm:h-5' />
                </div>
                {isTokens && (
                  <button
                    onClick={() => setShowTopUpModal(true)}
                    className='flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300'
                  >
                    <Plus className='w-3 h-3' />
                    <span className='hidden sm:inline'>Top up</span>
                  </button>
                )}
              </div>
              <h3 className='mb-1 text-xl text-gray-900 dark:text-white sm:text-2xl'>
                {stat.value}
              </h3>
              <p className='text-xs text-gray-600 sm:text-sm dark:text-gray-400'>
                {stat.label}
              </p>
            </div>
          );
        })}
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
              return (
                <div
                  key={lesson.id}
                  className='p-3 transition-all border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}
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
                        <span>{lesson.date}</span>
                        <span>•</span>
                        <Clock className='w-3 h-3' />
                        {/* <span>{lesson.time}</span> */}
                      </div>
                    </div>
                    <button className='px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-all flex items-center gap-1 flex-shrink-0'>
                      <Video className='w-3 h-3' />
                      <span className='hidden sm:inline'>Join</span>
                    </button>
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
        <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'>
          <h2 className='mb-4 text-lg text-gray-900 dark:text-white sm:text-xl'>
            Pending Requests
          </h2>
          <div className='mb-4 space-y-3'>
            {pendingRequests.map((lesson) => {
              const lessonDate = new Date(lesson.date * 1000);
              const isOn = cancelLessonId === lesson.id;
              return (
                <div
                  key={lesson.id}
                  className='p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${lesson.teacher ? 'bg-blue-500' : 'bg-gray-500'} `}
                    >
                      <span className='text-sm font-semibold text-white'>
                        {lesson.teacher
                          ? lesson.teacher.first_name.charAt(0).toUpperCase() +
                            lesson.teacher.last_name.charAt(0).toUpperCase()
                          : '?'}
                      </span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='mb-1 text-sm text-gray-900 dark:text-white sm:text-base'>
                        {lesson.teacher
                          ? `${lesson.teacher.first_name.charAt(0).toUpperCase()}${lesson.teacher.first_name.slice(1)} ${lesson.teacher.last_name.charAt(0).toUpperCase()}${lesson.teacher.last_name.slice(1)}`
                          : 'Any Available Teacher'}
                      </h4>
                      <p className='mb-2 text-xs text-gray-600 sm:text-sm dark:text-gray-400'>
                        {lesson.topic?.heading}
                      </p>
                      <div className='flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500'>
                        <Calendar className='w-3 h-3' />
                        <span>{lessonDate.toLocaleDateString()}</span>
                        <span>•</span>
                        <Clock className='w-3 h-3' />
                        <span>
                          {lessonDate.getHours()}:
                          {lessonDate.getMinutes() === 0
                            ? '00'
                            : lessonDate.getMinutes()}{' '}
                          - {lessonDate.getHours() + 1}:
                          {lessonDate.getMinutes() === 0
                            ? '00'
                            : lessonDate.getMinutes()}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center flex-shrink-0 gap-1'>
                      <AlertCircle className='w-4 h-4 text-orange-400' />
                    </div>
                  </div>
                  <div className='flex items-center justify-between pt-3 mt-3 border-t border-gray-200 dark:border-gray-700'>
                    {isOn && (
                      <CancelModal
                        lesson={lesson}
                        onClose={() => setCancelLessonId(null)}
                      />
                    )}
                    <p className='text-xs text-gray-500 dark:text-gray-500'>
                      {lesson.teacher
                        ? 'Waiting for teacher confirmation...'
                        : 'Waiting for any teacher to accept...'}
                    </p>
                    <button
                      onClick={() => setCancelLessonId(lesson.id)}
                      className='text-xs sm:text-sm px-3 py-1.5 bg-red-600/20 text-red-500 dark:text-red-400 border border-red-600/30 rounded hover:bg-red-600/30 transition-all'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className='p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/20'>
            <p className='text-xs text-blue-600 sm:text-sm dark:text-blue-400'>
              💡 Tip: Teachers usually respond within 24 hours. You'll receive a
              notification once they accept!
            </p>
          </div>
        </div>
      </div>

      {/* Favorite Teachers */}
      <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'>
        <h2 className='mb-4 text-lg text-gray-900 dark:text-white sm:text-xl'>
          Your Favorite Teachers
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          {favoriteTeachers.map((teacher) => (
            <div
              key={teacher.name}
              className='flex items-center gap-3 p-3 transition-all border border-gray-200 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              <div
                className={`w-12 h-12 rounded-full ${teacher.color} flex items-center justify-center flex-shrink-0`}
              >
                <span className='font-semibold text-white'>
                  {teacher.avatar}
                </span>
              </div>
              <div className='flex-1 min-w-0'>
                <h4 className='mb-1 text-sm text-gray-900 dark:text-white sm:text-base'>
                  {teacher.name}
                </h4>
                <p className='mb-1 text-xs text-gray-600 dark:text-gray-400'>
                  {teacher.specialty}
                </p>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <Star className='w-3 h-3 text-yellow-400 fill-yellow-400' />
                    <span className='text-xs text-gray-600 dark:text-gray-400'>
                      {teacher.rating}
                    </span>
                  </div>
                  <span className='text-xs text-gray-500'>•</span>
                  <span className='text-xs text-gray-500'>
                    {teacher.lessons} lessons
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
