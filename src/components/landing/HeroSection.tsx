import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section id='home' className='relative px-4 py-16 overflow-hidden sm:px-6 sm:py-20 lg:px-8'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-linear-to-br from-blue-500/10 via-purple-500/10 to-transparent dark:from-blue-500/5 dark:via-purple-500/5'></div>

      <div className='relative mx-auto max-w-7xl'>
        <div className='grid items-center gap-12 lg:grid-cols-2'>
          {/* Left side - Text content */}
          <div className='space-y-8'>
            <div className='inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20'>
              <span className='w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0'></span>
              <span className='text-xs font-medium sm:text-sm text-blue-600 dark:text-blue-400'>
                {t('landing.heroBadge')}
              </span>
            </div>

            <div className='space-y-4'>
              <h1 className='text-[clamp(2.15rem,4vw,3.5rem)] font-bold leading-[1.2] text-foreground'>
                <span className='block'>{t('landing.heroTitlePre')}</span>
                <span className='block text-transparent bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text pb-[0.12em]'>
                  {t('landing.heroTitleEmphasis')}
                </span>
              </h1>
              <p className='max-w-2xl text-base sm:text-lg lg:text-xl text-muted-foreground'>
                {t('landing.heroSubtitle')}
              </p>
            </div>

            <div className='flex flex-col gap-4 sm:flex-row'>
              <Link
                to='/register'
                className='inline-flex items-center justify-center w-full px-8 py-4 sm:w-auto btn-primary group'
              >
                {t('landing.heroPrimaryCta')}
                <ArrowRight className='w-5 h-5 ml-2 transition-transform group-hover:translate-x-1' />
              </Link>
              <Link
                to='/register'
                className='inline-flex items-center justify-center w-full px-8 py-4 font-medium transition-all duration-300 border-2 rounded-lg sm:w-auto bg-background dark:bg-card border-border text-foreground hover:bg-accent'
              >
                {t('header.teach')}
              </Link>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-1 gap-6 pt-6 border-t sm:grid-cols-3 sm:gap-8 sm:pt-8 border-border'>
              <div>
                <div className='text-3xl font-bold text-foreground'>10K+</div>
                <div className='text-sm text-muted-foreground'>
                  {t('landing.heroStatsStudents')}
                </div>
              </div>
              <div>
                <div className='text-3xl font-bold text-foreground'>500+</div>
                <div className='text-sm text-muted-foreground'>
                  {t('landing.heroStatsTeachers')}
                </div>
              </div>
              <div>
                <div className='text-3xl font-bold text-foreground'>4.9/5</div>
                <div className='text-sm text-muted-foreground'>
                  {t('landing.heroStatsRating')}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Image */}
          <div className='relative'>
            <div className='relative overflow-hidden border shadow-2xl rounded-2xl border-border'>
              <img
                src='https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'
                alt='Students learning English online'
                className='w-full h-auto'
              />
              {/* Overlay card */}
              <div className='absolute p-4 border shadow-xl bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 sm:p-6 bg-card/95 backdrop-blur-sm border-border rounded-xl'>
                <div className='flex items-center space-x-4'>
                  <div className='flex items-center justify-center w-12 h-12 rounded-full brand-mark'>
                    <span className='text-lg font-bold'>BW</span>
                  </div>
                  <div className='flex-1'>
                    <div className='text-sm font-medium text-foreground'>
                      {t('landing.heroNextLesson')}
                    </div>
                    <div className='text-xl font-bold text-transparent sm:text-2xl bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text'>
                      {t('landing.heroNextLessonCountdown')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
