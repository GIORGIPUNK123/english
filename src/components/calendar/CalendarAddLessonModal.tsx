export const CalendarAddLessonModal = (props: {
  isOn: boolean;
  setIsOn: any;
}) => {
  return (
    <div
      className={` relative w-[90%] right-0 top-60  ${
        props.isOn ? 'block' : 'hidden'
      }`}
    >
      <div className='flex absolute top-1/2 left-1/2 z-50 justify-center w-full transform -translate-x-1/2 -translate-y-1/2'>
        <div className='overflow-y-auto overflow-x-hidden flex flex-col z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full'>
          <div className='relative p-4 w-full max-w-2xl max-h-full'>
            <div className='relative bg-white rounded-lg shadow dark:bg-gray-700'>
              <div className='flex justify-between items-center p-4 rounded-t border-b md:p-5 dark:border-gray-600'>
                <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  Terms of Service
                </h3>
                <button
                  type='button'
                  className='inline-flex justify-center items-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 ms-auto dark:hover:bg-gray-600 dark:hover:text-white'
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
              <div className='p-4 space-y-4 md:p-5'>
                <p className='text-base leading-relaxed text-gray-500 dark:text-gray-400'>
                  With less than a month to go before the European Union enacts
                  new consumer privacy laws for its citizens, companies around
                  the world are updating their terms of service agreements to
                  comply.
                </p>
                <p className='text-base leading-relaxed text-gray-500 dark:text-gray-400'>
                  The European Union’s General Data Protection Regulation
                  (G.D.P.R.) goes into effect on May 25 and is meant to ensure a
                  common set of data rights in the European Union. It requires
                  organizations to notify users as soon as possible of high-risk
                  data breaches that could personally affect them.
                </p>
              </div>
              <div className='flex items-center p-4 rounded-b border-t border-gray-200 md:p-5 dark:border-gray-600'>
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
