import { User, onAuthStateChanged } from 'firebase/auth';
// import leftImg from '../../assets/left-arrow.svg';
// import rightImg from '../../assets/right-arrow.svg';
import profileImg from '../../assets/profile.svg';
import { useEffect, useState } from 'react';
import { auth } from '../../firebase/firebase-config';
const ProgressBlock = (props: { topic: string; time: string }) => {
  return (
    <div className='flex py-6 w-32 bg-white rounded-md'>
      <div className='flex flex-col mx-4 w-full h-24 text-center bg-purple-800 rounded-md'>
        <span className='mt-4 text-lg font-medium text-white'>
          {props.topic}
        </span>
        {/* <div className='mt-4 text-lg text-white'>{props.time}</div> */}
        <div></div>
      </div>
    </div>
  );
};

export const StudentProgressMain = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);
  const countClasses = {
    remaining: 2,
    spent: 3,
  };
  const totalClasses = countClasses.remaining + countClasses.spent;
  const TopPart = () => {
    return (
      <div className='flex mb-10 ml-4 w-full'>
        <div className='flex items-center w-1/2'>
          <div
            style={{
              backgroundImage: `url(${profileImg})`,
            }}
            className='w-32 h-32 bg-center bg-no-repeat bg-contain rounded-full'
          />
          <span className='ml-4 text-2xl'>{user?.displayName}</span>
        </div>
        <div className='flex flex-col justify-center px-10 w-1/2'>
          <span className='text-xl text-center'>Class Tokens</span>
          <div className='overflow-hidden relative mt-4 h-5 bg-white rounded-full'>
            <div
              style={{
                width: `calc(${countClasses.spent / totalClasses} * 100%)`,
              }}
              className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r rounded-full bg-torch-red-500`}
            />
          </div>
          <div className='flex justify-between px-2 mt-2 w-full text-lg'>
            <span
              style={{
                width: `${(countClasses.spent / totalClasses) * 100}%`,
              }}
              className='text-center'
            >
              Spent: {countClasses.spent}
            </span>
            <span
              style={{
                width: `${(countClasses.remaining / totalClasses) * 100}%`,
              }}
              className='text-center'
            >
              Remaining: {countClasses.remaining}
            </span>
          </div>
        </div>
      </div>
    );
  };
  const BottomPart = () => {
    return (
      <div className='w-full'>
        <div className='w-1/2'>
          <div className='px-4 py-2 mb-6 w-full text-xl text-center bg-white rounded-md'>
            <span>Finished Classes</span>
          </div>
          <div className='flex justify-center items-center w-full'>
            <div className='flex flex-wrap items-center py-6 bg-white rounded-md w-fit'>
              <ProgressBlock topic='Freedom' time='12:40' />
              <ProgressBlock topic='Freedom' time='12:40' />
              <ProgressBlock topic='Freedom' time='12:40' />
              <ProgressBlock topic='Freedom' time='12:40' />
              <ProgressBlock topic='Freedom' time='12:40' />
              <ProgressBlock topic='Freedom' time='12:40' />
            </div>
          </div>
        </div>
        <div className='w-1/2'></div>
      </div>

      // <div className='flex gap-5 justify-between w-full h-full rounded-sm'>
      //   <span className='px-4 py-2 mb-6 w-1/2 text-xl bg-white rounded-md'>
      //     Finished Classes
      //   </span>
      //   <div className='w-44 text-center rounded-sm'>
      //     <div className='flex flex-col justify-between'>
      //       {/* <ProgressBlock heading='F' topic='Freedom' time='12:40' /> */}
      //     </div>
      //   </div>
      //   <div className='w-1/2 text-center rounded-sm'>
      //     <ProgressBlock
      //       heading='Scheduled Classes'
      //       topic='Freedom'
      //       time='12:40'
      //     />
      //   </div>
      // </div>
    );
  };
  return (
    <div className='p-8 mx-10 w-full bg-gray-200 rounded-sm'>
      <TopPart />
      <BottomPart />
    </div>
  );
};
