import { BlockT } from '../../types';

export const Lesson = (props: { name: string; time: string }) => {
  return (
    <div className='p-1 mb-1 text-sm text-white bg-purple-400 rounded event'>
      <span className='event-name'> {props.name} </span>
      <span className='time'> {props.time} </span>
    </div>
  );
};
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
  console.log('hovered: ', props.hovered, ' hasLesson: ', hasLesson);
  return (
    <div
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      className={`w-full h-10 hour-block cursor-pointer
        ${props.disabled ? ' bg-gray-200 cursor-default' : 'bg-white'}
        ${props.disabledForHover ? ' disabled cursor-default' : ''}
        ${props.hovered && !hasLesson ? '!bg-[#c3c3c3]' : ''}
        ${props.border ? 'border-2 border-solid border-torch-red-700' : ''}
        ${hasLesson ? '!bg-black-pearl-800 hover:!bg-black-pearl-700' : ''}
        ${
          hasLesson && isStart
            ? 'rounded-t-lg'
            : hasLesson
            ? 'rounded-b-lg'
            : ''
        }
      `}
    >
      <div
        className='flex items-center justify-center w-full h-full'
        onClick={() => {
          if (!props.disabled) {
            props.setDefaultBlockDate(props.date);
            props.setIsModalOn(true);
          }
        }}
      >
        {props.name && (
          <button
            data-modal-target='default-modal'
            data-modal-toggle='default-modal'
            className={`inset-0 flex-col justify-center items-center w-[90%] h-[80%] text-white ${
              props.disabled ? 'bg-purple-950' : 'bg-purple-400'
            }  rounded text-md text-center`}
          >
            <span className='text-sm'>{props.name}</span>
            <span className='text-sm'>{props.time}</span>
          </button>
        )}
      </div>
    </div>
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
