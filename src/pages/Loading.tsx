import { BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Loading() {
  const { t } = useLanguage();

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background'>
      <div className='flex flex-col items-center justify-center gap-6'>
        <div className='relative'>
          <div className='absolute inset-0 w-24 h-24 border-4 rounded-full border-brand/20 border-t-brand animate-spin' />
          <div className='flex items-center justify-center w-24 h-24 rounded-full brand-mark animate-pulse'>
            <BookOpen className='w-12 h-12' />
          </div>
        </div>

        <div className='space-y-2 text-center'>
          <h2 className='text-2xl font-semibold text-foreground'>British World</h2>
          <p className='text-sm text-muted-foreground'>{t('auth.loading')}</p>
        </div>

        <div className='flex gap-2'>
          <div
            className='w-3 h-3 rounded-full bg-brand animate-bounce'
            style={{ animationDelay: '0ms' }}
          />
          <div
            className='w-3 h-3 rounded-full bg-violet-400 animate-bounce'
            style={{ animationDelay: '150ms' }}
          />
          <div
            className='w-3 h-3 rounded-full bg-brand animate-bounce'
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
