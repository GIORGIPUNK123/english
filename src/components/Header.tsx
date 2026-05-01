import { Link } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const Header = () => {
  const [user, setUser] = useState<null | { email: string } | 'loading'>(
    'loading',
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    // Check fake auth status
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const email = localStorage.getItem('userEmail');
    if (isAuth && email) {
      setUser({ email });
    } else {
      setUser(null);
    }
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header className='fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md border-border'>
        <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16 sm:h-20'>
            {/* Logo */}
            <Link to='/' className='flex items-center space-x-2'>
              <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600'>
                <span className='text-lg font-bold text-white'>BW</span>
              </div>
              <span className='text-xl font-semibold text-foreground'>
                British World
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className='items-center hidden space-x-8 lg:flex'>
              <button
                onClick={() => scrollToSection('home')}
                className='transition-colors text-muted-foreground hover:text-foreground'
              >
                {t('header.home')}
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className='transition-colors text-muted-foreground hover:text-foreground'
              >
                {t('header.features')}
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className='transition-colors text-muted-foreground hover:text-foreground'
              >
                {t('header.pricing')}
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className='transition-colors text-muted-foreground hover:text-foreground'
              >
                {t('header.about')}
              </button>
              <Link
                to='/become-teacher'
                className='transition-colors text-muted-foreground hover:text-foreground'
              >
                {t('header.teach')}
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className='flex items-center space-x-4'>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className='p-2 transition-colors rounded-lg hover:bg-accent'
                aria-label={t('header.toggleTheme')}
              >
                {isDarkMode ? (
                  <Sun className='w-5 h-5 text-foreground' />
                ) : (
                  <Moon className='w-5 h-5 text-foreground' />
                )}
              </button>

              {/* Auth Buttons (Desktop) */}
              {user && user !== 'loading' ? (
                <Link to='/dashboard'>
                  <button className='hidden lg:block px-6 py-2.5 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105'>
                    {t('header.dashboard')}
                  </button>
                </Link>
              ) : user === 'loading' ? (
                <div className='hidden w-24 h-10 rounded-lg lg:block bg-muted animate-pulse' />
              ) : (
                <div className='items-center hidden space-x-3 lg:flex'>
                  <Link to='/login'>
                    <button className='px-6 py-2.5 text-foreground hover:bg-accent rounded-lg transition-all duration-300'>
                      {t('header.login')}
                    </button>
                  </Link>
                  <Link to='/register'>
                    <button className='px-6 py-2.5 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105'>
                      {t('header.signup')}
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className='p-2 transition-colors rounded-lg lg:hidden hover:bg-accent'
                aria-label='Toggle menu'
              >
                {isMenuOpen ? (
                  <X className='w-6 h-6 text-foreground' />
                ) : (
                  <Menu className='w-6 h-6 text-foreground' />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='border-t lg:hidden border-border bg-background'>
            <div className='px-4 py-6 space-y-4'>
              <button
                onClick={() => scrollToSection('home')}
                className='block w-full px-4 py-2 text-left transition-colors rounded-lg text-foreground hover:bg-accent'
              >
                {t('header.home')}
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className='block w-full px-4 py-2 text-left transition-colors rounded-lg text-foreground hover:bg-accent'
              >
                {t('header.features')}
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className='block w-full px-4 py-2 text-left transition-colors rounded-lg text-foreground hover:bg-accent'
              >
                {t('header.pricing')}
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className='block w-full px-4 py-2 text-left transition-colors rounded-lg text-foreground hover:bg-accent'
              >
                {t('header.about')}
              </button>
              <Link
                to='/become-teacher'
                className='block w-full px-4 py-2 text-left transition-colors rounded-lg text-foreground hover:bg-accent'
              >
                {t('header.teach')}
              </Link>

              <div className='pt-4 space-y-3'>
                {user && user !== 'loading' ? (
                  <Link to='/dashboard' onClick={() => setIsMenuOpen(false)}>
                    <button className='w-full px-6 py-3 text-white transition-all duration-300 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 hover:shadow-lg'>
                      {t('header.dashboard')}
                    </button>
                  </Link>
                ) : (
                  user !== 'loading' && (
                    <>
                      <Link to='/login' onClick={() => setIsMenuOpen(false)}>
                        <button className='w-full px-6 py-3 transition-all duration-300 border rounded-lg text-foreground border-border hover:bg-accent'>
                          {t('header.login')}
                        </button>
                      </Link>
                      <Link to='/register' onClick={() => setIsMenuOpen(false)}>
                        <button className='w-full px-6 py-3 text-white transition-all duration-300 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 hover:shadow-lg'>
                          {t('header.signup')}
                        </button>
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <div className='h-16 sm:h-20' /> {/* Spacer for fixed header */}
    </>
  );
};
