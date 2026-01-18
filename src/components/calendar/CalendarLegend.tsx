export function CalendarLegend() {
  return (
    <div className='flex flex-wrap items-center gap-3 mb-4'>
      <div className='flex items-center gap-2'>
        <div className='w-3 h-3 bg-blue-500 rounded'></div>
        <span className='text-xs text-gray-400'>1-on-1 Lesson</span>
      </div>
      <div className='flex items-center gap-2'>
        <div className='w-3 h-3 bg-green-500 rounded'></div>
        <span className='text-xs text-gray-400'>Group Class</span>
      </div>
      <div className='flex items-center gap-2'>
        <div className='w-3 h-3 bg-orange-500 rounded'></div>
        <span className='text-xs text-gray-400'>Pending</span>
      </div>
    </div>
  );
}
