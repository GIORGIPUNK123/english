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
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();

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
        title: t('calendar.lessonAcceptedTitle'),
        message: t('calendar.lessonAcceptedMessage'),
        type: 'success',
      });
      onClose();
    } catch (err: any) {
      addToast({
        title: t('calendar.acceptFailedTitle'),
        message: err?.message || t('calendar.acceptFailedMessage'),
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
        title: payload.alreadyJoined
          ? t('calendar.alreadyJoinedTitle')
          : t('calendar.joinedGroupTitle'),
        message: payload.alreadyJoined
          ? t('calendar.alreadyJoinedMessage')
          : `${t('calendar.joinedSuccessMessage')} (${payload.participantCount}/${payload.maxParticipants} students).`,
        type: 'success',
      });

      onJoinedGroupLesson?.();
      onClose();
    } catch (err: any) {
      let message = err?.message || t('calendar.joinFailedMessage');
      if (err?.code === 'functions/failed-precondition') {
        message = t('calendar.classFullMessage');
      }

      addToast({
        title: t('calendar.joinFailedTitle'),
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
                    {t('calendar.teacher')}
                </div>
                <div className='font-medium text-gray-900 dark:text-white'>
                  {lesson.teacher
                    ? `${lesson.teacher.first_name} ${lesson.teacher.last_name}`
                    : userMode === 'teacher'
                        ? t('calendar.openAnyTeacher')
                        : t('calendar.notAssigned')}
                </div>
              </div>
            </div>

            {(userMode === 'teacher' || allowGroupJoin) && (
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                  <Users className='w-4 h-4' />
                  <span>{t('calendar.joinedStudents')}</span>
                </div>
                <div className='font-medium text-gray-900 dark:text-white'>
                  {lesson.participantCount}/{lesson.maxParticipants}
                </div>
              </div>
            )}
            {userMode === 'teacher' && lesson.lessonType === '1on1' && (
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                    {t('calendar.student')}
                </div>
                <div className='font-medium text-gray-900 dark:text-white'>
                  {lesson.student
                    ? `${lesson.student.first_name} ${lesson.student.last_name}`
                      : t('calendar.unknownStudent')}
                </div>
              </div>
            )}
            <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                  {t('calendar.classFormat')}
              </div>
              <div className='font-medium text-gray-900 capitalize dark:text-white'>
                {lesson.lessonType === 'group'
                    ? t('calendar.groupClass')
                    : t('calendar.oneOnOneLesson')}
              </div>
            </div>
            {lesson.level && (
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                    {t('dashboard.level')}
                </div>
                <div className='font-medium text-gray-900 dark:text-white'>
                  {lesson.level}
                </div>
              </div>
            )}
            {/* Lesson Type */}
            <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                  {t('calendar.lessonStatus')}
              </div>
              <div className='font-medium text-gray-900 capitalize dark:text-white'>
                  {lesson.status === 'scheduled' && t('calendar.scheduledLesson')}
                  {lesson.status === 'in-progress' && t('calendar.inProgress')}
                  {lesson.status === 'finished' && t('calendar.finished')}
                  {lesson.status === 'missed_student' && t('calendar.missedByStudent')}
                  {lesson.status === 'missed_teacher' && t('calendar.missedByTeacher')}
                  {lesson.status === 'cancelled_student' && t('calendar.cancelledByStudent')}
                  {lesson.status === 'cancelled_teacher' && t('calendar.cancelledByTeacher')}
                  {lesson.status === 'cancelled_system' && t('calendar.cancelledBySystem')}
              </div>
            </div>

            {/* Date */}
            <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {t('calendar.date')}
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
                          ? t('calendar.accepting')
                          : lesson.lessonType === 'group'
                            ? `${t('calendar.acceptGroup')} (${lesson.participantCount}/${lesson.maxParticipants})`
                            : t('calendar.acceptLesson')}
                      </button>
                      <button
                        onClick={onClose}
                        className='flex-1 px-4 py-3 text-gray-900 transition-all bg-gray-200 rounded-lg min-w-[100px] dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                      >
                        {t('calendar.close')}
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
                        {t('calendar.joinLesson')}
                      </button>
                      <button
                        onClick={() => setIsCancelModalOn(true)}
                        className='flex-1 px-4 py-3 text-red-500 transition-all border rounded-lg min-w-[100px] bg-red-600/20 dark:text-red-400 hover:bg-red-600/30 border-red-600/30'
                      >
                        {t('calendar.cancelLesson')}
                      </button>
                      <button
                        onClick={onClose}
                        className='flex-1 px-4 py-3 text-gray-900 transition-all bg-gray-200 rounded-lg min-w-[100px] dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                      >
                        {t('calendar.close')}
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
                    {isJoiningGroup ? t('calendar.joining') : t('calendar.joinGroupClass')}
                  </button>
                  <button
                    onClick={onClose}
                    className='flex-1 px-4 py-3 text-gray-900 transition-all bg-gray-200 rounded-lg min-w-[100px] dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  >
                    {t('calendar.close')}
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
                    {t('calendar.joinLesson')}
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
                    {t('calendar.reschedule')}
                  </button>
                  <button
                    onClick={() => setIsCancelModalOn(true)}
                    className='px-4 py-3 text-red-500 transition-all border rounded-lg bg-red-600/20 dark:text-red-400 hover:bg-red-600/30 border-red-600/30'
                  >
                    {t('calendar.cancelLesson')}
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
