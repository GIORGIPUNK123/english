import { Header } from '../components/Header';
import students_talking from '../assets/students_talking.webp';
import students_girl from '../assets/student_girl.png';
import calendar from '../assets/calendar.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
import { Helix } from 'ldrs/react';
import 'ldrs/react/Helix.css';

const Container = (props: { img: any; name: string; text: string }) => (
  <div className='relative flex flex-col items-center mx-6 mt-8 bg-white w-96 h-96 rounded-xl'>
    <div
      className='p-10 bg-[length:45px_45px]  bg-no-repeat bg-center absolute -top-8 w-8 bg-black-pearl-950 rounded-full aspect-square'
      style={{ backgroundImage: `url(${props.img})` }}
    />
    <h1 className='mt-16 text-2xl'>{props.name}</h1>
    <p className='px-4 mt-6 text-lg text-gray-800'>{props.text}</p>
  </div>
);

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
        <div className='flex flex-col items-center w-full mt-44 md:flex-row'>
          <div className='flex items-center justify-center w-full md:w-1/2'>
            <div
              className=' mt-12 ml-12 w-full max-w-[600px] h-96  bg-center bg-cover rounded-lg -rotate-6 mr-6'
              style={{ backgroundImage: `url(${students_talking})` }}
            />
          </div>
          <div className='flex flex-col items-center justify-center w-full text-3xl text-center text-white h-96 md:w-1/2'>
            <h1>
              Improve your English with proffesional teachers gasgjal slghalskgh
              aslkgh lkashg laksg hlkashg lkahlk
            </h1>
            <Link to='/register'>
              <button className='h-20 mt-10 duration-300 rounded-lg shadow-md w-52 bg-torch-red-500 hover:shadow-2xl hover:bg-torch-red-700'>
                Sign Up
              </button>
            </Link>
          </div>
        </div>

        <div className='w-full h-12 bg-torch-red-600'></div>

        <div className='w-full text-center text-white bg-black-pearl-950'>
          <h1 className='mt-10 text-4xl font-medium'>
            Why should you choose us?
          </h1>
          <div className='mt-20 mx-10 justify-evenly flex flex-wrap min-h-[600px] text-black'>
            <Container
              name='Easy Scheduling & Attendance Tracking'
              img={calendar}
              text=' Schedule and reserve classrooms at one campus or multiple campuses. Keep detailed records of student attendance'
            />
            <Container
              name='Easy Scheduling & Attendance Tracking'
              img={calendar}
              text=' Schedule and reserve classrooms at one campus or multiple campuses. Keep detailed records of student attendance'
            />
            <Container
              name='Easy Scheduling & Attendance Tracking'
              img={calendar}
              text=' Schedule and reserve classrooms at one campus or multiple campuses. Keep detailed records of student attendance'
            />
          </div>
        </div>

        <div className='w-full text-center text-white bg-black-pearl-950'>
          <h1 className='mt-10 text-4xl font-medium'>E learning</h1>
          <div className='flex flex-col items-center w-full mt-14 md:flex-row'>
            <div className='w-full md:w-1/2'>
              <p className='mt-10 text-3xl'>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo
                debitis, error consequatur, delectus labore eveniet vel mollitia
                vitae dolores perferendis reprehenderit maiores tenetur corporis
                sunt qui? At id eum obcaecati.
              </p>
            </div>
            <div className='flex justify-center w-full mx-10 md:w-1/2'>
              <div
                className='w-full max-w-[600px] bg-top bg-no-repeat bg-cover rounded-lg  aspect-square'
                style={{ backgroundImage: `url(${students_girl})` }}
              />
            </div>
          </div>
        </div>
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
