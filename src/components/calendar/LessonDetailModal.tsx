import { X, Clock, User, Users, Video } from 'lucide-react';
import { LessonT } from '../../types';
import {
  getLessonColor,
  formatTime,
  formatDate,
  getScheduleTimeFromTimestamp,
} from './utils';
import { CancelModal } from './CancelModal';
import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';
import { useToast } from '../../context/ToastContext';
import { useUserMode } from '../../context/UserModeContext';

interface LessonDetailModalProps {
  lesson: LessonT;
  onClose: () => void;
  setRescheduleLesson: (lesson: LessonT | null) => void; // Function to set the lesson being rescheduled, or null to clear it
  setScheduleModalIsOpen: (isOpen: boolean) => void; // Function to open the schedule modal
  setScheduleTime: (
    time: { day: number; hour: number; minute: number; week: number } | null,
  ) => void; // Function to set the default time in the schedule modal
  /** True when this lesson is in the current user's teaching_classes. */
  assignedToMe?: boolean;
  /** True when lesson is discoverable in calendar but not joined by current student. */
  allowGroupJoin?: boolean;
  onJoinedGroupLesson?: () => void;
}

export const LessonDetailModal = ({
  lesson,
  onClose,
  setRescheduleLesson,
  setScheduleModalIsOpen,
  setScheduleTime,
  assignedToMe = false,
  allowGroupJoin = false,
  onJoinedGroupLesson,
}: LessonDetailModalProps) => {
  const [isCancelModalOn, setIsCancelModalOn] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const { addToast } = useToast();
  const { userMode } = useUserMode();

  const handleJoinLesson = () => {
    if (!lesson.link) {
      return;
    }
    window.open(lesson.link, '_blank', 'noopener,noreferrer');
  };

  const handleAcceptLesson = async () => {
    if (lesson.status !== 'scheduled') {
      return;
    }

    setIsAccepting(true);
    try {
      const fn = httpsCallable<{ classId: string }, { success: boolean }>(
        functions,
        'acceptLesson',
      );
      await fn({ classId: lesson.id });

      addToast({
        title: 'Lesson accepted',
        message: 'You have accepted this lesson request.',
        type: 'success',
      });
      onClose();
    } catch (err: any) {
      addToast({
        title: 'Accept failed',
        message: err?.message || 'Could not accept this lesson.',
        type: 'error',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleJoinGroupLesson = async () => {
    if (!allowGroupJoin || lesson.lessonType !== 'group') {
      return;
    }

    setIsJoiningGroup(true);
    try {
      const fn = httpsCallable<
        { classId: string },
        {
          success: boolean;
          alreadyJoined: boolean;
          participantCount: number;
          maxParticipants: number;
        }
      >(functions, 'joinGroupLesson');

      const result = await fn({ classId: lesson.id });
      const payload = result.data;

      addToast({
        title: payload.alreadyJoined ? 'Already Joined' : 'Joined Group Class',
        message: payload.alreadyJoined
          ? 'You are already in this group class.'
          : `Joined successfully (${payload.participantCount}/${payload.maxParticipants} students).`,
        type: 'success',
      });

      onJoinedGroupLesson?.();
      onClose();
    } catch (err: any) {
      let message = err?.message || 'Could not join this lesson.';
      if (err?.code === 'functions/failed-precondition') {
        message =
          'This class is full, unavailable, or no longer open for joining.';
      }

      addToast({
        title: 'Join Failed',
        message,
        type: 'error',
      });
    } finally {
      setIsJoiningGroup(false);
    }
  };

  return (
    <>
      {isCancelModalOn && (
        <CancelModal
          lesson={lesson}
          onClose={() => {
            setIsCancelModalOn(false);
          }}
          additionalCallback={() => {
            onClose();
          }}
        />
      )}
      <div
        className='fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      >
        <div
          className='w-full max-w-lg bg-white border border-gray-200 shadow-2xl dark:bg-gray-800 dark:border-gray-700 rounded-xl'
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
            <div className='flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
              <div className='flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500'>
                <User className='w-6 h-6 text-white' />
              </div>
              <div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>
                  Teacher
                </div>
                <div className='font-medium text-gray-900 dark:text-white'>
                  {lesson.teacher
                    ? `${lesson.teacher.first_name} ${lesson.teacher.last_name}`
                    : userMode === 'teacher'
                      ? 'Open — any teacher can accept'
                      : 'Not assigned'}
                </div>
              </div>
            </div>

            {(userMode === 'teacher' || allowGroupJoin) && (
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                  <Users className='w-4 h-4' />
                  <span>Joined Students</span>
                </div>
                <div className='font-medium text-gray-900 dark:text-white'>
                  {lesson.participantCount}/{lesson.maxParticipants}
                </div>
              </div>
            )}
            {userMode === 'teacher' && lesson.lessonType === '1on1' && (
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Student
                </div>
                <div className='font-medium text-gray-900 dark:text-white'>
                  {lesson.student
                    ? `${lesson.student.first_name} ${lesson.student.last_name}`
                    : 'Unknown student'}
                </div>
              </div>
            )}
            <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Class Format
              </div>
              <div className='font-medium text-gray-900 capitalize dark:text-white'>
                {lesson.lessonType === 'group'
                  ? 'Group Class'
                  : '1-on-1 Lesson'}
              </div>
            </div>
            {/* Lesson Type */}
            <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Lesson Status
              </div>
              <div className='font-medium text-gray-900 capitalize dark:text-white'>
                {lesson.status === 'scheduled' && 'Scheduled Lesson'}
                {lesson.status === 'in-progress' && 'In Progress'}
                {lesson.status === 'finished' && 'Finished'}
                {lesson.status === 'missed_student' && 'Missed by Student'}
                {lesson.status === 'missed_teacher' && 'Missed by Teacher'}
                {lesson.status === 'cancelled_student' &&
                  'Cancelled by Student'}
                {lesson.status === 'cancelled_teacher' &&
                  'Cancelled by Teacher'}
                {lesson.status === 'cancelled_system' && 'Cancelled by System'}
              </div>
            </div>

            {/* Date */}
            <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Date
              </div>
              <div className='font-medium text-gray-900 dark:text-white'>
                {formatDate(lesson.date)}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap ${lesson.status !== 'scheduled' && lesson.status !== 'in-progress' ? 'hidden' : ''}`}
            >
              {userMode === 'teacher' ? (
                <>
                  {!assignedToMe && !lesson.teacher && (
                    <>
                      <button
                        onClick={handleAcceptLesson}
                        disabled={isAccepting || lesson.status !== 'scheduled'}
                        className='flex-1 px-4 py-3 text-white transition-all bg-green-600 rounded-lg min-w-[140px] hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {isAccepting
                          ? 'Accepting...'
                          : lesson.lessonType === 'group'
                            ? `Accept group (${lesson.participantCount}/${lesson.maxParticipants})`
                            : 'Accept lesson'}
                      </button>
                      <button
                        onClick={onClose}
                        className='flex-1 px-4 py-3 text-gray-900 transition-all bg-gray-200 rounded-lg min-w-[100px] dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                      >
                        Close
                      </button>
                    </>
                  )}
                  {assignedToMe && (
                    <>
                      <button
                        onClick={handleJoinLesson}
                        disabled={!lesson.link}
                        className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 min-w-[140px] rounded-lg dark:text-white ${lesson.link ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-500 cursor-not-allowed bg-gray-200 dark:bg-gray-700'}`}
                      >
                        <Video className='w-4 h-4' />
                        Join lesson
                      </button>
                      <button
                        onClick={() => setIsCancelModalOn(true)}
                        className='flex-1 px-4 py-3 text-red-500 transition-all border rounded-lg min-w-[100px] bg-red-600/20 dark:text-red-400 hover:bg-red-600/30 border-red-600/30'
                      >
                        Cancel lesson
                      </button>
                      <button
                        onClick={onClose}
                        className='flex-1 px-4 py-3 text-gray-900 transition-all bg-gray-200 rounded-lg min-w-[100px] dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                      >
                        Close
                      </button>
                    </>
                  )}
                </>
              ) : allowGroupJoin ? (
                <>
                  <button
                    onClick={handleJoinGroupLesson}
                    disabled={isJoiningGroup || lesson.status !== 'scheduled'}
                    className='flex-1 px-4 py-3 text-white transition-all bg-blue-600 rounded-lg min-w-[140px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isJoiningGroup ? 'Joining...' : 'Join Group Class'}
                  </button>
                  <button
                    onClick={onClose}
                    className='flex-1 px-4 py-3 text-gray-900 transition-all bg-gray-200 rounded-lg min-w-[100px] dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleJoinLesson}
                    disabled={!lesson.link}
                    className={`flex items-center justify-center flex-1 gap-2 px-4 py-3 dark:text-white text-gray-900 transition-all rounded-lg ${lesson.link ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-not-allowed'} `}
                  >
                    <Video className='w-4 h-4' />
                    Join Lesson
                  </button>
                  <button
                    onClick={() => {
                      setScheduleTime(
                        getScheduleTimeFromTimestamp(lesson.date),
                      );
                      setRescheduleLesson(lesson);
                      setScheduleModalIsOpen(true);
                    }}
                    className='px-4 py-3 text-gray-900 transition-all bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => setIsCancelModalOn(true)}
                    className='px-4 py-3 text-red-500 transition-all border rounded-lg bg-red-600/20 dark:text-red-400 hover:bg-red-600/30 border-red-600/30'
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
