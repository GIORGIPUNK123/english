import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
export const HeroSection = () => {
  return (
    <section className='relative px-4 py-20 overflow-hidden sm:px-6 lg:px-8'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-linear-to-br from-blue-500/10 via-purple-500/10 to-transparent dark:from-blue-500/5 dark:via-purple-500/5'></div>

      <div className='relative mx-auto max-w-7xl'>
        <div className='grid items-center gap-12 lg:grid-cols-2'>
          {/* Left side - Text content */}
          <div className='space-y-8'>
            <div className='inline-flex items-center px-4 py-2 space-x-2 border rounded-full bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20'>
              <span className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></span>
              <span className='text-sm font-medium text-blue-600 dark:text-blue-400'>
                Now accepting new students
              </span>
            </div>

            <div className='space-y-4'>
              <h1 className='text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl text-foreground'>
                Master English with{' '}
                <span className='text-transparent bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text'>
                  Expert Teachers
                </span>
              </h1>
              <p className='max-w-2xl text-xl text-muted-foreground'>
                Join thousands of students learning English through personalized
                1-on-1 lessons and interactive group classes. Start your journey
                today.
              </p>
            </div>

            <div className='flex flex-col gap-4 sm:flex-row'>
              <Link
                to='/register'
                className='inline-flex items-center justify-center px-8 py-4 font-medium text-white transition-all duration-300 rounded-lg shadow-lg bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl group'
              >
                Get Started Free
                <ArrowRight className='w-5 h-5 ml-2 transition-transform group-hover:translate-x-1' />
              </Link>
              <Link
                to='/become-teacher'
                className='inline-flex items-center justify-center px-8 py-4 font-medium transition-all duration-300 border-2 rounded-lg bg-background dark:bg-card border-border text-foreground hover:bg-accent'
              >
                Become a Teacher
              </Link>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-3 gap-8 pt-8 border-t border-border'>
              <div>
                <div className='text-3xl font-bold text-foreground'>10K+</div>
                <div className='text-sm text-muted-foreground'>
                  Active Students
                </div>
              </div>
              <div>
                <div className='text-3xl font-bold text-foreground'>500+</div>
                <div className='text-sm text-muted-foreground'>
                  Expert Teachers
                </div>
              </div>
              <div>
                <div className='text-3xl font-bold text-foreground'>4.9/5</div>
                <div className='text-sm text-muted-foreground'>
                  Average Rating
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
              <div className='absolute p-6 border shadow-xl bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm border-border rounded-xl'>
                <div className='flex items-center space-x-4'>
                  <div className='flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600'>
                    <span className='text-lg font-bold text-white'>BW</span>
                  </div>
                  <div className='flex-1'>
                    <div className='text-sm font-medium text-foreground'>
                      Next lesson starts in
                    </div>
                    <div className='text-2xl font-bold text-transparent bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text'>
                      15 minutes
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
