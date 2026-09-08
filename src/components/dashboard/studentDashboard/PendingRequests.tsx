import { AlertCircle, Calendar, Clock, UserIcon } from 'lucide-react';
import { TipWidget } from '../shared/atoms/TipWidget';
import { useLanguage } from '../../../context/LanguageContext';
import { LessonT } from '../../../types';

export const PendingRequests = (props: {
  pendingRequests: LessonT[];
  setSelectedLesson: (lesson: LessonT) => void;
}) => {
  const { pendingRequests, setSelectedLesson } = props;
  const { t } = useLanguage();
  return (
    <div className='p-4 border sm:p-6 bg-card border-border rounded-xl'>
      <h2 className='mb-4 text-lg font-semibold text-foreground sm:text-xl'>
        {t('dashboard.pendingRequests')}
      </h2>
      <div className='mb-4 space-y-3'>
        {pendingRequests.map((lesson) => {
          const lessonDate = new Date(lesson.date * 1000);
          return (
            <div
              key={lesson.id}
              className='p-3 border rounded-lg bg-muted/40 border-border'
            >
              <div className='flex items-start gap-3'>
                <div className='flex items-center justify-center w-10 h-10 rounded-lg shrink-0 brand-mark'>
                  <span className='text-sm font-semibold text-white'>
                    {lesson.teacher ? (
                      lesson.teacher.first_name.charAt(0).toUpperCase() +
                      lesson.teacher.last_name.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className='w-4 h-4' />
                    )}
                  </span>
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='mb-1 text-sm font-medium text-foreground sm:text-base'>
                    {lesson.teacher
                      ? `${lesson.teacher.first_name.charAt(0).toUpperCase()}${lesson.teacher.first_name.slice(1)} ${lesson.teacher.last_name.charAt(0).toUpperCase()}${lesson.teacher.last_name.slice(1)}`
                      : t('dashboard.pendingAnyAvailableTeacher')}
                  </h4>
                  <p className='mb-2 text-xs sm:text-sm text-muted-foreground'>
                    {lesson.topic?.heading}
                  </p>
                  <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
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
                <div className='flex items-center gap-1 shrink-0'>
                  <AlertCircle className='w-4 h-4 text-orange-400' />
                </div>
              </div>
              <div className='flex items-center justify-between pt-3 mt-3 border-t border-border'>
                <p className='text-xs text-muted-foreground'>
                  {lesson.teacher
                    ? t('dashboard.waitingForTeacherConfirmation')
                    : t('dashboard.waitingForAnyTeacher')}
                </p>
                <button
                  onClick={() => setSelectedLesson(lesson)}
                  className='text-xs sm:text-sm px-3 py-1.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/25 transition-all'
                >
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <TipWidget tip={t('dashboard.teacherTip')} />
    </div>
  );
};
