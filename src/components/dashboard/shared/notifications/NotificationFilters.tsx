import { ArrowDownNarrowWide } from 'lucide-react';

interface NotificationFiltersProps {
  filter: 'all' | 'unread' | 'read';
  sortOrder: 'newest' | 'oldest';
  onFilterChange: (filter: 'all' | 'unread' | 'read') => void;
  onSortToggle: () => void;
}

export const NotificationFilters = ({
  filter,
  sortOrder,
  onFilterChange,
  onSortToggle,
}: NotificationFiltersProps) => {
  return (
    <div className='flex flex-col items-start justify-between gap-3 mb-6 sm:flex-row sm:items-center'>
      <div className='flex flex-wrap gap-2'>
        <button
          onClick={() => onFilterChange('all')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onFilterChange('unread')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => onFilterChange('read')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            filter === 'read'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Read
        </button>
      </div>

      <button
        onClick={onSortToggle}
        className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors bg-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
      >
        <ArrowDownNarrowWide className='w-4 h-4' />
        {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
      </button>
    </div>
  );
};
