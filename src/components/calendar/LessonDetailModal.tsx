import { X, Clock, User, Video } from 'lucide-react';
import { LessonT } from '../../types';
import { getLessonColor, formatTime, formatDate } from './utils';
import { auth, db } from '../../firebase/firebase-config';
import {
  arrayRemove,
  deleteDoc,
  doc,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { CancelModal } from './CancelModal';
import { useState } from 'react';

interface LessonDetailModalProps {
  lesson: LessonT;
  onClose: () => void;
}

export const LessonDetailModal = ({
  lesson,
  onClose,
}: LessonDetailModalProps) => {
  const [isOn, setIsOn] = useState(false);
  return (
    <>
      {isOn && <CancelModal lesson={lesson} onClose={() => setIsOn(false)} />}
      <div
        className='fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      >
        <div
          className='w-full max-w-lg bg-gray-800 border border-gray-700 shadow-2xl rounded-xl'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div
            className={`${getLessonColor(lesson)} p-6 rounded-t-xl relative`}
          >
            <button
              onClick={onClose}
              className='absolute p-2 transition-all rounded-lg top-4 right-4 hover:bg-white/10'
            >
              <X className='w-5 h-5 text-white' />
            </button>
            <h2 className='pr-10 text-2xl font-semibold text-white'>
              {lesson.topic?.heading}
            </h2>
            <div className='flex items-center gap-2 mt-2 text-white/90'>
              <Clock className='w-4 h-4' />
              <span>
                {formatTime(lesson.date)} - {formatTime(lesson.date + 3600)}
              </span>
            </div>
          </div>

          {/* Modal Body */}
          <div className='p-6 space-y-4'>
            {/* Teacher Info */}
            <div className='flex items-center gap-3 p-4 border border-gray-700 rounded-lg bg-gray-700/40'>
              <div className='flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500'>
                <User className='w-6 h-6 text-white' />
              </div>
              <div>
                <div className='text-xs text-gray-400'>Teacher</div>
                <div className='font-medium text-white'>
                  {lesson.teacher
                    ? `${lesson.teacher.first_name} ${lesson.teacher.last_name}`
                    : 'Not assigned'}
                </div>
              </div>
            </div>

            {/* Lesson Type */}
            <div className='flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-700/40'>
              <div className='text-sm text-gray-400'>Lesson Type</div>
              <div className='font-medium text-white capitalize'>
                {lesson.status === 'scheduled' && 'Scheduled Lesson'}
                {lesson.status === 'in-progress' && 'In Progress'}
                {lesson.status === 'finished' && 'Finished'}
                {lesson.status === 'missed_student' && 'Missed by Student'}
                {lesson.status === 'missed_teacher' && 'Missed by Teacher'}
                {lesson.status === 'cancelled_student' &&
                  'Cancelled by Student'}
                {lesson.status === 'cancelled_teacher' &&
                  'Cancelled by Teacher'}
              </div>
            </div>

            {/* Date */}
            <div className='flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-700/40'>
              <div className='text-sm text-gray-400'>Date</div>
              <div className='font-medium text-white'>
                {formatDate(lesson.date)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 pt-2'>
              <button
                className={` ${lesson.link ? 'bg-blue-600 hover:bg-blue-700' : 'disabled cursor-not-allowed bg-gray-900/60 hover:bg-gray-900/80'} flex items-center justify-center flex-1 gap-2 px-4 py-3 text-white transition-all rounded-lg`}
              >
                <Video className='w-4 h-4' />
                Join Lesson
              </button>
              <button
                className={` ${lesson.teacher ? 'disabled cursor-not-allowed bg-gray-900/60 hover:bg-gray-900/80' : ''} px-4 py-3 text-white transition-all bg-gray-700 rounded-lg hover:bg-gray-600`}
              >
                Reschedule
              </button>
              <button
                onClick={() => setIsOn(true)}
                className={` ${lesson.teacher ? 'disabled cursor-not-allowed' : ''} px-4 py-3 text-red-400 transition-all border rounded-lg bg-red-600/20 hover:bg-red-600/30 border-red-600/30`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
