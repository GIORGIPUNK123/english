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

export const StudentCalendar = (props: {
  user: User;
  userData: UserDataT;
  lessons: LessonT[];
  topicsArr: TopicT[];
}) => {
  const { lessons, topicsArr, userData } = props;
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
      />

      {/* Legend */}
      <CalendarLegend />

      {/* Calendar Grid - Desktop */}
      <div className='flex-1 hidden lg:block'>
        <CalendarGrid
          weekDates={weekDates}
          lessons={lessons}
          currentWeek={currentWeek}
          onLessonClick={setSelectedLesson}
          onTimeSlotClick={handleTimeSlotClick}
        />
      </div>

      {/* Mobile View */}
      <MobileCalendarView
        weekDates={weekDates}
        lessons={lessons}
        onLessonClick={setSelectedLesson}
      />

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <LessonDetailModal
          setRescheduleLesson={setRescheduleLesson}
          setScheduleModalIsOpen={setShowScheduleModal}
          setScheduleTime={setScheduleTime}
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}

      {/* Schedule New Lesson Modal */}
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
          userUid={props.user.uid}
          availableTokens={userData.tokens}
          rescheduleLesson={rescheduleLesson}
          setRescheduleLesson={setRescheduleLesson}
        />
      )}
    </div>
  );
};
