import { X, Clock, AlertTriangle } from 'lucide-react';
import { LessonT } from '../../types';
import { formatTime } from './utils';
import { getErrorMessage } from '../../utils/firebaseErrorUtils';
import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../../firebase/firebase-config';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const isWithin24Hours = (() => {
    const now = Date.now();
    const lessonTime = lesson.date * 1000;
    const diffInMs = lessonTime - now;
    return diffInMs < 24 * 60 * 60 * 1000;
  })();
  const { addToast } = useToast();
  const canCancel = () => {
    const classId = lesson.id;
    if (!classId || !auth.currentUser?.uid) {
      setErrorMsg(t('cancelLesson.missingIds'));
      return false;
    }
    setErrorMsg(null); // Clear error message if cancellation is possible
    return true;
  };
  const handleCancel = async () => {
    if (isCancelling) return;

    try {
      if (!canCancel()) return;

      setIsCancelling(true);
      const classId = lesson.id;

      if (!classId || !auth.currentUser?.uid) {
        setErrorMsg(t('cancelLesson.missingIds'));
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
          title: t('cancelLesson.successTitle'),
          message: t('cancelLesson.successMessage'),
          type: 'success',
        });
        onClose();
        if (additionalCallback) additionalCallback();
      } else {
        setErrorMsg(t('cancelLesson.failed'));
      }
    } catch (error: unknown) {
      console.error('Error cancelling class: ', error);
      setErrorMsg(getErrorMessage(error, t('cancelLesson.errorGeneric')));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className='modal-overlay z-[60]' onClick={onClose}>
      <div
        className='w-full max-w-lg modal-panel'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='modal-header'>
          <button onClick={onClose} className='modal-close'>
            <X className='w-5 h-5' />
          </button>
          <h2 className='pr-10 text-2xl font-semibold text-foreground'>
            {lesson.topic?.heading}
          </h2>
          <div className='flex items-center gap-2 mt-2 text-muted-foreground'>
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
            <AlertTriangle className='w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5' />
            <div>
              <p className='mb-1 font-medium text-foreground'>
                {t('cancelLesson.confirmTitle')}
              </p>
              <p className='text-sm text-gray-700 dark:text-gray-300'>
                {isWithin24Hours
                  ? t('cancelLesson.refundWarning')
                  : t('cancelLesson.refundOk')}
              </p>
            </div>
          </div>
          {/* Error Message */}
          {errorMsg && (
            <div className='flex items-start gap-2 p-3 bg-red-100 border border-red-300 rounded-lg dark:bg-red-900/30 dark:border-red-700'>
              <AlertTriangle className='w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5' />
              <p className='text-sm text-red-700 dark:text-red-300'>
                {errorMsg}
              </p>
            </div>
          )}
          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-2 border-t border-border'>
            <button
              onClick={onClose}
              disabled={isCancelling}
              className='px-5 py-2.5 text-sm btn-secondary'
            >
              {t('cancelLesson.keepLesson')}
            </button>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className='px-5 py-2.5 text-sm btn-danger'
            >
              {isCancelling
                ? t('cancelLesson.cancelling')
                : t('cancelLesson.confirmButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
