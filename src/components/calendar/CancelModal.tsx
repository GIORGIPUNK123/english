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
import { useState } from 'react';

interface LessonDetailModalProps {
  lesson: LessonT;
  onClose: () => void;
}

export const CancelModal = ({ lesson, onClose }: LessonDetailModalProps) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isWithin48Hours = (() => {
    const now = Date.now();
    const lessonTime = lesson.date * 1000;
    const diffInMs = lessonTime - now;
    return diffInMs <= 48 * 60 * 60 * 1000;
  })();
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
      try {
        const classId = lesson.id;
        console.log('classId: ', classId);
        if (lesson.teacher) {
          if (isWithin48Hours) {
            setErrorMsg('Cannot cancel class within 48 hours');
            return;
          }
        }
        if (!classId || !auth.currentUser?.uid) {
          setErrorMsg('Missing class id or user Id, cannot delete');
          return;
        }

        // Delete class document from 'classes' collection
        await deleteDoc(doc(db, 'classes', classId));

        // Get user's data to find the class reference
        const userDataDocRef = doc(db, 'userData', auth.currentUser.uid);

        // Update userData: remove class from array and increment tokens
        await updateDoc(userDataDocRef, {
          tokens: increment(1),
          used_tokens: increment(-1),
          classes: arrayRemove({ id: classId }),
        });

        onClose();
      } catch (error) {
        setErrorMsg('Error deleting class');
        console.error('Error deleting class: ', error);
      }
    } catch (error) {
      setErrorMsg('Error deleting class');
      console.error('Error deleting class: ', error);
    }
  };
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='w-full max-w-lg bg-gray-800 border border-gray-700 shadow-2xl rounded-xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`bg-red-500 p-6 rounded-t-xl relative`}>
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
          <div className='flex justify-between gap-3 pt-2'>
            <p className='text-white'>
              Are you sure you want to cancel this lesson?
            </p>
            <button
              onClick={handleCancel}
              className={` ${lesson.teacher ? 'disabled cursor-not-allowed' : ''} px-4 py-3 text-red-400 transition-all border rounded-lg bg-red-600/20 hover:bg-red-600/30 border-red-600/30`}
            >
              Cancel
            </button>
          </div>
          {errorMsg && <p className='text-red-700'>{errorMsg}</p>}
        </div>
      </div>
    </div>
  );
};
