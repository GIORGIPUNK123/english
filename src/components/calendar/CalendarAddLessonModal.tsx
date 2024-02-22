import { SelectInput } from '../../atoms/SelectInput';
import { TopicT, selectSmallObjectT } from '../../types';
import { useSelectInput } from '../../hooks/useSelectInput';

export const CalendarAddLessonModal = (props: {
  isOn: boolean;
  setIsOn: any;
  topicsArr: TopicT[];
  defaultDate: Date;
  selectObjects: {
    hoursObj: selectSmallObjectT;
    topicsObj: selectSmallObjectT;
  };
  setDefaultBlockDate: (date: Date) => void;
}) => {
  console.log('selectObjects: ', props.selectObjects);

  const { value: hour, handleChange: handleHourChange } = useSelectInput(
    props.selectObjects.hoursObj.defaultId,
    props.selectObjects.hoursObj.options
  );
  console.log('defaultDate: ', props.defaultDate);
  return (
    <div
      className={` relative w-[90%] right-0 top-60  ${
        props.isOn ? 'block' : 'hidden'
      }`}
    >
      <div className='fixed z-50 flex justify-center w-full transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2'>
        <div className='overflow-y-auto overflow-x-hidden flex flex-col z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full'>
          <div className='relative w-full max-w-[1512px] px-44 max-h-full '>
            <div className='relative border-8 border-solid rounded-lg shadow bg-black-pearl-950 border-black-pearl-800'>
              <div className='flex items-center justify-between p-4 text-center border-b rounded-t md:p-5 dark:border-gray-600'>
                <h3 className='w-full text-2xl font-semibold text-gray-900 dark:text-white'>
                  Schedule Lesson
                </h3>
                <button
                  type='button'
                  className='inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 ms-auto dark:hover:bg-gray-600 dark:hover:text-white'
                  onClick={() => {
                    props.setIsOn((x: boolean) => !x);
                  }}
                >
                  <svg
                    className='w-3 h-3'
                    aria-hidden='true'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 14 14'
                  >
                    <path
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                    />
                  </svg>
                  <span className='sr-only'>Close modal</span>
                </button>
              </div>
              <div className='p-4 space-y-4 md:p-5 '>
                <h3 className='text-xl leading-relaxed text-white '>
                  Choose Topic
                </h3>

                <p>Selected value: {hour}</p>
                {/* <SelectInput
                  inputId='topicInput'
                  selectArr={props.topicsArr}
                  selectedTopicId={selectedTopicId}
                  setSelectedTopicId={setSelectedTopicId}
                  isTopic={true}
                /> */}
                <h3 className='text-xl leading-relaxed text-white '>
                  Choose Date
                </h3>

                <h3 className='text-xl leading-relaxed text-white '>
                  Choose Hour
                </h3>
                <SelectInput
                  value={hour}
                  onChange={handleHourChange}
                  options={props.selectObjects.hoursObj.options}
                />
                {/* <SelectInput
                  defaultValue={14}
                  inputId='hoursInput'
                  selectArr={generateHoursArr()}
                  selectedTopicId={selectedTopicId}
                  setSelectedTopicId={setSelectedTopicId}
                /> */}
                <h3 className='text-xl leading-relaxed text-white '>
                  default hour + minutes: {props.defaultDate?.getHours()}:
                  {props.defaultDate?.getMinutes().toString().length == 1
                    ? `0${props.defaultDate?.getMinutes()}`
                    : props.defaultDate?.getMinutes()}
                </h3>
                <h3 className='text-xl leading-relaxed text-white '>
                  {props.defaultDate?.toString()}
                </h3>
              </div>
              <div className='flex items-center p-4 border-t border-gray-200 rounded-b md:p-5 dark:border-gray-600'>
                <button
                  type='button'
                  className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                  onClick={() => {
                    props.setIsOn((x: boolean) => !x);
                  }}
                >
                  I accept
                </button>
                <button
                  type='button'
                  className='ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600'
                  onClick={() => {
                    props.setIsOn((x: boolean) => !x);
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
