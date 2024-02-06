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
    <td
      className={`w-20 h-full   ${
        props.disabled
          ? ' bg-slate-300 '
          : ' bg-slate-200 hover:bg-gray-300 cursor-pointer'
      } `}
    >
      <div
        className='flex justify-center items-center w-full h-full'
        onClick={() => {
          !props.disabled &&
            props.setIsModalOn(true) &&
            console.log('clicked on button');
        }}
      >
        {props.disabled ? <span className='text-sm'>disabled</span> : null}

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
    </td>
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
export const RenderTimeBlocks = (props: { arr: string[] }) =>
  props.arr.map((time) => (
    <TimeBlock key={time} disabled={false} time={time} />
  ));
