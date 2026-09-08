import { Star, TrendingUp, Users } from 'lucide-react';
import { LessonT } from '../../../types';

export const PerformanceOverview = (props: {
  lessons: LessonT[];
  totalStudents: number;
  ratingAverage?: number;
  ratingCount?: number;
}) => {
  const {
    lessons,
    totalStudents,
    ratingAverage = 0,
    ratingCount = 0,
  } = props;
  const finishedLessons = lessons.filter(
    (lesson) => lesson.status === 'finished',
  );
  const hasRatings = ratingCount > 0;

  return (
    <div className='p-4 border sm:p-6 bg-card border-border rounded-xl'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-foreground sm:text-xl'>
          Performance Overview
        </h2>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='p-4 border rounded-lg bg-muted/40 border-border'>
          <div className='flex items-center gap-3 mb-2'>
            <Star className='w-5 h-5 text-yellow-500' />
            <p className='text-sm text-muted-foreground'>Average Rating</p>
          </div>
          <p className='text-2xl font-bold text-foreground'>
            {hasRatings ? ratingAverage.toFixed(1) : '—'}
          </p>
          <p className='mt-1 text-xs text-muted-foreground'>
            {hasRatings
              ? `Based on ${ratingCount} student rating${ratingCount === 1 ? '' : 's'}`
              : 'Available after students rate your lessons'}
          </p>
        </div>
        <div className='p-4 border rounded-lg bg-muted/40 border-border'>
          <div className='flex items-center gap-3 mb-2'>
            <TrendingUp className='w-5 h-5 text-green-500' />
            <p className='text-sm text-muted-foreground'>Completion Rate</p>
          </div>
          <p className='text-2xl font-bold text-foreground'>
            {lessons.length > 0
              ? Math.round((finishedLessons.length / lessons.length) * 100)
              : 0}
            %
          </p>
        </div>
        <div className='p-4 border rounded-lg bg-muted/40 border-border'>
          <div className='flex items-center gap-3 mb-2'>
            <Users className='w-5 h-5 text-blue-500' />
            <p className='text-sm text-muted-foreground'>Active Students</p>
          </div>
          <p className='text-2xl font-bold text-foreground'>{totalStudents}</p>
        </div>
      </div>
    </div>
  );
};
