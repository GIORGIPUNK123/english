import { useState, useMemo } from 'react';
import { useBlockDetails } from '../../hooks/useBlockDetails';
import { LessonT } from '../../types';
import { myGetHourCorrectly } from '../../utils/calendarUtils';
import { Block } from './CalendarHelpers';

const isBlockOccupied = (blockDate: Date, lessons: LessonT[]): boolean => {
  const blockUnix = Math.floor(blockDate.getTime() / 1000);
  return lessons.some((lesson) => {
    const diff = blockUnix - lesson.date;
    return diff === 0 || diff === 1800;
  });
};

export const CalendarBody = (props: {
  monday: Date;
  lessons: LessonT[];
  setIsModalOn: (x: boolean) => void;
  setDefaultBlockDate: (d: Date) => void;
}) => {
  const weekdays = [0, 1, 2, 3, 4, 5, 6];
  const availableBlocks = Array.from({ length: 48 }, (_, i) => i);

  // Precompute all blocks to avoid repeated calculations
  const allBlocks = weekdays.map((dayOffset) =>
    availableBlocks.map((blockIdx) => {
      const [hour, minute] = myGetHourCorrectly(blockIdx / 2);
      const { date, isDisabled, currLesson } = useBlockDetails(
        minute,
        hour,
        props.monday.getDate() + dayOffset,
        props.monday.getMonth(),
        props.monday.getFullYear(),
        props.lessons
      );
      return { date, isDisabled, currLesson };
    })
  );
  console.log('lessons: ', props.lessons);
  return (
    <div className='flex w-full'>
      {allBlocks.map((column, colIdx) => (
        <div key={colIdx} className='flex flex-col w-full'>
          {column.map(({ date, isDisabled, currLesson }, rowIdx) => {
            // console.log('current Lesson: ', currLesson);
            const beforeLesson = column[rowIdx - 1]
              ? column[rowIdx - 1].currLesson
              : null;
            // console.log('beforeLesson: ', beforeLesson);
            if (currLesson) {
              return (
                <Block
                  key={`${rowIdx}-${colIdx}`}
                  date={date}
                  currLesson={currLesson}
                  // startTopic={currLesson?.topic}
                  // name={currLesson?.topic?.heading}
                  disabled={isDisabled}
                  setIsModalOn={props.setIsModalOn}
                  setDefaultBlockDate={props.setDefaultBlockDate}
                  lessons={props.lessons}
                  hasLesson={isBlockOccupied(date, props.lessons)}
                  border={false}
                  // nextLesson={nextLesson}
                  // className="hour-block"
                />
              );
            } else {
              return (
                <Block
                  key={`${rowIdx}-${colIdx}`}
                  date={date}
                  endTopic={beforeLesson?.topic}
                  // name={beforeLesson?.topic?.heading || null}
                  disabled={isDisabled}
                  setIsModalOn={props.setIsModalOn}
                  setDefaultBlockDate={props.setDefaultBlockDate}
                  lessons={props.lessons}
                  hasLesson={isBlockOccupied(date, props.lessons)}
                  border={false}
                  // nextLesson={nextLesson}
                  // className="hour-block"
                />
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};
