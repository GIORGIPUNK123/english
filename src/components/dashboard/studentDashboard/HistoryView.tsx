import React, { useState } from 'react';
import { LessonT, StatusT, TopicT, UserDataT } from '../../../types';
import { LessonDetailModal } from '../../calendar/LessonDetailModal';
import { Eye, RotateCw } from 'lucide-react';
import { useScheduleLessonModal } from '../../../hooks/useScheduleLessonModal';
import { ScheduleLessonModal } from '../../calendar/ScheduleLessonModal';
import { User } from 'firebase/auth';
import { useUserMode } from '../../../context/UserModeContext';
import { getTokenBalances } from '../../../utils/tokenUtils';

interface HistoryViewProps {
  user: User;
  userData: UserDataT;
  lessons: LessonT[];
  loading: boolean;
  topicsArr: TopicT[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  user,
  userData,
  lessons,
  loading,
  topicsArr,
  onRefresh,
  isRefreshing = false,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<LessonT | null>(null);
  const { userMode } = useUserMode();
  const teachingClassIds = new Set(userData.teaching_classes || []);
  const tokenBalances = getTokenBalances(userData);

  const showDetails = (lesson: LessonT) => {
    setSelectedLesson(lesson);
  };

  const closeModal = () => {
    setSelectedLesson(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: StatusT) => {
    const statusConfig: Record<
      StatusT,
      { bgColor: string; textColor: string; label: string }
    > = {
      finished: {
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-700 dark:text-green-400',
        label: 'Completed',
      },
      cancelled_student: {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        label: 'Canceled by Student',
      },
      cancelled_teacher: {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        label: 'Canceled by Teacher',
      },
      cancelled_system: {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        label: 'Canceled by System',
      },
      scheduled: {
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-700 dark:text-blue-400',
        label: 'Scheduled',
      },
      'in-progress': {
        bgColor: 'bg-orange-500/10',
        textColor: 'text-orange-700 dark:text-orange-400',
        label: 'In Progress',
      },
      missed_student: {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        label: 'Missed by Student',
      },
      missed_teacher: {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        label: 'Missed by Teacher',
      },
    };
    return statusConfig[status];
  };

  const {
    showScheduleModal,
    scheduleTime,
    selectedTopicId,
    lessonType,
    selectedDate,
    setScheduleTime,
    setSelectedTopicId,
    setLessonType,
    setSelectedDate,
    // openScheduleModalWithDefaultTime,
    closeScheduleModal,
    rescheduleLesson,
    setRescheduleLesson,
    setShowScheduleModal,
  } = useScheduleLessonModal(topicsArr);

  return (
    <>
      <div className='flex-1 flex flex-col bg-white border border-gray-200 shadow-lg dark:bg-gray-800/40 rounded-xl dark:border-gray-700 p-6'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between gap-3'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Lesson History
            </h2>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-all bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <RotateCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className='hidden sm:inline'>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} found
          </p>
        </div>
        {showScheduleModal && scheduleTime && (
          <ScheduleLessonModal
            scheduleTime={scheduleTime}
            onScheduleTimeChange={setScheduleTime}
            selectedTopicId={selectedTopicId}
            onTopicChange={setSelectedTopicId}
            topicsArr={topicsArr}
            // selectedTeacher={selectedTeacher}
            // onTeacherChange={setSelectedTeacher}
            lessonType={lessonType}
            onLessonTypeChange={setLessonType}
            availableTopics={topicsArr}
            // availableTeachers={availableTeachers}
            lessons={lessons}
            onClose={closeScheduleModal}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            userUid={user.uid}
            tokenBalances={tokenBalances}
            rescheduleLesson={rescheduleLesson}
            setRescheduleLesson={setRescheduleLesson}
          />
        )}
        {/* Content */}
        <div className='flex-1 overflow-auto'>
          {loading ? (
            <div className='flex items-center justify-center h-40'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            </div>
          ) : lessons.length > 0 ? (
            <div className='space-y-3'>
              {lessons.map((lesson) => {
                const statusConfig = getStatusConfig(lesson.status);
                return (
                  <div
                    key={lesson.id}
                    className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all cursor-pointer group'
                    onClick={() => showDetails(lesson)}
                  >
                    <div className='flex items-start justify-between gap-4'>
                      {/* Left Content */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-3 mb-2'>
                          <h3 className='font-semibold text-gray-900 dark:text-white truncate'>
                            {lesson.topic?.heading || 'Untitled Lesson'}
                          </h3>
                          <div
                            className={`${statusConfig.bgColor} px-3 py-1 rounded-full text-xs font-medium ${statusConfig.textColor} whitespace-nowrap`}
                          >
                            {statusConfig.label}
                          </div>
                        </div>

                        <div className='grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400'>
                          <div>
                            <span className='font-medium'>Date: </span>
                            {formatDate(lesson.date)}
                          </div>
                          <div>
                            <span className='font-medium'>Time: </span>
                            {formatTime(lesson.date)} -{' '}
                            {formatTime(lesson.date + 3600)}
                          </div>
                          <div>
                            <span className='font-medium'>Duration: </span>
                            60 minutes
                          </div>
                          <div>
                            <span className='font-medium'>Teacher: </span>
                            {lesson.teacher
                              ? `${lesson.teacher.first_name} ${lesson.teacher.last_name}`
                              : 'Not Assigned'}
                          </div>
                        </div>
                      </div>

                      {/* Right Content - Button */}

                      <button
                        className='flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 bg-blue-600/20 text-blue-500 dark:text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600/30 transition-all'
                        onClick={(e) => {
                          e.stopPropagation();
                          showDetails(lesson);
                        }}
                      >
                        <Eye className='w-4 h-4' />
                        <span className=''>View</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400'>
              <div className='text-center'>
                <p className='text-lg font-medium'>No lessons found</p>
                <p className='text-sm mt-1'>
                  Your lesson history will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={closeModal}
          setRescheduleLesson={setRescheduleLesson}
          setScheduleModalIsOpen={setShowScheduleModal}
          setScheduleTime={setScheduleTime}
          assignedToMe={
            userMode === 'teacher' && teachingClassIds.has(selectedLesson.id)
          }
        />
      )}
    </>
  );
};

export default HistoryView;
