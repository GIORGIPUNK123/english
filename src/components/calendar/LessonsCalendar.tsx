import { useState } from 'react';
import { LessonT, TopicT, UserDataT } from '../../types';
import { getWeekDates } from './utils';
// import { availableTeachers } from './mockData';
import { CalendarLegend } from './CalendarLegend';
import { CalendarGrid } from './CalendarGrid';
import { LessonDetailModal } from './LessonDetailModal';
import { ScheduleLessonModal } from './ScheduleLessonModal';
import { MobileCalendarView } from './MobileCalendarView';
import { User } from 'firebase/auth';
import { CalendarHeader } from './CalendarHeader';
import {
  useScheduleLessonModal,
  ScheduleModalState,
} from '../../hooks/useScheduleLessonModal';

export const LessonsCalendar = (props: {
  user: User;
  userData: UserDataT;
  lessons: LessonT[];
  topicsArr: TopicT[];
  userMode?: 'student' | 'teacher';
  teachingClassIds?: string[];
  onRefresh?: () => void;
}) => {
  const {
    lessons,
    topicsArr,
    userData,
    userMode = 'student',
    teachingClassIds = [],
    onRefresh,
  } = props;
  const isTeacherCalendar = userMode === 'teacher';
  const teachingSet = new Set(teachingClassIds);
  const [selectedLesson, setSelectedLesson] = useState<LessonT | null>(null);
  // const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  const {
    showScheduleModal,
    scheduleTime,
    selectedTopicId,
    lessonType,
    selectedDate,
    currentWeek,
    setScheduleTime,
    setSelectedTopicId,
    setLessonType,
    setSelectedDate,
    setCurrentWeek,
    openScheduleModalWithDefaultTime,
    openScheduleModalWithTime,
    closeScheduleModal,
    rescheduleLesson,
    setRescheduleLesson,
    setShowScheduleModal,
  } = useScheduleLessonModal(topicsArr);

  const weekDates = getWeekDates(currentWeek);

  const handleTimeSlotClick = (scheduleState: ScheduleModalState) => {
    if (isTeacherCalendar) return;
    openScheduleModalWithTime(scheduleState);
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <CalendarHeader
        openModal={openScheduleModalWithDefaultTime}
        weekDates={weekDates}
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
        variant={isTeacherCalendar ? 'teacher' : 'student'}
        onRefresh={onRefresh}
      />

      {/* Legend */}
      <CalendarLegend variant={isTeacherCalendar ? 'teacher' : 'student'} />

      {isTeacherCalendar && lessons.length === 0 && (
        <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
          No open lesson requests or your accepted lessons in this week. Use the
          arrows to check other weeks.
        </p>
      )}

      {/* Calendar Grid - Desktop */}
      <div className='flex-1 hidden lg:block'>
        <CalendarGrid
          weekDates={weekDates}
          lessons={lessons}
          currentWeek={currentWeek}
          onLessonClick={setSelectedLesson}
          onTimeSlotClick={handleTimeSlotClick}
          enableEmptySlotScheduling={!isTeacherCalendar}
          teacherView={isTeacherCalendar}
        />
      </div>

      {/* Mobile View */}
      {isTeacherCalendar && lessons.length === 0 ? (
        <div className='py-12 text-center lg:hidden'>
          <p className='text-gray-600 dark:text-gray-400'>
            No open lesson requests or your accepted lessons this week.
          </p>
          <p className='mt-2 text-sm text-gray-500 dark:text-gray-500'>
            Switch weeks to browse other times, or check back later.
          </p>
        </div>
      ) : (
        <MobileCalendarView
          weekDates={weekDates}
          lessons={lessons}
          onLessonClick={setSelectedLesson}
          teacherView={isTeacherCalendar}
        />
      )}

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <LessonDetailModal
          setRescheduleLesson={setRescheduleLesson}
          setScheduleModalIsOpen={setShowScheduleModal}
          setScheduleTime={setScheduleTime}
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          assignedToMe={teachingSet.has(selectedLesson.id)}
        />
      )}

      {/* Schedule New Lesson Modal */}
      {!isTeacherCalendar && showScheduleModal && scheduleTime && (
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
          userUid={props.user.uid}
          availableTokens={userData.tokens}
          rescheduleLesson={rescheduleLesson}
          setRescheduleLesson={setRescheduleLesson}
        />
      )}
    </div>
  );
};
