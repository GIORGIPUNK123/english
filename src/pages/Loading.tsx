import { BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Loading() {
  const { t } = useLanguage();

  return (
    <div className='fixed inset-0 bg-[#0f0f0f] dark flex items-center justify-center z-50'>
      <div className='flex flex-col items-center justify-center gap-6'>
        {/* Animated Logo/Icon */}
        <div className='relative'>
          {/* Outer spinning ring */}
          <div className='absolute inset-0 w-24 h-24 border-4 rounded-full border-blue-500/20 border-t-blue-500 animate-spin'></div>

          {/* Inner pulsing circle */}
          <div className='flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-blue-600 to-purple-600 animate-pulse'>
            <BookOpen className='w-12 h-12 text-white' />
          </div>
        </div>

        {/* Loading Text */}
        <div className='space-y-2 text-center'>
          <h2 className='text-2xl font-semibold text-white'>
            British World
          </h2>
          <p className='text-sm text-gray-400'>{t('auth.loading')}</p>
        </div>

        {/* Animated Dots */}
        <div className='flex gap-2'>
          <div
            className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
