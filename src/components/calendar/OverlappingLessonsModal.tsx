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
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='w-full max-w-2xl bg-white border border-gray-200 shadow-2xl dark:bg-gray-800 dark:border-gray-700 rounded-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='relative p-6 bg-indigo-600 rounded-t-xl'>
          <button
            onClick={onClose}
            className='absolute p-2 transition-all rounded-lg top-4 right-4 hover:bg-white/10'
          >
            <X className='w-5 h-5 text-white' />
          </button>
          <h2 className='pr-10 text-2xl font-semibold text-white'>
            {sortedLessons.length} classes in this slot
          </h2>
          <div className='mt-2 text-sm text-white/90'>
            {formatDate(slotStartTimestamp)}
          </div>
          <div className='text-sm text-white/90'>
            {formatTime(slotStartTimestamp)} -{' '}
            {formatTime(slotStartTimestamp + 3600)}
          </div>
        </div>

        <div className='p-6 space-y-3 overflow-y-auto max-h-[60vh]'>
          {sortedLessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => onLessonClick(lesson)}
              className='w-full p-4 text-left transition-all border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-indigo-900/20'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='font-medium text-gray-900 dark:text-white'>
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
