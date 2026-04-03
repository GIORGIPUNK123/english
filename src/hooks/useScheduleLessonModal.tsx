import { useEffect, useState } from 'react';
import { LessonT, TopicT } from '../types';
import { getWeekDates } from '../components/calendar/utils';

export interface ScheduleModalState {
  day: number;
  hour: number;
  minute: number;
  week: number;
}

export const useScheduleLessonModal = (topicsArr: TopicT[]) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [rescheduleLesson, setRescheduleLesson] = useState<LessonT | null>(
    null,
  );
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState<ScheduleModalState | null>(
    null,
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [lessonType, setLessonType] = useState<'1on1' | 'group'>('1on1');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const openScheduleModalWithDefaultTime = () => {
    const weekDates = getWeekDates(currentWeek);
    const now = new Date();

    // Round to next half hour
    const minutes = now.getMinutes();
    let roundedMinute = minutes;
    let roundedHour = now.getHours();

    if (minutes > 0 && minutes < 30) {
      roundedMinute = 30;
    } else if (minutes >= 30) {
      roundedHour = roundedHour + 1;
      roundedMinute = 0;
    }

    // Find which day index today falls on
    let targetDayIndex = 0;
    for (let i = 0; i < weekDates.length; i++) {
      if (
        now.getFullYear() === weekDates[i].getFullYear() &&
        now.getMonth() === weekDates[i].getMonth() &&
        now.getDate() === weekDates[i].getDate()
      ) {
        targetDayIndex = i;
        break;
      }
    }

    setScheduleTime({
      day: targetDayIndex,
      hour: roundedHour,
      minute: roundedMinute,
      week: currentWeek,
    });

    setShowScheduleModal(true);
  };

  const closeScheduleModal = () => {
    setRescheduleLesson(null);
    setShowScheduleModal(false);
    setScheduleTime(null);
  };

  const openScheduleModalWithTime = (state: ScheduleModalState) => {
    setScheduleTime(state);
    setShowScheduleModal(true);
  };
  useEffect(() => {
    if (topicsArr.length > 0 && !selectedTopicId) {
      setSelectedTopicId(topicsArr[0].id);
    }
  }, [topicsArr, selectedTopicId]);

  return {
    // State
    currentWeek,
    showScheduleModal,
    setShowScheduleModal,
    scheduleTime,
    selectedTopicId,
    lessonType,
    selectedDate,
    // Setters
    setCurrentWeek,
    setScheduleTime,
    setSelectedTopicId,
    setLessonType,
    setSelectedDate,
    // Actions
    openScheduleModalWithDefaultTime,
    openScheduleModalWithTime,
    closeScheduleModal,
    rescheduleLesson,
    setRescheduleLesson,
  };
};
