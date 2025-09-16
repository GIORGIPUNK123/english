type Lesson = {
  topic: string;
  teacher: string;
  date: Date;
  status: string;
  description?: string;
};

export const ViewLessonModal = (props: {
  isOn: boolean;
  setIsOn: (v: boolean) => void;
  lesson: Lesson;
}) => {
  const { topic, teacher, date, status, description } = props.lesson;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${
        props.isOn ? '' : 'hidden'
      }`}
    >
      <div className='relative w-full max-w-lg p-8 bg-white shadow-2xl dark:bg-black-pearl-950 rounded-xl'>
        <button
          className='absolute text-gray-400 top-4 right-4 hover:text-gray-900 dark:hover:text-white'
          onClick={() => props.setIsOn(false)}
        >
          <span className='sr-only'>Close modal</span>
          <svg className='w-5 h-5' fill='none' viewBox='0 0 20 20'>
            <path
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 6l8 8M6 14L14 6'
            />
          </svg>
        </button>
        <h2 className='mb-4 text-2xl font-bold text-black dark:text-white'>
          {topic}
        </h2>
        <div className='mb-2 text-lg text-gray-700 dark:text-gray-300'>
          <span className='font-semibold'>Teacher:</span> {teacher}
        </div>
        <div className='mb-2 text-lg text-gray-700 dark:text-gray-300'>
          <span className='font-semibold'>Date & Time:</span>{' '}
          {date.toLocaleString()}
        </div>
        <div className='mb-4 text-lg text-gray-700 dark:text-gray-300'>
          <span className='font-semibold'>Status:</span>{' '}
          <span
            className={
              status === 'finished'
                ? 'text-green-600'
                : status === 'scheduled'
                ? 'text-blue-600'
                : 'text-red-600'
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        {description && (
          <div className='mb-4 text-gray-600 dark:text-gray-400'>
            <span className='font-semibold'>Description:</span> {description}
          </div>
        )}
        <div className='flex justify-end mt-6'>
          <button
            className='px-6 py-2 text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700'
            onClick={() => props.setIsOn(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
