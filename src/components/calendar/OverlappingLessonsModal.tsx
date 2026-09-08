import { Clock, User, Users, X } from 'lucide-react';
import { LessonT } from '../../types';
import { formatDate, formatTime, getLessonColor } from './utils';

interface OverlappingLessonsModalProps {
  lessons: LessonT[];
  slotDate: Date;
  onClose: () => void;
  onLessonClick: (lesson: LessonT) => void;
  teacherView?: boolean;
}

export function OverlappingLessonsModal({
  lessons,
  slotDate,
  onClose,
  onLessonClick,
  teacherView = false,
}: OverlappingLessonsModalProps) {
  const sortedLessons = [...lessons].sort((a, b) => a.date - b.date);
  const slotStartTimestamp = Math.floor(slotDate.getTime() / 1000);

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div
        className='w-full max-w-2xl modal-panel'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='modal-header'>
          <button onClick={onClose} className='modal-close'>
            <X className='w-5 h-5' />
          </button>
          <h2 className='pr-10 text-2xl font-semibold text-foreground'>
            {sortedLessons.length} classes in this slot
          </h2>
          <div className='mt-2 text-sm text-muted-foreground'>
            {formatDate(slotStartTimestamp)}
          </div>
          <div className='text-sm text-muted-foreground'>
            {formatTime(slotStartTimestamp)} -{' '}
            {formatTime(slotStartTimestamp + 3600)}
          </div>
        </div>

        <div className='p-6 space-y-3 overflow-y-auto max-h-[60vh]'>
          {sortedLessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => onLessonClick(lesson)}
              className='w-full p-4 text-left border rounded-lg bg-muted/40 border-border hover:border-brand/40 hover:bg-brand-muted'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='font-medium text-foreground'>
                    {lesson.topic?.heading || 'Untitled lesson'}
                  </div>
                  <div className='flex items-center gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400'>
                    <Clock className='w-3 h-3' />
                    <span>
                      {formatTime(lesson.date)} -{' '}
                      {formatTime(lesson.date + 3600)}
                    </span>
                  </div>
                </div>
                <span
                  className={`w-3 h-3 rounded-full shrink-0 mt-1 ${getLessonColor(lesson)}`}
                ></span>
              </div>

              <div className='flex items-center gap-2 mt-3 text-sm text-gray-700 dark:text-gray-300'>
                <User className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                <span>
                  {lesson.teacher
                    ? `${lesson.teacher.first_name} ${lesson.teacher.last_name}`
                    : teacherView
                      ? 'Open request - tap to accept'
                      : 'Not assigned yet'}
                </span>
              </div>

              {lesson.lessonType === 'group' && (
                <div className='flex items-center gap-2 mt-2 text-sm text-gray-700 dark:text-gray-300'>
                  <Users className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                  <span>
                    {lesson.participantCount}/{lesson.maxParticipants} joined
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
