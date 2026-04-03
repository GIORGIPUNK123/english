import {
  AlertCircle,
  Calendar,
  Clock,
  Coins,
  Plus,
  Star,
  Users,
} from 'lucide-react';
import { LessonT, UserDataT } from '../../../../types';

export const InfoWidget = (props: {
  type:
    | 'tokens'
    | 'upcomingLessons'
    | 'hoursCompleted'
    | 'pendingRequests'
    | 'availableLessons'
    | 'totalStudents'
    | 'completedLessons'
    | 'averageRating';
  userData: UserDataT;
  setShowTopUpModal?: (show: boolean) => void;
  lessons?: LessonT[];
  upcommingLessons?: LessonT[];
  pendingRequests?: LessonT[];
  availableLessons?: LessonT[];
  ratingAverage?: number;
  ratingCount?: number;
}) => {
  const {
    type,
    userData,
    setShowTopUpModal,
    lessons,
    upcommingLessons,
    pendingRequests,
    availableLessons,
    ratingAverage,
    ratingCount,
  } = props;
  const safeRatingAverage =
    typeof ratingAverage === 'number' ? ratingAverage : 0;
  const safeRatingCount = typeof ratingCount === 'number' ? ratingCount : 0;
  const stats = [
    {
      id: 'tokens',
      label: 'Available Tokens',
      value: userData.tokens,
      icon: Coins,
      color: 'bg-yellow-500',
    },
    {
      id: 'upcomingLessons',
      label: 'Upcoming Lessons',
      value: upcommingLessons ? upcommingLessons.length : 0,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      id: 'hoursCompleted',
      label: 'Hours Completed',
      value: lessons
        ? lessons.filter((lesson) => lesson.status === 'finished').length
        : 0,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      id: 'completedLessons',
      label: 'Completed',
      value: lessons
        ? lessons.filter((lesson) => lesson.status === 'finished').length
        : 0,
      icon: Clock,
      color: 'bg-purple-500',
    },
    {
      id: 'pendingRequests',
      label: 'Pending Requests',
      value: pendingRequests ? pendingRequests.length : 0,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      id: 'availableLessons',
      label: 'Available Lessons',
      value: availableLessons ? availableLessons.length : 0,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      id: 'totalStudents',
      label: 'Total Students',
      value: lessons ? new Set(lessons.map((lesson) => lesson.id)).size : 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      id: 'averageRating',
      label: `Avg Rating (${safeRatingCount})`,
      value: safeRatingAverage.toFixed(1),
      icon: Star,
      color: 'bg-indigo-500',
    },
  ];
  const stat = stats.find((s) => s.id === type);

  if (!stat) return null;
  return (
    <div
      key={stat.label}
      className='p-4 transition-all bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/60'
    >
      <div className='flex items-center justify-between mb-3'>
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.color} flex items-center justify-center`}
        >
          <stat.icon className='w-4 h-4 text-white sm:w-5 sm:h-5' />
        </div>
        {stat.id === 'tokens' && (
          <button
            onClick={() => setShowTopUpModal && setShowTopUpModal(true)}
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
};
