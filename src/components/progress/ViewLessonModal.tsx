import { auth, db } from '../../firebase/firebase-config';
import { LessonT } from '../../types';
import {
  doc,
  deleteDoc,
  updateDoc,
  increment,
  arrayRemove,
} from 'firebase/firestore';

export const ViewLessonModal = (props: {
  isOn: boolean;
  setIsOn: (v: boolean) => void;
  lesson: LessonT & { description: string; id?: string; student_id?: string };
  isWithin48Hours?: boolean;
  old?: boolean;
}) => {
  const { topic, teacher, date, status, description, link } = props.lesson;
  console.log('teacher: ', teacher);

  const handleCancel = async () => {
    try {
      const classId = props.lesson.id;
      console.log('classId: ', classId);
      if (props.isWithin48Hours) {
        console.error('Cannot cancel class within 48 hours');
        return;
      }
      if (!classId || !auth.currentUser?.uid) {
        console.error('Missing class id or user Id, cannot delete');
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

      props.setIsOn(false);
    } catch (error) {
      console.error('Error deleting class: ', error);
    }
  };
  console.log('link: ', link);
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${
        props.isOn ? '' : 'hidden'
      }`}
    >
      <div className='relative w-full max-w-lg p-8 bg-white shadow-2xl dark:bg-black-pearl-950 rounded-xl'>
        <button
          className='absolute text-gray-400 top-4 right-4 hover:text-gray-900 dark:hover:text-white'
          onClick={() => props.setIsOn(false)}
        >
          <span className='sr-only'>Close modal</span>
          <svg className='w-5 h-5' fill='none' viewBox='0 0 20 20'>
            <path
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 6l8 8M6 14L14 6'
            />
          </svg>
        </button>
        <h2 className='mb-4 text-2xl font-bold text-black dark:text-white'>
          {topic?.heading}
        </h2>
        <div className='mb-2 text-lg text-gray-700 dark:text-gray-300'>
          <span className='font-semibold'>Teacher:</span>{' '}
          {teacher ? teacher.first_name + ' ' + teacher.last_name : 'N/A'}
        </div>
        <div className='mb-2 text-lg text-gray-700 dark:text-gray-300'>
          <span className='font-semibold'>Date & Time:</span>{' '}
          {new Date(date * 1000).toLocaleString()}
        </div>
        <div className='mb-4 text-lg text-gray-700 dark:text-gray-300'>
          <span className='font-semibold'>Status:</span>{' '}
          <span
            className={
              status === 'finished'
                ? 'text-green-600'
                : status === 'scheduled'
                ? 'text-blue-600'
                : 'text-red-600'
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div className='mb-2 text-lg text-gray-700 dark:text-gray-300'>
          <span className='font-semibold'>Link :</span>{' '}
          {link ? (
            <a href={link} target='_blank'>
              <button className='px-3 py-1 text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700'>
                <span>Join Class</span>
              </button>
            </a>
          ) : (
            <button className='px-3 py-1 text-white transition bg-blue-700 rounded-lg shadow opacity-50 cursor-not-allowed'>
              <span>Not Generated</span>
            </button>
          )}
        </div>
        <div className='mb-2 text-lg text-gray-700 dark:text-gray-300'>
          <span className='font-semibold'>Report :</span>{' '}
          {status === 'finished' ? (
            <button className='px-3 py-1 text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700'>
              <span>View Report</span>
            </button>
          ) : (
            <button className='px-3 py-1 text-white transition bg-blue-700 rounded-lg shadow opacity-50 cursor-not-allowed'>
              <span>Report Not Available</span>
            </button>
          )}
        </div>
        {description && (
          <div className='mb-4 text-gray-600 dark:text-gray-400'>
            <span className='font-semibold'>Description:</span> {description}
          </div>
        )}

        <div
          className={`flex ${
            props.old ? 'justify-end' : 'justify-between'
          } mt-6`}
        >
          <button
            disabled={props.isWithin48Hours}
            className={` ${
              props.old ? 'hidden' : ''
            }  px-6 py-2 text-white transition rounded-lg shadow bg-torch-red-600 ${
              props.isWithin48Hours
                ? 'cursor-not-allowed'
                : 'hover:bg-torch-red-700'
            } `}
            onClick={handleCancel}
          >
            Cancel class
          </button>
          <button
            className='px-6 py-2 text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700'
            onClick={() => props.setIsOn(false)}
          >
            Close
          </button>
        </div>
        <span className='text-lg text-torch-red-500'>
          {props.isWithin48Hours ? 'Cannot cancel class within 48 hours' : ''}
        </span>
      </div>
    </div>
  );
};
