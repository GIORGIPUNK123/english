import { Clock, Calendar, TrendingUp, RotateCw } from 'lucide-react';
import { useState } from 'react';
import { LessonT, UserDataT } from '../../../types';
import { InfoWidget } from '../shared/atoms/InfoWidget';
import { TipWidget } from '../shared/atoms/TipWidget';
import { PerformanceOverview } from './PerformanceOverview';
import { LessonDetailModal } from '../../calendar/LessonDetailModal';

interface TeacherDashboardViewProps {
  userData: UserDataT;
  lessons: LessonT[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TeacherDashboardView = ({
  userData,
  lessons,
  onRefresh,
  isRefreshing = false,
}: TeacherDashboardViewProps) => {
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

  const completedLessons = lessons.filter(
    (lesson) => lesson.status === 'finished',
  );
  const teachingClassIds = new Set(userData.teaching_classes || []);

  const totalStudents = new Set(lessons.map((lesson) => lesson.id)).size;
  console.log('lessons: ', lessons);
  return (
    <div className='h-full overflow-y-auto'>
      {/* Welcome Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between gap-3 mb-2'>
          <h1 className='text-xl text-gray-900 dark:text-white sm:text-2xl lg:text-3xl'>
            Welcome back, {capitalNames[0]}! 👨‍🏫
          </h1>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-all bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            <RotateCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className='hidden sm:inline'>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
        <TipWidget
          tip={`You're in Teacher Mode. You have ${upcomingLessons.length} upcoming lessons and ${completedLessons.length} completed.`}
        />
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 gap-3 mb-8 lg:grid-cols-4 sm:gap-4'>
        <InfoWidget
          type='totalStudents'
          userData={userData}
          lessons={lessons}
        />
        <InfoWidget
          type='upcomingLessons'
          userData={userData}
          lessons={lessons}
          upcommingLessons={upcomingLessons}
        />
        <InfoWidget
          type='completedLessons'
          userData={userData}
          lessons={lessons}
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
              Today's Schedule
            </h2>
            <button className='text-xs text-blue-500 transition-all sm:text-sm dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300'>
              View All
            </button>
          </div>
          <div className='space-y-3'>
            {upcomingLessons.length > 0 ? (
              upcomingLessons.slice(0, 5).map((lesson) => {
                const lessonDate = new Date(lesson.date * 1000);
                return (
                  <div
                    key={lesson.id}
                    className='p-3 transition-all border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <div className='flex items-start gap-3'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='mb-1 text-sm font-medium text-gray-900 dark:text-white sm:text-base'>
                          {lesson.topic?.heading || 'Untitled Lesson'}
                        </h4>
                        <div className='flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500'>
                          <Calendar className='w-3 h-3' />
                          <span>{lessonDate.toLocaleDateString()}</span>
                          <span>•</span>
                          <Clock className='w-3 h-3' />
                          <span>
                            {lessonDate.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <span className='px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded dark:bg-blue-900/30 dark:text-blue-300'>
                        Scheduled
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='py-8 text-center text-gray-500 dark:text-gray-400'>
                <Calendar className='w-12 h-12 mx-auto mb-2 opacity-50' />
                <p className='text-sm'>No upcoming lessons</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg text-gray-900 dark:text-white sm:text-xl'>
              Recent Activity
            </h2>
          </div>
          <div className='space-y-3'>
            {completedLessons.length > 0 ? (
              completedLessons.slice(0, 5).map((lesson) => {
                const lessonDate = new Date(lesson.date * 1000);
                return (
                  <div
                    key={lesson.id}
                    className='p-3 transition-all border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='mb-1 text-sm font-medium text-gray-900 dark:text-white sm:text-base'>
                          {lesson.topic?.heading || 'Untitled Lesson'}
                        </h4>
                        <div className='flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500'>
                          <Calendar className='w-3 h-3' />
                          <span>{lessonDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className='px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded dark:bg-green-900/30 dark:text-green-300'>
                        Completed
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='py-8 text-center text-gray-500 dark:text-gray-400'>
                <TrendingUp className='w-12 h-12 mx-auto mb-2 opacity-50' />
                <p className='text-sm'>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <PerformanceOverview lessons={lessons} totalStudents={totalStudents} />

      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          setRescheduleLesson={() => {}}
          setScheduleModalIsOpen={() => {}}
          setScheduleTime={() => {}}
          assignedToMe={teachingClassIds.has(selectedLesson.id)}
        />
      )}
    </div>
  );
};
