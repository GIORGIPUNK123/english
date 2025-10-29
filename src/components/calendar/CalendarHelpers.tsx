import { useState } from 'react';
import { BlockT } from '../../types';
import { ViewLessonModal } from '../progress/ViewLessonModal';

const checkIfLessonExists = (lessonDate: number, blockTime: number) => {
  // const blockTime = parseInt(props.date.getTime().toString().slice(0, -3));

  if (blockTime - lessonDate === 0) {
    return { hasLesson: true, isStart: true };
  } else if (blockTime - lessonDate === 1800) {
    return { hasLesson: true, isStart: false };
  } else {
    return { hasLesson: false, isStart: false };
  }
};
export const Block = (props: BlockT) => {
  const blockTime = parseInt(props.date.getTime().toString().slice(0, -3));
  const match = props.lessons
    .map((lesson) => checkIfLessonExists(lesson.date, blockTime))
    .find((res) => res.hasLesson);
  const { hasLesson, isStart } = match ?? { hasLesson: false, isStart: false };
  const [modalOpen, setModalOpen] = useState(false);
  // console.log('hovered: ', props.hovered, ' hasLesson: ', hasLesson);

  // ${props.disabledForHover ? ' disabled cursor-default' : ''}
  // ${props.hovered && !hasLesson ? '!bg-[#c3c3c3]' : ''}
  return (
    <>
      <div
        onClick={() => {
          if (!props.disabled && !props.hasLesson) {
            props.setIsModalOn(true);
            props.setDefaultBlockDate(props.date);
          } else if (props.hasLesson) {
            setModalOpen(true);
          }
        }}
        className={`w-full h-10 hour-block relative group
        ${
          props.disabled
            ? ' bg-gray-200 cursor-default hour-block-disabled'
            : 'bg-white cursor-pointer '
        }
          ${props.border ? 'border-2 border-solid border-torch-red-700' : ''}
          ${hasLesson ? '!bg-black-pearl-900  has-lesson' : ''}
          ${
            props.disabled || hasLesson
              ? ''
              : 'hover:bg-black-pearl-900 hover:rounded-t-lg'
          }
          ${
            hasLesson && isStart
              ? 'rounded-t-lg'
              : hasLesson
              ? 'rounded-b-lg'
              : ''
          }
          justify-center
          flex
        `}
      >
        <div
          className={` ${props.currLesson ? '' : 'hidden'} 
          shadow-lg cursor-pointer absolute flex items-center justify-center top-0 w-[100%] h-20 z-10 hover:bg-black-pearl-800 duration-300 transition-transform rounded-lg hover:scale-110`}
        >
          <p className='text-base text-white'>
            {props.currLesson?.topic?.heading}
          </p>
        </div>

        {/* <div className='absolute top-0 hidden w-full h-10 bg-red-600 group-hover:block'></div>
        <div className='absolute hidden w-full h-10 bg-red-600 top-full group-hover:block'></div> */}
      </div>
      {props.currLesson ? (
        <ViewLessonModal
          isOn={modalOpen}
          setIsOn={setModalOpen}
          lesson={{
            ...props.currLesson,
            description:
              'It is very important to attend this lesson. Please be on time. We will cover the topic in detail. Make sure to review the materials beforehand. If you have any questions, feel free to ask during the lesson. Looking forward to seeing you there! Thank you for your attention.',
          }}
          isWithin48Hours={
            props.currLesson.date - Math.floor(Date.now() / 1000) < 172800
          }
        />
      ) : null}
    </>
  );
};
export const TimeBlock = (props: { time: string; disabled: boolean }) => {
  return (
    <div
      className={`flex flex-col items-center h-20 ${
        props.disabled ? 'bg-slate-200' : ''
      } `}
    >
      <span>{props.time}</span>
    </div>
  );
};
export const RenderTimeBlocks = () =>
  Array(24)
    .fill(0)
    .map((_, hour) => {
      const time = `${hour}:00`;
      return <TimeBlock key={time} disabled={false} time={time} />;
    });
