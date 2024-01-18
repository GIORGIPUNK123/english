import { Link } from 'react-router-dom';
import burger_bar from '../assets/burger_bar.svg';
import back from '../assets/back.svg';
import { useState } from 'react';
const baseLiClass = 'hover:underline underline-offset-8';

const AuthButtons = () => (
  <div className='hidden justify-between w-56 lg:flex xl:w-80'>
    <Link to='/login'>
      <button className='w-24 h-12 text-white rounded-lg shadow-md duration-300 xl:w-36 xl:h-14 hover:shadow-2xl hover:bg-bright-turquoise-500 bg-bright-turquoise-300'>
        Login
      </button>
    </Link>
    <Link to='/register'>
      <button className='w-24 h-12 text-white rounded-lg shadow-md duration-300 xl:w-36 xl:h-14 hover:shadow-2xl hover:bg-torch-red-700 bg-torch-red-500'>
        Sign Up
      </button>
    </Link>
  </div>
);

export const Header = (props: {
  loggedIn: boolean;
  main: boolean;
  backUrl?: string;
}) => {
  const { loggedIn } = props;
  const [isOpen, setIsOpen] = useState(false);
  if (props.main) {
    return (
      <>
        <div className='fixed z-10 flex justify-between items-center px-12 w-full h-24 font-mono text-xl font-medium bg-[#FDFFFC]'>
          <Link to='/'>
            <h3 className='text-2xl'>British World</h3>
          </Link>
          <ul className='hidden lg:flex'>
            <li className={`mr-4 xl:mr-6 ${baseLiClass}`}>Home</li>
            <li className={`mx-4 xl:mx-6 ${baseLiClass}`}>Our Features</li>
            <li className={`mx-4 xl:mx-6 ${baseLiClass}`}>Pricing</li>
            <li className={`ml-4 xl:ml-6 ${baseLiClass}`}>About Us</li>
          </ul>
          {loggedIn ? (
            <Link to='/profile'>
              <h2 className={`hidden lg:block ${baseLiClass}`}>Profile</h2>
            </Link>
          ) : (
            <AuthButtons />
          )}
          <div
            onClick={() => {
              setIsOpen((prevState: boolean) => !prevState);
            }}
            className='block w-10 h-8 bg-no-repeat bg-contain invert cursor-pointer lg:hidden'
            style={{ backgroundImage: `url(${burger_bar})` }}
          />
        </div>
        <div
          className={` ${
            isOpen ? 'block' : 'hidden'
          } absolute top-24 w-full h-56 bg-white`}
        >
          <ul className='flex flex-col justify-evenly h-full'>
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
            {loggedIn ? (
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
        <div className={`${isOpen ? 'mb-[320px]' : 'mb-24'} `} />
      </>
    );
  } else {
    return (
      <>
        <div className='relative'>
          <div className='fixed z-10 flex justify-center items-center px-12 w-full h-24 font-mono text-xl font-medium bg-[#FDFFFC]'>
            <Link to='/'>
              <h3 className='text-2xl'>British World</h3>
            </Link>
          </div>
          {props.backUrl ? (
            <div className='flex fixed top-6 left-8 z-10 items-center'>
              <Link to={props.backUrl}>
                <div
                  className='bg-cover size-12'
                  style={{ backgroundImage: `url(${back})` }}
                />
              </Link>
            </div>
          ) : null}
          <div className='mb-24' />
        </div>
      </>
    );
  }
};
