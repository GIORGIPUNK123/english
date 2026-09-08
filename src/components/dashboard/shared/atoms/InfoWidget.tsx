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
import { getTokenBalances } from '../../../../utils/tokenUtils';
import { countUniqueLessonStudents } from '../../../../utils/lessonStudentUtils';
import { useLanguage } from '../../../../context/LanguageContext';

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
  totalStudents?: number;
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
    totalStudents,
  } = props;
  const safeRatingAverage =
    typeof ratingAverage === 'number' ? ratingAverage : 0;
  const safeRatingCount = typeof ratingCount === 'number' ? ratingCount : 0;
  const tokenBalances = getTokenBalances(userData);
  const { t } = useLanguage();

  const stats = [
    {
      id: 'tokens',
      label: t('dashboard.availableTokens'),
      value: tokenBalances.total,
      icon: Coins,
      color: 'bg-yellow-500',
    },
    {
      id: 'upcomingLessons',
      label: t('dashboard.upcomingLessons'),
      value: upcommingLessons ? upcommingLessons.length : 0,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      id: 'hoursCompleted',
      label: t('dashboard.hoursCompleted'),
      value: lessons
        ? lessons.filter((lesson) => lesson.status === 'finished').length
        : 0,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      id: 'completedLessons',
      label: t('dashboard.completedLessons'),
      value: lessons
        ? lessons.filter((lesson) => lesson.status === 'finished').length
        : 0,
      icon: Clock,
      color: 'bg-purple-500',
    },
    {
      id: 'pendingRequests',
      label: t('dashboard.pendingRequests'),
      value: pendingRequests ? pendingRequests.length : 0,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      id: 'availableLessons',
      label: t('dashboard.availableLessons'),
      value: availableLessons ? availableLessons.length : 0,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      id: 'totalStudents',
      label: t('dashboard.totalStudents'),
      value:
        typeof totalStudents === 'number'
          ? totalStudents
          : lessons
            ? countUniqueLessonStudents(lessons)
            : 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      id: 'averageRating',
      label: `${t('dashboard.avgRatingLabel')} (${safeRatingCount})`,
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
      className='p-4 transition-all border sm:p-6 bg-card border-border rounded-xl hover:bg-accent/40'
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
            className='flex items-center gap-1 text-xs text-blue-500 transition-colors dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300'
          >
            <Plus className='w-3 h-3' />
            <span className='hidden sm:inline'>Top up</span>
          </button>
        )}
      </div>
      <h3 className='mb-1 text-xl font-semibold text-foreground sm:text-2xl'>
        {stat.value}
      </h3>
      <p className='text-xs sm:text-sm text-muted-foreground'>
        {stat.label}
      </p>
      {stat.id === 'tokens' && (
        <p className='mt-1 text-[11px] text-muted-foreground'>
          {t('dashboard.tokenDetailsOneOnOne')}: {tokenBalances.oneOnOne} | {t('dashboard.tokenDetailsGroup')}: {tokenBalances.group} | {t('dashboard.tokenDetailsFlexible')}: {tokenBalances.legacy}
        </p>
      )}
    </div>
  );
};
