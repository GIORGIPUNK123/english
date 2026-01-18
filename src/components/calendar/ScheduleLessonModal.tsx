import { X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { TopicT, TeacherT, LessonT } from '../../types';
import {
  getWeekDates,
  isTimestampConflicting,
  isTimestampTooSoon,
} from './utils';

interface ScheduleModalState {
  day: number;
  hour: number;
  minute: number;
  week: number; // Track which week the user is viewing in the modal
}

interface ScheduleLessonModalProps {
  scheduleTime: ScheduleModalState;
  onScheduleTimeChange: (state: ScheduleModalState) => void;
  selectedTopicId: string;
  onTopicChange: (topicId: string) => void;
  // selectedTeacher: string;
  // onTeacherChange: (teacher: string) => void;
  lessonType: '1on1' | 'group';
  onLessonTypeChange: (type: '1on1' | 'group') => void;
  availableTopics: TopicT[];
  // availableTeachers: TeacherT[];
  lessons: LessonT[];
  onClose: () => void;
  onSchedule: () => void;
  topicsArr: TopicT[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const hours = Array.from({ length: 24 }, (_, i) => i);

export const ScheduleLessonModal = ({
  scheduleTime,
  onScheduleTimeChange,
  selectedTopicId,
  onTopicChange,
  // selectedTeacher,
  // onTeacherChange,
  lessonType,
  onLessonTypeChange,
  availableTopics,
  // availableTeachers,
  lessons,
  onClose,
  onSchedule,
  selectedDate,
}: ScheduleLessonModalProps) => {
  const modalWeekDates = getWeekDates(scheduleTime.week);
  selectedDate.setHours(scheduleTime.hour, scheduleTime.minute, 0, 0);
  const timestamp = Math.floor(selectedDate.getTime() / 1000);
  const isConflicting = isTimestampConflicting(timestamp, lessons);
  const isTooSoon = isTimestampTooSoon(timestamp);
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
        <div className='relative p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl'>
          <button
            onClick={onClose}
            className='absolute p-2 transition-all rounded-lg top-4 right-4 hover:bg-white/10'
          >
            <X className='w-5 h-5 text-white' />
          </button>
          <h2 className='pr-10 text-2xl font-semibold text-white'>
            Schedule New Lesson
          </h2>
          <div className='flex items-center gap-2 mt-2 text-white/90'>
            <Clock className='w-4 h-4' />
            <span>
              {modalWeekDates[scheduleTime.day].toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}{' '}
              at {scheduleTime.hour.toString().padStart(2, '0')}:
              {scheduleTime.minute.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className='p-6 space-y-5 max-h-[70vh] overflow-y-auto'>
          {/* Week Selector for Date Picking */}
          <div>
            <label className='block mb-3 text-sm text-gray-400'>
              Select Date
            </label>

            {/* Week Navigation */}
            <div className='flex items-center justify-between p-2 mb-3 rounded-lg bg-gray-700/20'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleTimeChange({
                    ...scheduleTime,
                    week: scheduleTime.week - 1,
                    day: 0,
                  });
                }}
                className='p-2 text-gray-400 transition-all rounded-lg hover:bg-gray-700 hover:text-white'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <div className='text-sm font-medium text-white'>
                {modalWeekDates[0].toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {modalWeekDates[6].toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleTimeChange({
                    ...scheduleTime,
                    week: scheduleTime.week + 1,
                    day: 0,
                  });
                }}
                className='p-2 text-gray-400 transition-all rounded-lg hover:bg-gray-700 hover:text-white'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>

            {/* Day Grid */}
            <div className='grid grid-cols-7 gap-2'>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                (dayName, index) => {
                  const date = modalWeekDates[index];
                  const isSelected = scheduleTime.day === index;
                  const isToday =
                    date.toDateString() === new Date().toDateString();
                  const isSunday = index === 6;

                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleTimeChange({ ...scheduleTime, day: index });
                      }}
                      className={`p-3 rounded-lg transition-all text-center ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700/40 hover:bg-gray-700/60 text-gray-300'
                      }`}
                    >
                      <div
                        className={`text-[10px] mb-1 ${
                          isSelected
                            ? 'text-blue-200'
                            : isSunday
                              ? 'text-red-400'
                              : 'text-gray-500'
                        }`}
                      >
                        {dayName}
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          isToday && !isSelected ? 'text-blue-400' : ''
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Time Selector */}
          <div>
            <label className='block mb-3 text-sm text-gray-400'>
              Select Time
            </label>
            <div className='grid grid-cols-2 gap-3'>
              {/* Hour Selector */}
              <div>
                <div className='mb-2 text-xs text-gray-500'>Hour</div>
                <div className='grid grid-cols-6 gap-1 max-h-[200px] overflow-y-auto bg-gray-700/20 p-2 rounded-lg'>
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleTimeChange({ ...scheduleTime, hour });
                      }}
                      className={`p-2 rounded text-xs transition-all ${
                        scheduleTime.hour === hour
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700/40 hover:bg-gray-700/60 text-gray-300'
                      }`}
                    >
                      {hour.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute Selector */}
              <div>
                <div className='mb-2 text-xs text-gray-500'>Minute</div>
                <div className='grid grid-cols-2 gap-2 p-2 rounded-lg bg-gray-700/20'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onScheduleTimeChange({ ...scheduleTime, minute: 0 });
                    }}
                    className={`p-3 rounded text-sm transition-all ${
                      scheduleTime.minute === 0
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700/40 hover:bg-gray-700/60 text-gray-300'
                    }`}
                  >
                    00
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onScheduleTimeChange({ ...scheduleTime, minute: 30 });
                    }}
                    className={`p-3 rounded text-sm transition-all ${
                      scheduleTime.minute === 30
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700/40 hover:bg-gray-700/60 text-gray-300'
                    }`}
                  >
                    30
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Time Display */}
            <div className='p-3 mt-3 border rounded-lg bg-blue-600/10 border-blue-600/30'>
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4 text-blue-400' />
                <span className='text-sm text-white'>
                  {modalWeekDates[scheduleTime.day].toLocaleDateString(
                    'en-US',
                    {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    },
                  )}{' '}
                  at {scheduleTime.hour.toString().padStart(2, '0')}:
                  {scheduleTime.minute.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Validation Warning */}
            {(isConflicting || isTooSoon) && (
              <div className='flex items-center gap-1 p-2 mt-2 text-xs text-red-400 border rounded bg-red-500/10 border-red-500/30'>
                <span>⚠️</span>
                <span>
                  {isTooSoon && 'Must be at least 6 hours in the future'}
                  {isConflicting &&
                    !isTooSoon &&
                    'Conflicts with existing lesson'}
                </span>
              </div>
            )}
          </div>

          {/* Lesson Type Selection */}
          <div>
            <label className='block mb-2 text-sm text-gray-400'>
              Lesson Type
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <button
                className={`p-4 ${lessonType === '1on1' ? 'bg-blue-600/20 border-2 border-blue-600 rounded-lg hover:bg-blue-600/30 transition-all' : 'bg-gray-700/40 border-2 border-gray-700 rounded-lg hover:bg-gray-700/60 transition-all'}`}
                onClick={() => onLessonTypeChange('1on1')}
              >
                <div className='mb-1 font-medium text-white'>1-on-1 Lesson</div>
                <div className='text-xs text-gray-400'>Personal coaching</div>
              </button>
              <button
                className={`p-4 ${lessonType === 'group' ? 'bg-blue-600/20 border-2 border-blue-600 rounded-lg hover:bg-blue-600/30 transition-all' : 'bg-gray-700/40 border-2 border-gray-700 rounded-lg hover:bg-gray-700/60 transition-all'}`}
                onClick={() => onLessonTypeChange('group')}
              >
                <div className='mb-1 font-medium text-white'>Group Class</div>
                <div className='text-xs text-gray-400'>Learn with others</div>
              </button>
            </div>
          </div>

          {/* Teacher Selection */}
          {/* Not available for now */}
          {/* <div>
            <label className='block mb-2 text-sm text-gray-400'>
              Select Teacher
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => onTeacherChange(e.target.value)}
              className='w-full p-3 text-white bg-gray-700 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none'
            >
              <option value=''>Any Teacher - First available</option>
              {availableTeachers.map((teacher) => (
                <option
                  className='bg-gray-700/40'
                  key={teacher.first_name}
                  value={teacher.first_name}
                >
                  {teacher.first_name} {teacher.last_name} -{' '}
                  {teacher.rating.toFixed(1)}★
                </option>
              ))}
            </select>
          </div> */}

          {/* Topic Selection */}
          <div>
            <label className='block mb-2 text-sm text-gray-400'>
              Lesson Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => onTopicChange(e.target.value)}
              className='w-full p-3 text-white bg-gray-700 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none'
            >
              {availableTopics.map((topic, index) => (
                <option className='bg-gray-700/40' key={index} value={topic.id}>
                  {topic.heading}
                </option>
              ))}
            </select>
          </div>

          {/* Lesson Focus (Optional) */}
          <div>
            <label className='block mb-2 text-sm text-gray-400'>
              Lesson Focus (Optional)
            </label>
            <textarea
              className='w-full p-3 text-white placeholder-gray-500 border border-gray-700 rounded-lg resize-none bg-gray-700/40 focus:border-blue-600 focus:outline-none'
              rows={3}
              placeholder='What would you like to focus on in this lesson?'
            />
          </div>

          {/* Token Cost */}
          <div className='flex items-center justify-between p-4 border rounded-lg bg-blue-600/10 border-blue-600/30'>
            <div className='text-sm text-gray-400'>Token Cost</div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center w-6 h-6 text-xs font-bold bg-yellow-500 rounded-full'>
                T
              </div>
              <span className='font-semibold text-white'>1 Token</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 pt-2'>
            <button
              onClick={onSchedule}
              className='flex-1 px-4 py-3 font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700'
            >
              Schedule Lesson
            </button>
            <button
              onClick={onClose}
              className='px-4 py-3 text-white transition-all bg-gray-700 rounded-lg hover:bg-gray-600'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
