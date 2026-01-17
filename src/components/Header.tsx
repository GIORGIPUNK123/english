import { Link } from 'react-router-dom';
import burger_bar from '../assets/burger_bar.svg';
import back from '../assets/back.svg';
import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
const baseLiClass = 'hover:underline underline-offset-8 cursor-pointer';

const AuthButtons = () => (
  <div className='justify-between hidden w-56 lg:flex xl:w-80'>
    <Link to='/login'>
      <button className='w-24 h-12 text-white duration-300 rounded-lg shadow-md xl:w-36 xl:h-14 hover:shadow-2xl hover:bg-bright-turquoise-500 bg-bright-turquoise-300'>
        Login
      </button>
    </Link>
    <Link to='/register'>
      <button className='w-24 h-12 text-white duration-300 rounded-lg shadow-md xl:w-36 xl:h-14 hover:shadow-2xl hover:bg-torch-red-700 bg-torch-red-500'>
        Sign Up
      </button>
    </Link>
  </div>
);

export const Header = (props: {
  main: boolean;
  backUrl?: string;
  loggedIn: boolean;
  registerPage?: boolean;
}) => {
  const [user, setUser] = useState<null | User | 'loading'>('loading');
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const RightPart = () => {
    if (user && user !== 'loading') {
      return (
        <Link to='/profile'>
          <h2 className={`hidden lg:block ${baseLiClass}`}>Profile</h2>
        </Link>
      );
    } else if (user === 'loading') {
      return <h2 className='hidden w-20 lg:block '></h2>;
    } else {
      return <AuthButtons />;
    }
  };
  if (props.main) {
    return (
      <>
        <div className='fixed z-10 flex justify-between items-center px-12 w-full h-16 sm:h-24 font-mono text-xl font-medium bg-[#FDFFFC]'>
          <Link to='/'>
            <h3 className='text-2xl'>British World</h3>
          </Link>
          <ul className='hidden lg:flex'>
            <a className={`mr-4 xl:mr-6 ${baseLiClass}`} href='#'>
              Home
            </a>
            <a className={`mr-4 xl:mr-6 ${baseLiClass}`} href='#features'>
              Our Features
            </a>
            <a className={`mx-4 xl:mx-6 ${baseLiClass}`} href='#pricing'>
              Pricing
            </a>
            <a className={`ml-4 xl:ml-6 ${baseLiClass}`} href='#about'>
              About Us
            </a>
          </ul>
          <RightPart />
          <div
            onClick={() => {
              setIsOpen((prevState: boolean) => !prevState);
            }}
            className='block w-10 h-8 bg-no-repeat bg-contain cursor-pointer invert lg:hidden'
            style={{ backgroundImage: `url(${burger_bar})` }}
          />
        </div>
        <div
          className={` ${
            isOpen ? 'block' : 'hidden'
          } fixed top-16 sm:top-24 z-10 w-full h-56 bg-white`}
        >
          <ul className='flex flex-col h-full justify-evenly'>
            <li
              className={`font-mono text-2xl font-medium text-center ${baseLiClass}`}
            >
              Home
            </li>
            <li
              className={`font-mono text-2xl font-medium text-center ${baseLiClass}`}
            >
              Our Features
            </li>
            <li
              className={`font-mono text-2xl font-medium text-center ${baseLiClass}`}
            >
              Pricing
            </li>
            <li
              className={`font-mono text-2xl font-medium text-center ${baseLiClass}`}
            >
              About Us
            </li>
            {user ? (
              <Link to='/profile'>
                <li
                  className={`font-mono text-2xl font-medium text-center ${baseLiClass}`}
                >
                  Profile
                </li>
              </Link>
            ) : (
              <>
                <Link to='/login'>
                  <li
                    className={`font-mono text-2xl font-medium text-center ${baseLiClass}`}
                  >
                    Login
                  </li>
                </Link>

                <Link to='/register'>
                  <li
                    className={`font-mono text-2xl font-medium text-center ${baseLiClass}`}
                  >
                    Sign Up
                  </li>
                </Link>
              </>
            )}
          </ul>
        </div>
        <div className={`${isOpen ? 'mb-[320px]' : 'mb-16 sm:mb-24'} `} />
      </>
    );
  } else {
    return (
      <>
        <div className='relative'>
          <div className='fixed z-10 flex justify-center items-center px-12 w-full h-16 sm:h-24 font-mono text-xl font-medium bg-[#FDFFFC]'>
            <Link to='/'>
              <h3 className='text-2xl'>British World</h3>
            </Link>
          </div>
          {props.backUrl ? (
            <div className='fixed z-10 flex items-center top-3 left-3 sm:top-6 sm:left-8'>
              <Link to={props.backUrl}>
                <div
                  className='bg-cover size-10 sm:size-12'
                  style={{ backgroundImage: `url(${back})` }}
                />
              </Link>
            </div>
          ) : null}
          {props.registerPage ? (
            <div className='fixed z-10 flex items-center top-3 right-3 sm:top-6 sm:right-8'>
              <Link to={'/register-teacher'}>
                <div className='h-10 px-4 py-2 text-lg text-white transition-transform bg-purple-500 bg-cover rounded-sm hover:scale-105 sm:h-12'>
                  Register As a Teacher
                </div>
              </Link>
            </div>
          ) : null}
          <div className='mb-16 sm:mb-24' />
        </div>
      </>
    );
  }
};
