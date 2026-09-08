import { User } from 'firebase/auth';
import { Clock, Calendar, TrendingUp, RotateCw } from 'lucide-react';
import { useState } from 'react';
import { LessonT, UserDataT } from '../../../types';
import { InfoWidget } from '../shared/atoms/InfoWidget';
import { TipWidget } from '../shared/atoms/TipWidget';
import { PerformanceOverview } from './PerformanceOverview';
import { LessonDetailModal } from '../../calendar/LessonDetailModal';
import { useLanguage } from '../../../context/LanguageContext';
import { countUniqueLessonStudents } from '../../../utils/lessonStudentUtils';
import { useTeacherRatingAverage } from '../../../hooks/useTeacherRatingAverage';

interface TeacherDashboardViewProps {
  user: User;
  userData: UserDataT;
  lessons: LessonT[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TeacherDashboardView = ({
  user,
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
  const myTeachingLessons = lessons.filter((lesson) =>
    teachingClassIds.has(lesson.id),
  );
  const { t } = useLanguage();

  const totalStudents = countUniqueLessonStudents(myTeachingLessons);
  const { average: ratingAverage, count: ratingCount } = useTeacherRatingAverage(
    {
      enabled: true,
      refetchWhenKey: `${myTeachingLessons.length}-${isRefreshing ? '1' : '0'}`,
    },
  );
  return (
    <div className='h-full overflow-y-auto'>
      {/* Welcome Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between gap-3 mb-2'>
          <h1 className='text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl'>
            {t('dashboard.welcomeTeacher')}, {capitalNames[0]}
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
              {isRefreshing ? t('dashboard.refreshing') : t('dashboard.refresh')}
            </span>
          </button>
        </div>
        <TipWidget
          tip={`${t('dashboard.welcomeTeacher')}! You have ${upcomingLessons.length} upcoming lessons and ${completedLessons.length} completed.`}
        />
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 gap-3 mb-8 lg:grid-cols-4 sm:gap-4'>
        <InfoWidget
          type='totalStudents'
          userData={userData}
          lessons={myTeachingLessons}
          totalStudents={totalStudents}
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
        <div className='p-4 border sm:p-6 bg-card border-border rounded-xl'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-foreground sm:text-xl'>
              {t('dashboard.todaySchedule')}
            </h2>
            <button className='text-xs text-blue-500 transition-all sm:text-sm dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300'>
              {t('dashboard.viewAll')}
            </button>
          </div>
          <div className='space-y-3'>
            {upcomingLessons.length > 0 ? (
              upcomingLessons.slice(0, 5).map((lesson) => {
                const lessonDate = new Date(lesson.date * 1000);
                return (
                  <div
                    key={lesson.id}
                    className='p-3 transition-all border rounded-lg cursor-pointer bg-muted/40 border-border hover:bg-accent/50'
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <div className='flex items-start gap-3'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='mb-1 text-sm font-medium text-foreground sm:text-base'>
                          {lesson.topic?.heading || t('calendar.untitledLesson')}
                        </h4>
                        <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
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
                      <span className='px-2 py-1 text-xs font-medium text-blue-700 rounded-lg bg-blue-500/15 dark:text-blue-300'>
                        {t('calendar.scheduledLesson')}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='py-8 text-center text-muted-foreground'>
                <Calendar className='w-12 h-12 mx-auto mb-2 opacity-50' />
                <p className='text-sm'>{t('dashboard.noUpcomingLessons')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className='p-4 border sm:p-6 bg-card border-border rounded-xl'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-foreground sm:text-xl'>
              {t('dashboard.recentActivity')}
            </h2>
          </div>
          <div className='space-y-3'>
            {completedLessons.length > 0 ? (
              completedLessons.slice(0, 5).map((lesson) => {
                const lessonDate = new Date(lesson.date * 1000);
                return (
                  <div
                    key={lesson.id}
                    className='p-3 transition-all border rounded-lg bg-muted/40 border-border'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='mb-1 text-sm font-medium text-foreground sm:text-base'>
                          {lesson.topic?.heading || t('calendar.untitledLesson')}
                        </h4>
                        <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                          <Calendar className='w-3 h-3' />
                          <span>{lessonDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className='px-2 py-1 text-xs font-medium text-green-700 rounded-lg bg-green-500/15 dark:text-green-300'>
                        {t('calendar.finished')}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='py-8 text-center text-muted-foreground'>
                <TrendingUp className='w-12 h-12 mx-auto mb-2 opacity-50' />
                <p className='text-sm'>{t('dashboard.noRecentActivity')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <PerformanceOverview
        lessons={myTeachingLessons}
        totalStudents={totalStudents}
        ratingAverage={ratingAverage}
        ratingCount={ratingCount}
      />

      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          setRescheduleLesson={() => {}}
          setScheduleModalIsOpen={() => {}}
          setScheduleTime={() => {}}
          assignedToMe={teachingClassIds.has(selectedLesson.id)}
          userId={user.uid}
        />
      )}
    </div>
  );
};
