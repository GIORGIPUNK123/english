import { X, Clock, MessageSquare } from 'lucide-react';
import { LessonT } from '../../types';
import { formatDate, formatTime } from './utils';
import { LessonFeedbackPanel } from './LessonFeedbackPanel';
import { useLessonStudentOptions } from '../../hooks/useLessonStudentOptions';
import { useLanguage } from '../../context/LanguageContext';

type StudentOption = {
  id: string;
  label: string;
};

interface LessonFeedbackModalProps {
  lesson: LessonT;
  userId: string;
  userMode: 'student' | 'teacher';
  assignedToMe: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const LessonFeedbackModal = ({
  lesson,
  userId,
  userMode,
  assignedToMe,
  onClose,
  onSubmitted,
}: LessonFeedbackModalProps) => {
  const { t } = useLanguage();
  const { options: studentOptions } = useLessonStudentOptions(lesson);

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div
        className='flex flex-col w-full max-w-2xl max-h-[90vh] modal-panel'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='modal-header'>
          <button
            onClick={onClose}
            className='modal-close top-3 right-3'
            aria-label={t('calendar.close')}
          >
            <X className='w-5 h-5' />
          </button>
          <div className='flex items-center gap-2 pr-10 text-muted-foreground'>
            <MessageSquare className='w-4 h-4' />
            <span className='text-xs font-medium tracking-wide uppercase'>
              {t('dashboard.feedback')}
            </span>
          </div>
          <h2 className='pr-10 mt-2 text-xl font-semibold text-foreground'>
            {lesson.topic?.heading || t('calendar.untitledLesson')}
          </h2>
          <div className='flex items-center gap-2 mt-2 text-sm text-muted-foreground'>
            <Clock className='w-4 h-4' />
            <span>
              {formatDate(lesson.date)} · {formatTime(lesson.date)} –{' '}
              {formatTime(lesson.date + 3600)}
            </span>
          </div>
          {lesson.teacher && (
            <p className='mt-1 text-sm text-muted-foreground'>
              {t('calendar.teacher')}: {lesson.teacher.first_name}{' '}
              {lesson.teacher.last_name}
            </p>
          )}
        </div>

        <div className='flex-1 p-5 overflow-y-auto'>
          <LessonFeedbackPanel
            lesson={lesson}
            userId={userId}
            userMode={userMode}
            assignedToMe={assignedToMe}
            studentOptions={studentOptions as StudentOption[]}
            onSubmitted={() => {
              onSubmitted?.();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};
