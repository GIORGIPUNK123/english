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
  const [hoveredBlock, setHoveredBlock] = useState<{
    row: number;
    col: number;
    canHover: boolean;
  } | null>(null);

  const weekdays = useMemo(() => [0, 1, 2, 3, 4, 5, 6], []);
  const availableBlocks = useMemo(
    () => Array.from({ length: 48 }, (_, i) => i),
    []
  );

  // Precompute all block details to avoid repeated calculations
  const allBlockDetails = useMemo(() => {
    const blocks: {
      date: Date;
      isDisabled: boolean;
      currLesson?: LessonT;
    }[][] = [];

    availableBlocks.forEach((rowIdx) => {
      const row: (typeof blocks)[0] = [];
      weekdays.forEach((dayOffset) => {
        const [currHour, currMinute] = myGetHourCorrectly(rowIdx / 2);
        const { date, isDisabled, currLesson } = useBlockDetails(
          currMinute,
          currHour,
          props.monday.getDate() + dayOffset,
          props.monday.getMonth(),
          props.monday.getFullYear(),
          props.lessons
        );

        // Make sure currLesson is undefined instead of null
        row.push({ date, isDisabled, currLesson: currLesson ?? undefined });
      });
      blocks.push(row);
    });

    return blocks;
  }, [availableBlocks, weekdays, props.lessons, props.monday]);

  return (
    <div className='flex flex-col w-full'>
      {allBlockDetails.map((row, rowIdx) => (
        <div key={rowIdx} className='flex w-full'>
          {row.map(({ date, isDisabled, currLesson }, colIdx) => {
            const nextDate = new Date(date.getTime() + 30 * 60 * 1000);
            const currentOccupied = isBlockOccupied(date, props.lessons);
            const nextOccupied = isBlockOccupied(nextDate, props.lessons);
            const pairCanHover = !currentOccupied && !nextOccupied;
            const disabledForHover = currentOccupied || nextOccupied;

            const hovered = hoveredBlock?.canHover
              ? (hoveredBlock.row === rowIdx && hoveredBlock.col === colIdx) ||
                (hoveredBlock.row + 1 === rowIdx && hoveredBlock.col === colIdx)
              : null; // <-- use null instead of false

            const lessonHover =
              hoveredBlock && hoveredBlock.canHover
                ? {
                    isHovering:
                      hoveredBlock.row === rowIdx && hoveredBlock.col === colIdx
                        ? true
                        : hoveredBlock.row + 1 === rowIdx &&
                          hoveredBlock.col === colIdx
                        ? true
                        : false,
                    isStart:
                      hoveredBlock.row === rowIdx &&
                      hoveredBlock.col === colIdx,
                  }
                : { isHovering: false, isStart: false };

            return (
              <div className='w-full' key={`${rowIdx}-${colIdx}`}>
                <Block
                  border={false}
                  date={date}
                  name={currLesson?.topic}
                  disabled={isDisabled}
                  disabledForHover={disabledForHover}
                  setIsModalOn={props.setIsModalOn}
                  setDefaultBlockDate={props.setDefaultBlockDate}
                  hasLesson={currentOccupied}
                  hovered={hovered}
                  lessonHover={lessonHover}
                  lessons={props.lessons}
                  onMouseEnter={() => {
                    if (!isDisabled) {
                      setHoveredBlock({
                        row: rowIdx,
                        col: colIdx,
                        canHover: pairCanHover,
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredBlock(null)}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
