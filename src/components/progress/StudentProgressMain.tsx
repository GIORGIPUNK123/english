import { User, onAuthStateChanged } from 'firebase/auth';
// import leftImg from '../../assets/left-arrow.svg';
// import rightImg from '../../assets/right-arrow.svg';
import profileImg from '../../assets/profile.svg';
import { useEffect, useState } from 'react';
import { auth } from '../../firebase/firebase-config';
const ProgressBlock = (props: { topic: string; date: Date }) => {
  const myDate = props.date;
  const options: any = {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return (
    <div className='h-24 mx-4 my-4 rounded-md bg-indigo-950 w-44'>
      <div className='flex flex-col w-full h-full text-center'>
        <span className='mt-6 text-lg font-medium text-white'>
          {myDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <span className='mt-2 text-xs font-medium text-white '>
          {myDate.toLocaleDateString('en-US', options)}
        </span>
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
      <div className='flex w-full mb-10 text-white rounded-md shadow-lg bg-indigo-950'>
        <div className='flex items-center w-1/2'>
          <div
            style={{
              backgroundImage: `url(${profileImg})`,
            }}
            className='w-32 h-32 bg-center bg-no-repeat bg-contain rounded-full '
          />

          <span className='ml-4 text-2xl '>{user?.displayName}</span>
        </div>
        <div className='flex flex-col justify-center w-1/2 px-10'>
          <span className='text-xl text-center'>Class Tokens</span>
          <div className='relative h-5 mt-4 overflow-hidden bg-white rounded-full'>
            <div
              style={{
                width: `calc(${countClasses.spent / totalClasses} * 100%)`,
              }}
              className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r rounded-full bg-indigo-700`}
            />
          </div>
          <div className='flex justify-between w-full px-2 mt-2 text-lg'>
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
  const oldDate = new Date();
  const BottomPart = () => {
    return (
      <div className='flex justify-between w-full gap-8 text-white h-fit'>
        <div className='w-1/2 h-full pt-10'>
          <div className='w-full px-4 py-6 mb-6 text-xl text-center rounded-md bg-indigo-950'>
            <span>Finished Classes</span>
          </div>
          <div className='flex items-center justify-center w-full h-full '>
            <div className=' shadow-lg flex flex-wrap items-center justify-center w-full h-full py-6 bg-[#C0C5C7] rounded-md'>
              <ProgressBlock date={oldDate} topic='test' />
              <ProgressBlock date={oldDate} topic='test' />
              <ProgressBlock date={oldDate} topic='test' />
              <ProgressBlock date={oldDate} topic='test' />
              <ProgressBlock date={oldDate} topic='test' />
              <ProgressBlock date={oldDate} topic='test' />
            </div>
          </div>
        </div>
        <div className='w-1/2 h-full pt-10'>
          <div className='w-full px-4 py-6 mb-6 text-xl text-center rounded-md bg-indigo-950'>
            <span>Scheduled Classes</span>
          </div>
          <div className='flex items-center justify-center w-full h-full'>
            <div className=' shadow-lg flex flex-wrap items-center justify-center w-full h-full py-6 bg-[#C0C5C7] rounded-md'>
              <ProgressBlock date={oldDate} topic='test' />
              <ProgressBlock date={oldDate} topic='test' />
              <ProgressBlock date={oldDate} topic='test' />
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className='w-full p-8 mx-10 bg-white rounded-sm'>
      <TopPart />
      <BottomPart />
    </div>
  );
};
