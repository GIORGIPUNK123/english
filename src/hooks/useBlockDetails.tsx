import { BlockDetailsT, LessonT } from '../types';
import { convertLocalDateToUTC } from '../utils/calendarUtils';

export const useBlockDetails = (
  blockMinutes: number,
  blockHours: number,
  blockDay: number,
  blockMonth: number,
  blockYear: number,
  lessons: LessonT[]
): BlockDetailsT => {
  // Create block date object
  const blockDate = new Date(
    blockYear,
    blockMonth,
    blockDay,
    blockHours,
    blockMinutes
  );

  // Convert to UTC
  const blockUTC = convertLocalDateToUTC(blockDate);

  // Find matching lesson
  const lesson = lessons.find((l) => l.date === blockDate.getTime() / 1000);

  // Check if within 12 hours
  const nowUTC = convertLocalDateToUTC(new Date());
  const diffHours = (blockUTC.getTime() - nowUTC.getTime()) / (1000 * 60 * 60);
  const isWithin12Hours = diffHours <= 12;

  // Check time range
  const isAfter8pmUTC = blockUTC.getHours() >= 20;
  const isBefore5amUTC = blockUTC.getHours() <= 5;
  const checkMinutes = () => {
    if (blockUTC.getHours() === 20 || blockUTC.getHours() === 5) {
      if (blockUTC.getMinutes() === 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };
  // Determine if disabled
  const isDisabled =
    isWithin12Hours || isAfter8pmUTC || isBefore5amUTC || !checkMinutes();

  return {
    date: Math.floor(blockDate.getTime() / 1000),
    isDisabled,
    currLesson: lesson || null,
  };
};
