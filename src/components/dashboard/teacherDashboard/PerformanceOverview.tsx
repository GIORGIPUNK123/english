import { Star, TrendingUp, Users } from 'lucide-react';
import { LessonT } from '../../../types';

export const PerformanceOverview = (props: {
  lessons: LessonT[];
  totalStudents: number;
}) => {
  const { lessons, totalStudents } = props;
  const finishedLessons = lessons.filter(
    (lesson) => lesson.status === 'finished',
  );
  return (
    <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg text-gray-900 dark:text-white sm:text-xl'>
          Performance Overview
        </h2>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60'>
          <div className='flex items-center gap-3 mb-2'>
            <Star className='w-5 h-5 text-yellow-500' />
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Average Rating
            </p>
          </div>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>
            4.8
          </p>
        </div>
        <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60'>
          <div className='flex items-center gap-3 mb-2'>
            <TrendingUp className='w-5 h-5 text-green-500' />
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Completion Rate
            </p>
          </div>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>
            {lessons.length > 0
              ? Math.round((finishedLessons.length / lessons.length) * 100)
              : 0}
            %
          </p>
        </div>
        <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60'>
          <div className='flex items-center gap-3 mb-2'>
            <Users className='w-5 h-5 text-blue-500' />
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Active Students
            </p>
          </div>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>
            {totalStudents}
          </p>
        </div>
      </div>
    </div>
  );
};
