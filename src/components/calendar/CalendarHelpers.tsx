import { BlockT } from '../../types';

export const Lesson = (props: { name: string; time: string }) => {
  return (
    <div className='p-1 mb-1 text-sm text-white bg-purple-400 rounded event'>
      <span className='event-name'> {props.name} </span>
      <span className='time'> {props.time} </span>
    </div>
  );
};
export const Block = (props: BlockT) => {
  return (
    <div
      className={`w-full h-10 hour-block ${
        props.disabled
          ? ' bg-slate-300 disabled'
          : ' bg-slate-200 hover:bg-gray-300 cursor-pointer'
      } `}
    >
      <div
        className='flex items-center justify-center w-full h-full'
        onClick={() => {
          if (!props.disabled) {
            console.log('block date: ', props.date);

            props.setClickedBlockDate(props.date);
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
