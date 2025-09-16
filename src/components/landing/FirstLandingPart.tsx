import { Link } from 'react-router-dom';
import students_talking from '../../assets/students_talking.webp';
export const FirstLandingPart = () => {
  return (
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
  );
};
