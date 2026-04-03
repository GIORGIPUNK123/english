import { AlertCircle, Calendar, Clock, UserIcon } from 'lucide-react';
import { TipWidget } from '../shared/atoms/TipWidget';
import { LessonT } from '../../../types';

export const PendingRequests = (props: {
  pendingRequests: LessonT[];
  setSelectedLesson: (lesson: LessonT) => void;
}) => {
  const { pendingRequests, setSelectedLesson } = props;
  return (
    <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'>
      <h2 className='mb-4 text-lg text-gray-900 dark:text-white sm:text-xl'>
        Pending Requests
      </h2>
      <div className='mb-4 space-y-3'>
        {pendingRequests.map((lesson) => {
          const lessonDate = new Date(lesson.date * 1000);
          return (
            <div
              key={lesson.id}
              className='p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'
            >
              <div className='flex items-start gap-3'>
                <div
                  className={`w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 ${lesson.teacher ? 'bg-blue-500' : 'bg-gray-500'} `}
                >
                  <span className='text-sm font-semibold text-white'>
                    {lesson.teacher ? (
                      lesson.teacher.first_name.charAt(0).toUpperCase() +
                      lesson.teacher.last_name.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon />
                    )}
                  </span>
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='mb-1 text-sm text-gray-900 dark:text-white sm:text-base'>
                    {lesson.teacher
                      ? `${lesson.teacher.first_name.charAt(0).toUpperCase()}${lesson.teacher.first_name.slice(1)} ${lesson.teacher.last_name.charAt(0).toUpperCase()}${lesson.teacher.last_name.slice(1)}`
                      : 'Any Available Teacher'}
                  </h4>
                  <p className='mb-2 text-xs text-gray-600 sm:text-sm dark:text-gray-400'>
                    {lesson.topic?.heading}
                  </p>
                  <div className='flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-500'>
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
                <div className='flex items-center shrink-0 gap-1'>
                  <AlertCircle className='w-4 h-4 text-orange-400' />
                </div>
              </div>
              <div className='flex items-center justify-between pt-3 mt-3 border-t border-gray-200 dark:border-gray-700'>
                <p className='text-xs text-gray-500 dark:text-gray-500'>
                  {lesson.teacher
                    ? 'Waiting for teacher confirmation...'
                    : 'Waiting for any teacher to accept...'}
                </p>
                <button
                  onClick={() => setSelectedLesson(lesson)}
                  className='text-xs sm:text-sm px-3 py-1.5 bg-blue-600/20 text-blue-500 dark:text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600/30 transition-all'
                >
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <TipWidget
        tip={`💡 Tip: Teachers usually respond within 24 hours. You'll receive a notification once they accept!`}
      />
    </div>
  );
};
