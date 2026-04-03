import { Star } from 'lucide-react';

export const FavoriteTeachers = () => {
  const favoriteTeachers = [
    {
      name: 'Sarah Johnson',
      specialty: 'Business English',
      rating: 4.9,
      lessons: 12,
      avatar: 'SJ',
      color: 'bg-blue-500',
    },
    {
      name: 'Michael Chen',
      specialty: 'Conversation',
      rating: 5.0,
      lessons: 8,
      avatar: 'MC',
      color: 'bg-purple-500',
    },
    {
      name: 'Emma Williams',
      specialty: 'Grammar',
      rating: 4.8,
      lessons: 6,
      avatar: 'EW',
      color: 'bg-green-500',
    },
  ];
  return (
    <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'>
      <h2 className='mb-4 text-lg text-gray-900 dark:text-white sm:text-xl'>
        Your Favorite Teachers
      </h2>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {favoriteTeachers.map((teacher) => (
          <div
            key={teacher.name}
            className='flex items-center gap-3 p-3 transition-all border border-gray-200 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <div
              className={`w-12 h-12 rounded-full ${teacher.color} flex items-center justify-center shrink-0`}
            >
              <span className='font-semibold text-white'>{teacher.avatar}</span>
            </div>
            <div className='flex-1 min-w-0'>
              <h4 className='mb-1 text-sm text-gray-900 dark:text-white sm:text-base'>
                {teacher.name}
              </h4>
              <p className='mb-1 text-xs text-gray-600 dark:text-gray-400'>
                {teacher.specialty}
              </p>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  <Star className='w-3 h-3 text-yellow-400 fill-yellow-400' />
                  <span className='text-xs text-gray-600 dark:text-gray-400'>
                    {teacher.rating}
                  </span>
                </div>
                <span className='text-xs text-gray-500'>•</span>
                <span className='text-xs text-gray-500'>
                  {teacher.lessons} lessons
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
