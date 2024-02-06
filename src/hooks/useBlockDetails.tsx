import { BlockDetailsT, LessonT } from '../types';

export const useBlockDetails = (
  blockTime: number,
  blockDay: number,
  blockMonth: number,
  blockYear: number,
  currDate: Date,
  lessons: LessonT[]
): BlockDetailsT => {
  const d = new Date(blockYear, blockMonth, blockDay);
  const localTimezoneOffset = d.getTimezoneOffset() / 60;
  d.setHours(blockTime + localTimezoneOffset, 0, 0, 0);

  const currLesson = lessons.find(
    (lesson) =>
      lesson.day === blockDay &&
      lesson.time === blockTime &&
      lesson.month === blockMonth
  );
  const localHour = d.getHours();
  const isCurrentDay =
    blockDay === currDate.getDate() &&
    blockMonth === currDate.getMonth() &&
    blockYear === currDate.getFullYear();

  const isDisabled =
    localHour >= 20 ||
    localHour < 5 ||
    isCurrentDay ||
    (blockDay < currDate.getDate() &&
      blockMonth === currDate.getMonth() &&
      blockYear === currDate.getFullYear());

  const blockDetails = {
    date: d,
    isDisabled,
    currLesson: currLesson || null,
  };
  return blockDetails;
};
