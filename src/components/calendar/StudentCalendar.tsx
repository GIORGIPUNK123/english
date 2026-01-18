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
  addDoc,
  arrayUnion,
  collection,
  doc,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
interface ScheduleModalState {
  day: number;
  hour: number;
  minute: number;
  week: number;
}

export const StudentCalendar = (props: {
  user: User;
  userData: UserDataT;
  lessons: LessonT[];
  topicsArr: TopicT[];
}) => {
  const { lessons, topicsArr } = props;
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<LessonT | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState<ScheduleModalState | null>(
    null,
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topicsArr ? topicsArr[0].id : '',
  );
  // const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [lessonType, setLessonType] = useState<'1on1' | 'group'>('1on1');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const weekDates = getWeekDates(currentWeek);

  // Open schedule modal with next available time slot
  const openScheduleModalWithDefaultTime = () => {
    // Find next available time slot (at least 6 hours from now)
    const now = new Date();
    const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    // Round up to next half hour
    const minutes = sixHoursFromNow.getMinutes();
    if (minutes > 0 && minutes <= 30) {
      sixHoursFromNow.setMinutes(30, 0, 0);
    } else if (minutes > 30) {
      sixHoursFromNow.setHours(sixHoursFromNow.getHours() + 1, 0, 0, 0);
    }

    // Find which day index this falls on
    let targetDayIndex = 0;
    for (let i = 0; i < weekDates.length; i++) {
      if (
        sixHoursFromNow.getFullYear() === weekDates[i].getFullYear() &&
        sixHoursFromNow.getMonth() === weekDates[i].getMonth() &&
        sixHoursFromNow.getDate() === weekDates[i].getDate()
      ) {
        targetDayIndex = i;
        break;
      }
    }

    // If the target time is outside current week, use Monday of current week at 9:00 AM
    if (targetDayIndex === 0 && sixHoursFromNow > weekDates[6]) {
      targetDayIndex = 0; // Monday
      setScheduleTime({ day: 0, hour: 9, minute: 0, week: currentWeek });
    } else {
      setScheduleTime({
        day: targetDayIndex,
        hour: sixHoursFromNow.getHours(),
        minute: sixHoursFromNow.getMinutes(),
        week: currentWeek,
      });
    }

    setShowScheduleModal(true);
  };

  const handleTimeSlotClick = (scheduleState: ScheduleModalState) => {
    setScheduleTime(scheduleState);
    setShowScheduleModal(true);
  };

  const handleScheduleLesson = async () => {
    console.log('Scheduling lesson:', {
      selectedDate,
      selectedTopicId,
      // selectedTeacher,
      lessonType,
    });

    console.log('selectedTopicId: ', selectedTopicId);

    const userDataDocRef = doc(db, 'userData', props.user.uid);
    const buffer = selectedDate.getTime().toString();
    const classDocRef = await addDoc(collection(db, 'classes'), {
      date: parseInt(buffer.slice(0, -3)),
      status: 'scheduled',
      topic_id: selectedTopicId,
      student_id: props.user.uid,
      teacher_id: '',
      link: '',
    }).then((docRef) => {
      updateDoc(userDataDocRef, {
        tokens: increment(-1),
        used_tokens: increment(1),
        classes: arrayUnion({
          id: docRef.id,
          date: parseInt(buffer.slice(0, -3)),
          status: 'scheduled',
          topic: selectedTopicId,
        }),
      })
        .then(() => {
          console.log('Document successfully updated!');
        })
        .catch((error) => {
          console.error('Error updating document: ', error);
        });
    });

    // alert(selectedDate.getTime());

    setShowScheduleModal(false);
    setScheduleTime(null);
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
          onClose={() => {
            setShowScheduleModal(false);
            setScheduleTime(null);
          }}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onSchedule={handleScheduleLesson}
        />
      )}
    </div>
  );
};
