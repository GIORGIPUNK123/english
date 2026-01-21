import { X, Clock, AlertTriangle } from 'lucide-react';
import { LessonT } from '../../types';
import { formatTime } from './utils';
import { auth, db, functions } from '../../firebase/firebase-config';
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { useState } from 'react';
import { useGenerateId } from '../../hooks/useGenerateRandomId';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '../../context/ToastContext';

interface LessonDetailModalProps {
  lesson: LessonT;
  onClose: () => void;
  additionalCallback?: () => void;
}

export const CancelModal = ({
  lesson,
  onClose,
  additionalCallback,
}: LessonDetailModalProps) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isWithin48Hours = (() => {
    const now = Date.now();
    const lessonTime = lesson.date * 1000;
    const diffInMs = lessonTime - now;
    return diffInMs <= 48 * 60 * 60 * 1000;
  })();
  const { addToast } = useToast();
  const canCancel = () => {
    const classId = lesson.id;
    if (lesson.teacher) {
      if (isWithin48Hours) {
        setErrorMsg('Cannot cancel class within 48 hours');
        return false;
      }
    }
    if (!classId || !auth.currentUser?.uid) {
      setErrorMsg('Missing class id or user Id, cannot delete');
      return false;
    }
    setErrorMsg(null); // Clear error message if cancellation is possible
    return true;
  };
  const handleCancel = async () => {
    try {
      if (!canCancel()) return; // Check if cancellation is possible

      const classId = lesson.id;

      if (lesson.teacher && isWithin48Hours) {
        setErrorMsg('Cannot cancel class within 48 hours');
        return;
      }

      if (!classId || !auth.currentUser?.uid) {
        setErrorMsg('Missing class id or user Id, cannot cancel');
        return;
      }

      // Call the Cloud Function
      const cancelFn = httpsCallable<{ classId: string }, { success: boolean }>(
        functions,
        'cancelLesson',
      );

      const res = await cancelFn({ classId });

      if (res.data.success) {
        addToast({
          title: 'Class Cancelled',
          message: 'The class has been successfully cancelled.',
          type: 'success',
        });
        onClose();
        if (additionalCallback) additionalCallback();
      } else {
        setErrorMsg('Failed to cancel class');
      }
    } catch (error: any) {
      console.error('Error cancelling class: ', error);
      setErrorMsg(error?.message || 'Error cancelling class');
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='w-full max-w-lg transition-all transform bg-white border border-gray-200 shadow-2xl dark:bg-gray-800 dark:border-gray-700 rounded-xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className='relative p-6 bg-red-500 dark:bg-red-500 rounded-t-xl'>
          <button
            onClick={onClose}
            className='absolute p-2 transition-all rounded-lg top-4 right-4 hover:bg-white/10 dark:hover:bg-black/10'
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
          {/* Warning Message */}
          <div className='flex items-start gap-3 p-4 border border-red-200 rounded-lg bg-orange-50 dark:bg-red-900/20 dark:border-red-800/50'>
            <AlertTriangle className='w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5' />
            <div>
              <p className='mb-1 font-medium text-gray-900 dark:text-white'>
                Cancel this lesson?
              </p>
              <p className='text-sm text-gray-700 dark:text-gray-300'>
                {lesson.teacher && !isWithin48Hours
                  ? 'Your token will be refunded to your account.'
                  : !lesson.teacher
                    ? 'This will cancel your pending lesson request and refund your token.'
                    : 'You cannot cancel this lesson as it is within 48 hours of the scheduled time.'}
              </p>
            </div>
          </div>
          {/* Error Message */}
          {errorMsg && (
            <div className='flex items-start gap-2 p-3 bg-red-100 border border-red-300 rounded-lg dark:bg-red-900/30 dark:border-red-700'>
              <AlertTriangle className='w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5' />
              <p className='text-sm text-red-700 dark:text-red-300'>
                {errorMsg}
              </p>
            </div>
          )}
          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700'>
            <button
              onClick={onClose}
              className='px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Keep Lesson
            </button>
            <button
              onClick={handleCancel}
              disabled={!!lesson.teacher && !!isWithin48Hours}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                lesson.teacher && isWithin48Hours
                  ? 'bg-red-200 dark:bg-red-800/40 text-red-400 dark:text-red-500 cursor-not-allowed'
                  : 'bg-red-500 dark:bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600'
              }`}
            >
              Cancel Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
