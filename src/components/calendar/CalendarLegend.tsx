import { useLanguage } from '../../context/LanguageContext';

export function CalendarLegend({
  variant = 'student',
}: {
  variant?: 'student' | 'teacher';
}) {
  const { t } = useLanguage();

  if (variant === 'teacher') {
    return (
      <div className='flex flex-wrap items-center gap-3 mb-4'>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 bg-orange-500 rounded'></div>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            {t('calendar.openTeacherAccept')}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 bg-blue-500 rounded'></div>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            {t('calendar.joined')}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 bg-indigo-600 rounded'></div>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            {t('calendar.openGroupAccept')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-wrap items-center gap-3 mb-4'>
      <div className='flex items-center gap-2'>
        <div className='w-3 h-3 bg-blue-500 rounded'></div>
        <span className='text-xs text-gray-400'>{t('calendar.oneOnOneLesson')}</span>
      </div>
      <div className='flex items-center gap-2'>
        <div className='w-3 h-3 bg-green-500 rounded'></div>
        <span className='text-xs text-gray-400'>{t('calendar.groupClass')}</span>
      </div>
      <div className='flex items-center gap-2'>
        <div className='w-3 h-3 bg-orange-500 rounded'></div>
        <span className='text-xs text-gray-400'>{t('dashboard.pendingRequests')}</span>
      </div>
      <div className='flex items-center gap-2'>
        <div className='w-3 h-3 bg-indigo-600 rounded'></div>
        <span className='text-xs text-gray-400'>
          {t('calendar.openGroupAccept')}
        </span>
      </div>
    </div>
  );
}
