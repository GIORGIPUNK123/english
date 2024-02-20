import { BlockDetailsT, LessonT } from '../types';

export const useBlockDetails = (
  blockMinutes: number,
  blockHours: number,
  blockDay: number,
  blockMonth: number,
  blockYear: number,
  lessons: LessonT[]
): BlockDetailsT => {
  const currDate = new Date();
  const localBlockDate = new Date(
    blockYear,
    blockMonth,
    blockDay,
    Math.floor(blockHours),
    (blockHours % 1) * 60
  );

  // Convert localBlockDate to UTC
  const localToUTC = new Date(
    localBlockDate.getTime() + localBlockDate.getTimezoneOffset() * 60000
  );
  const currLesson = lessons.find((lesson) => {
    // Compare lesson.date timestamp with localBlockDate timestamp converted to UTC
    lesson.date === localToUTC.getTime()
      ? console.log('current Lesson Yay')
      : null;

    // console.log('localToUTC.getTime(): ', localToUTC.getTime())
    return lesson.date === localToUTC.getTime();
  });

  const isAfter20UTC = localBlockDate.getUTCHours() >= 20;
  const isBefore5UTC = localBlockDate.getUTCHours() <= 5;

  const timeDifference = localBlockDate.getTime() - currDate.getTime();
  // Calculate the difference in hours
  const hoursDifference = timeDifference / (1000 * 3600);
  // Check if date2 is after date1 or if it's within 12 hours from date1
  const isWithin12Hours = hoursDifference <= 12;
  // localBlockDate.getTime() - currUTCDate.getTime() < 12 * 60 * 60 * 1000;
  // Disable block if it is after 20:00 UTC and before 05:00 UTC, or within 12 hours of the current UTC date
  const isDisabled = isWithin12Hours || isAfter20UTC || isBefore5UTC;
  currLesson ? console.log('current Lesson Yay') : null;
  const blockDetails = {
    date: localBlockDate,
    isDisabled,
    currLesson: currLesson || null,
  };

  return blockDetails;
};
