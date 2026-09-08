import { useLanguage } from '../../context/LanguageContext';

export function CalendarLegend({
  variant = 'student',
}: {
  variant?: 'student' | 'teacher';
}) {
  const { t } = useLanguage();

  const items =
    variant === 'teacher'
      ? [
          { color: 'bg-orange-500', label: t('calendar.openTeacherAccept') },
          { color: 'bg-blue-500', label: t('calendar.joined') },
          { color: 'bg-indigo-600', label: t('calendar.openGroupAccept') },
        ]
      : [
          { color: 'bg-blue-500', label: t('calendar.oneOnOneLesson') },
          { color: 'bg-green-500', label: t('calendar.groupClass') },
          { color: 'bg-orange-500', label: t('dashboard.pendingRequests') },
          { color: 'bg-indigo-600', label: t('calendar.openGroupAccept') },
        ];

  return (
    <div className='flex flex-wrap items-center gap-3 mb-4'>
      {items.map((item) => (
        <div key={item.label} className='flex items-center gap-2'>
          <div className={`w-3 h-3 rounded ${item.color}`} />
          <span className='text-xs text-muted-foreground'>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
