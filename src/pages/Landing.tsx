import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
import { Helix } from 'ldrs/react';
import 'ldrs/react/Helix.css';
import { FirstLandingPart } from '../components/landing/FirstLandingPart';
import { SecondLandingPart } from '../components/landing/SecondLandingPart';
import { ThirdLandingPart } from '../components/landing/ThirdLandingPart';

export const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<null | User | 'loading'>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe; // clean up listener on unmount
  }, []);

  // Navigate if user is logged in
  useEffect(() => {
    if (user && user !== 'loading') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Show loading spinner while loading user
  if (user === 'loading') {
    return (
      <div className='flex flex-col items-center justify-center w-full h-screen bg-black-pearl-950'>
        <Helix size='600' speed='2.5' color='white' />
        <div className='h-96'></div>
      </div>
    );
  }

  // If user is not logged in, render landing page
  const headerPart = () => {
    return <Header main={true} loggedIn={!!user} />;
  };

  return (
    <div className='flex flex-col items-center w-full bg-black-pearl-950'>
      {headerPart()}
      <section>
        <FirstLandingPart />

        <div className='w-full h-12 bg-torch-red-600'></div>
        <SecondLandingPart />
        <ThirdLandingPart />
      </section>

      <footer className='w-full mt-40 bg-white dark:bg-gray-900'>
        <div className='w-full max-w-screen-xl mx-auto'>
          <div className='flex flex-col flex-wrap items-center mt-20 sm:flex-row'>
            <div className='w-1/3 text-center'>
              <h2 className='mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white'>
                Company
              </h2>
              <ul className='font-medium text-gray-500 dark:text-gray-400'>
                <li className='mb-4'>
                  <a href='#' className='hover:underline'>
                    About
                  </a>
                </li>
                <li className='mb-4'>
                  <a href='#' className='hover:underline'>
                    Careers
                  </a>
                </li>
                <li className='mb-4'>
                  <a href='#' className='hover:underline'>
                    Brand Center
                  </a>
                </li>
                <li className='mb-4'>
                  <a href='#' className='hover:underline'>
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div className='w-1/3 my-12 text-center'>
              <h2 className='mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white'>
                Help center
              </h2>
              <ul className='font-medium text-gray-500 dark:text-gray-400'>
                <li className='mb-4'>
                  <a href='#' className='hover:underline'>
                    Discord Server
                  </a>
                </li>
                <li className='mb-4'>
                  <a href='#' className='hover:underline'>
                    Twitter
                  </a>
                </li>
                <li className='mb-4'>
                  <a href='#' className='hover:underline'>
                    Facebook
                  </a>
                </li>
                <li className='mb-4'>
                  <a href='#' className='hover:underline'>
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div className='w-1/3 text-center'>
              <h2 className='mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white'>
                Legal
              </h2>
              <ul className='font-medium text-gray-500 dark:text-gray-400'>
                <li className='mb-4'>
                  <a href='#' className='hover:underline'>
                    Privacy Policy
                  </a>
                </li>
                <li className='mb-4'>
                  <a href='#' className='hover:underline'>
                    Licensing
                  </a>
                </li>
                <li className='mb-4'>
                  <a href='#' className='hover:underline'>
                    Terms &amp; Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className='px-4 py-6 bg-gray-100 dark:bg-gray-700 md:flex md:items-center md:justify-between'>
            <span className='text-sm text-gray-500 dark:text-gray-300 sm:text-center'>
              © 2024 <a href='https://google.com/'>British World</a>. All Rights
              Reserved.
            </span>
            <div className='flex mt-4 space-x-5 sm:justify-center md:mt-0 rtl:space-x-reverse'>
              {/* Social icons here (keep as-is) */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
