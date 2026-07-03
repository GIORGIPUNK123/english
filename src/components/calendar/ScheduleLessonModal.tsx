import { X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { LEVEL_OPTIONS, LessonT, LevelT, TopicT } from '../../types';
import {
  getWeekDates,
  isTimestampConflicting,
  isTimestampTooSoon,
} from './utils';
import { functions } from '../../firebase/firebase-config';
import { useToast } from '../../context/ToastContext';
import { httpsCallable } from 'firebase/functions';
import {
  TokenBalancesT,
  getAvailableTokensForLessonType,
  getLessonTokenLabel,
} from '../../utils/tokenUtils';
import { useLanguage } from '../../context/LanguageContext';

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
  selectedLevel: LevelT;
  onLevelChange: (level: LevelT) => void;
  // selectedTeacher: string;
  // onTeacherChange: (teacher: string) => void;
  lessonType: '1on1' | 'group';
  onLessonTypeChange: (type: '1on1' | 'group') => void;
  availableTopics: TopicT[];
  // availableTeachers: TeacherT[];
  lessons: LessonT[];
  onClose: () => void;
  topicsArr: TopicT[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  userUid: string;
  tokenBalances: TokenBalancesT;
  rescheduleLesson?: LessonT | null; // If present, modal is in "reschedule" mode
  setRescheduleLesson?: (lesson: LessonT | null) => void; // Function to set the lesson being rescheduled, or null to clear it
}

const hours = Array.from({ length: 24 }, (_, i) => i);

const LessonTypeDisplay = (props: {
  lessonType: '1on1' | 'group';
  onLessonTypeChange: (type: '1on1' | 'group') => void;
  rescheduleLesson?: LessonT;
}) => {
  const { lessonType, onLessonTypeChange, rescheduleLesson } = props;
  const { t } = useLanguage();
  return (
    <div>
      <label className='block mb-2 text-sm text-gray-600 dark:text-gray-400'>
        {t('calendar.lessonType')}
      </label>
      <div className='grid grid-cols-2 gap-3'>
        <button
          className={`p-4 ${lessonType === '1on1' ? 'bg-blue-50 dark:bg-blue-600/20 border-2 border-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-600/30 transition-all' : 'bg-gray-100 dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all'} ${rescheduleLesson ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={() => !rescheduleLesson && onLessonTypeChange('1on1')}
          disabled={!!rescheduleLesson}
        >
          <div className='mb-1 font-medium text-gray-900 dark:text-white'>
            {t('calendar.oneOnOneLesson')}
          </div>
          <div className='text-xs text-gray-600 dark:text-gray-400'>
            {t('calendar.personalCoaching')}
          </div>
        </button>
        <button
          className={`p-4 ${lessonType === 'group' ? 'bg-blue-50 dark:bg-blue-600/20 border-2 border-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-600/30 transition-all' : 'bg-gray-100 dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all'} ${rescheduleLesson ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={() => !rescheduleLesson && onLessonTypeChange('group')}
          disabled={!!rescheduleLesson}
        >
          <div className='mb-1 font-medium text-gray-900 dark:text-white'>
            {t('calendar.groupClass')}
          </div>
          <div className='text-xs text-gray-600 dark:text-gray-400'>
            {t('calendar.upToStudents')}
          </div>
        </button>
      </div>
      <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
        {t('calendar.groupClassesInfo')}
      </p>
    </div>
  );
};

export const ScheduleLessonModal = ({
  scheduleTime,
  onScheduleTimeChange,
  selectedTopicId,
  onTopicChange,
  // selectedTeacher,
  // onTeacherChange,
  lessonType,
  onLessonTypeChange,
  selectedLevel,
  onLevelChange,
  availableTopics,
  // availableTeachers,
  lessons,
  onClose,
  selectedDate,
  tokenBalances,
  rescheduleLesson,
}: ScheduleLessonModalProps) => {
  const { t, language } = useLanguage();
  const modalWeekDates = getWeekDates(scheduleTime.week);
  selectedDate.setHours(scheduleTime.hour, scheduleTime.minute, 0, 0);
  selectedDate.setDate(modalWeekDates[scheduleTime.day].getDate());
  selectedDate.setMonth(modalWeekDates[scheduleTime.day].getMonth());
  selectedDate.setFullYear(modalWeekDates[scheduleTime.day].getFullYear());
  const timestamp = Math.floor(selectedDate.getTime() / 1000);

  const filteredLessons = rescheduleLesson
    ? lessons.filter((lesson) => lesson.id !== rescheduleLesson.id)
    : lessons;
  const isConflicting = isTimestampConflicting(timestamp, filteredLessons);
  const isTooSoon = isTimestampTooSoon(timestamp);
  const lessonTokenLabel = getLessonTokenLabel(lessonType);
  const availableTokensForType = getAvailableTokensForLessonType(
    tokenBalances,
    lessonType,
  );
  const validationMessages: string[] = [];
  if (!rescheduleLesson && availableTokensForType <= 0) {
    validationMessages.push(
      `${t('calendar.noTokenAvailablePrefix')} ${lessonTokenLabel.toLowerCase()} ${t('calendar.noTokenAvailableSuffix')}`,
    );
  }
  if (isTooSoon) {
    validationMessages.push(t('calendar.mustBeAtLeast24Hours'));
  }
  if (isConflicting) {
    validationMessages.push(t('calendar.conflictsWithExistingLesson'));
  }
  if (rescheduleLesson && timestamp === rescheduleLesson.date) {
    validationMessages.push(t('calendar.newTimeMustBeDifferent'));
  }
  const hasBlockingValidation = validationMessages.length > 0;
  const { addToast } = useToast();
  const dateLocale = language === 'ka' ? 'ka-GE' : 'en-US';
  const handleScheduleLesson = async () => {
    if (hasBlockingValidation) {
      addToast({
        title: t('calendar.cannotScheduleLesson'),
        message: validationMessages.join(' '),
        type: 'error',
      });
      return;
    }

    const date = Math.floor(selectedDate.getTime() / 1000);

    const fn = httpsCallable<
      { date: number; topicId: string; level: LevelT; lessonType: '1on1' | 'group' },
      {
        classId: string;
        lessonType: '1on1' | 'group';
        participantCount: number;
        maxParticipants: number;
      }
    >(functions, 'scheduleLesson');

    try {
      const res = await fn({
        date,
        topicId: selectedTopicId,
        level: selectedLevel,
        lessonType,
      });

      addToast({
        title: t('calendar.lessonScheduled'),
        message: t('calendar.lessonScheduledMessage'),
        type: 'success',
      });

      onClose();
      return res.data;
    } catch (err: any) {
      console.error(err);

      let message = t('calendar.failedToScheduleLesson');

      if (err.code === 'functions/failed-precondition') {
        const backendMessage =
          typeof err?.message === 'string'
            ? err.message.replace('functions/failed-precondition: ', '')
            : '';
        message =
          backendMessage ||
          `${t('calendar.notEnoughTokensPrefix')} ${lessonTokenLabel.toLowerCase()}${t('calendar.notEnoughTokensSuffix')}`;
      } else if (err.code === 'functions/unauthenticated') {
        message = t('auth.loginFailed');
      }

      addToast({
        title: t('calendar.schedulingFailed'),
        message,
        type: 'error',
      });
    }
  };
  const handleRescheduleLesson = async () => {
    if (hasBlockingValidation) {
      addToast({
        title: t('calendar.cannotRescheduleLesson'),
        message: validationMessages.join(' '),
        type: 'error',
      });
      return;
    }
    const date = Math.floor(selectedDate.getTime() / 1000);

    const fn = httpsCallable<
      { lessonId: string; date: number; topicId: string; level: LevelT },
      { classId: string }
    >(functions, 'rescheduleLesson');

    try {
      const res = await fn({
        lessonId: rescheduleLesson!.id,
        date,
        topicId: selectedTopicId,
        level: selectedLevel,
      });

      addToast({
        title: t('calendar.lessonRescheduled'),
        message: t('calendar.lessonRescheduledMessage'),
        type: 'success',
      });

      onClose();
      return res.data;
    } catch (err: any) {
      console.error(err);

      let message = t('calendar.failedToRescheduleLesson');

      if (err.code === 'functions/unauthenticated') {
        message = t('auth.loginFailed');
      } else if (err.code === 'functions/permission-denied') {
        message = t('calendar.reschedulePermissionDenied');
      }

      addToast({
        title: t('calendar.reschedulingFailed'),
        message,
        type: 'error',
      });
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='w-full max-w-lg bg-white border border-gray-200 shadow-2xl dark:bg-gray-800 dark:border-gray-700 rounded-xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className='relative p-6 bg-linear-to-r from-blue-600 to-purple-600 rounded-t-xl'>
          <button
            onClick={onClose}
            className='absolute p-2 transition-all rounded-lg top-4 right-4 hover:bg-white/10'
          >
            <X className='w-5 h-5 text-white' />
          </button>
          <h2 className='pr-10 text-2xl font-semibold text-white'>
            {rescheduleLesson ? t('calendar.rescheduleLesson') : t('calendar.scheduleNewLesson')}
          </h2>
          <div className='flex items-center gap-2 mt-2 text-white/90'>
            <Clock className='w-4 h-4' />
            <span>
              {modalWeekDates[scheduleTime.day].toLocaleDateString(dateLocale, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}{' '}
              {t('calendar.timePrefix')} {scheduleTime.hour.toString().padStart(2, '0')}:
              {scheduleTime.minute.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className='p-6 space-y-5 max-h-[70vh] overflow-y-auto'>
          {/* Week Selector for Date Picking */}
          <div>
            <label className='block mb-3 text-sm text-gray-600 dark:text-gray-400'>
              {t('calendar.selectDate')}
            </label>

            {/* Week Navigation */}
            <div className='flex items-center justify-between p-2 mb-3 rounded-lg bg-gray-50 dark:bg-gray-800/60'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleTimeChange({
                    ...scheduleTime,
                    week: scheduleTime.week - 1,
                    day: 0,
                  });
                }}
                className='p-2 text-gray-600 transition-all rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <div className='text-sm font-medium text-gray-900 dark:text-white'>
                {modalWeekDates[0].toLocaleDateString(dateLocale, {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {modalWeekDates[6].toLocaleDateString(dateLocale, {
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
                className='p-2 text-gray-600 transition-all rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                          : 'bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div
                        className={`text-[10px] mb-1 ${
                          isSelected
                            ? 'text-blue-200'
                            : isSunday
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {dayName}
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          isToday && !isSelected ? 'text-blue-500' : ''
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
            <label className='block mb-3 text-sm text-gray-600 dark:text-gray-400'>
              {t('calendar.selectTime')}
            </label>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3'>
              {/* Hour Selector */}
              <div>
                <div className='mb-2 text-xs text-gray-600 dark:text-gray-400'>
                  {t('calendar.hour')}
                </div>
                <select
                  value={scheduleTime.hour}
                  onChange={(e) => {
                    onScheduleTimeChange({
                      ...scheduleTime,
                      hour: Number(e.target.value),
                    });
                  }}
                  className='w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 transition-all focus:border-blue-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800/60 dark:text-white'
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>

              {/* Minute Selector */}
              <div>
                <div className='mb-2 text-xs text-gray-600 dark:text-gray-400'>
                  {t('calendar.minute')}
                </div>
                <div className='grid grid-cols-2 gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onScheduleTimeChange({ ...scheduleTime, minute: 0 });
                    }}
                    className={`p-3 rounded text-sm transition-all ${
                      scheduleTime.minute === 0
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    :00
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onScheduleTimeChange({ ...scheduleTime, minute: 30 });
                    }}
                    className={`p-3 rounded text-sm transition-all ${
                      scheduleTime.minute === 30
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    :30
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Time Display */}
            <div className='p-3 mt-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-600/10 dark:border-blue-600/30'>
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                <span className='text-sm text-gray-900 dark:text-white'>
                  {modalWeekDates[scheduleTime.day].toLocaleDateString(
                    dateLocale,
                    {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    },
                  )}{' '}
                  {t('calendar.timePrefix')} {scheduleTime.hour.toString().padStart(2, '0')}:
                  {scheduleTime.minute.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Validation Warning */}
            {hasBlockingValidation && (
              <div className='flex items-start gap-2 p-2 mt-2 text-xs text-red-500 border border-red-200 rounded dark:text-red-400 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30'>
                <span className='pt-0.5'>⚠️</span>
                <div className='flex flex-col gap-1'>
                  {validationMessages.map((msg, idx) => (
                    <span key={idx}>{msg}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lesson Type Selection */}
          <LessonTypeDisplay
            lessonType={lessonType}
            onLessonTypeChange={onLessonTypeChange}
            rescheduleLesson={rescheduleLesson || undefined}
          />

          {/* Teacher Selection */}
          {/* <div>
            <label className='block mb-2 text-sm text-gray-600 dark:text-gray-400'>
              Select Teacher
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => onTeacherChange(e.target.value)}
              className='w-full p-3 text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:border-blue-600 focus:outline-none'
            >
              <option value=''>Any Teacher - First available</option>
              {availableTeachers.map((teacher) => (
                <option key={teacher.first_name} value={teacher.first_name}>
                  {teacher.first_name} {teacher.last_name} -{' '}
                  {teacher.rating.toFixed(1)}★
                </option>
              ))}
            </select>
          </div> */}

          {/* Topic Selection */}
          <div>
            <label className='block mb-2 text-sm text-gray-600 dark:text-gray-400'>
              {t('calendar.lessonTopic')}
            </label>

            <select
              value={selectedTopicId}
              onChange={(e) => onTopicChange(e.target.value)}
              className='w-full p-3 text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:border-blue-600 focus:outline-none'
            >
              {availableTopics.map((topic, index) => (
                <option key={index} value={topic.id}>
                  {topic.heading}
                </option>
              ))}
            </select>
          </div>

          {/* Level Selection */}
          <div>
            <label className='block mb-2 text-sm text-gray-600 dark:text-gray-400'>
              {t('calendar.level')}
            </label>

            <select
              value={selectedLevel}
              onChange={(e) => onLevelChange(e.target.value as LevelT)}
              className='w-full p-3 text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:border-blue-600 focus:outline-none'
            >
              {LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Lesson Focus (Optional) */}
          <div>
            <label className='block mb-2 text-sm text-gray-600 dark:text-gray-400'>
              {t('calendar.lessonFocus')}
            </label>
            <textarea
              className='w-full p-3 text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-lg resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:border-blue-600 focus:outline-none'
              rows={3}
              placeholder={t('calendar.lessonFocusPlaceholder')}
            />
          </div>

          {/* Token Cost */}
          <div className='flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-600/10 dark:border-blue-600/30'>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              {t('calendar.tokenCost')}
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center w-6 h-6 text-xs font-bold bg-yellow-500 rounded-full'>
                T
              </div>
              <span className='font-semibold text-gray-900 dark:text-white'>
                1 {lessonTokenLabel}
              </span>
            </div>
          </div>
          <p className='text-xs text-gray-500 dark:text-gray-400 -mt-3'>
            {t('calendar.availableTokensForThisLessonTypePrefix')} {availableTokensForType} {t('calendar.availableTokensForThisLessonTypeSuffix')}
          </p>

          {/* Action Buttons */}
          <div className='flex gap-3 pt-2'>
            <button
              onClick={
                rescheduleLesson ? handleRescheduleLesson : handleScheduleLesson
              }
              disabled={hasBlockingValidation}
              className={`flex-1 px-4 py-3 font-medium text-white transition-all rounded-lg ${
                hasBlockingValidation
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {rescheduleLesson ? t('calendar.reschedule') : t('calendar.scheduleLesson')}
            </button>
            <button
              onClick={onClose}
              className='px-4 py-3 text-gray-900 transition-all bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            >
              {t('calendar.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
