import { LessonT } from '../../types';
// Current time as Unix timestamp
export const getCurrentTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

// Format timestamp to display time string
export const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Format timestamp to display date string
export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Get week dates for a specific week offset
export const getWeekDates = (weekOffset: number) => {
  const today = new Date();
  const monday = new Date(today);
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + daysToMonday + weekOffset * 7);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Create timestamp from day index, hour, and minute
export const createTimestamp = (
  weekDates: Date[],
  dayIndex: number,
  hour: number,
  minute: number,
) => {
  const date = new Date(weekDates[dayIndex]);
  date.setHours(hour, minute, 0, 0);
  return Math.floor(date.getTime() / 1000);
};

// Check if a timestamp conflicts with existing lessons
export const isTimestampConflicting = (
  timestamp: number,
  lessons: LessonT[],
) => {
  const slotStart = timestamp;
  const slotEnd = slotStart + 3600; // 1 hour lesson (3600 seconds)

  return lessons.some((event) => {
    // Check if there's any overlap
    return slotStart < event.date + 3600 && slotEnd > event.date;
  });
};

// Check if a timestamp is at least 6 hours in the future
export const isTimestampTooSoon = (timestamp: number) => {
  const now = getCurrentTimestamp();
  const sixHoursFromNow = now + 21600; // 6 hours = 21600 seconds

  return timestamp < sixHoursFromNow;
};

// Get color based on lesson status
export const getLessonColor = (lesson: LessonT) => {
  if (!lesson.teacher) return 'bg-orange-500'; // Pending - no teacher assigned

  switch (lesson.status) {
    case 'scheduled':
      return 'bg-blue-500';
    case 'in-progress':
      return 'bg-green-500';
    case 'finished':
      return 'bg-gray-500';
    case 'missed_student':
      return 'bg-red-500';
    case 'missed_teacher':
      return 'bg-red-500';
    case 'cancelled_student':
      return 'bg-gray-600';
    case 'cancelled_teacher':
      return 'bg-gray-600';
    default:
      return 'bg-blue-500';
  }
};

// Check if an event falls on a specific day and hour
export const isEventInDayAndHour = (
  event: LessonT,
  dayIndex: number,
  hour: number,
  weekDates: Date[],
) => {
  const eventStartDate = new Date(event.date * 1000);
  const weekDay = weekDates[dayIndex];

  // Check if event is on the same day
  const isSameDay =
    eventStartDate.getFullYear() === weekDay.getFullYear() &&
    eventStartDate.getMonth() === weekDay.getMonth() &&
    eventStartDate.getDate() === weekDay.getDate();

  // Check if event starts in this hour
  const eventHour = eventStartDate.getHours();

  return isSameDay && eventHour === hour;
};
