import calendar from '../../assets/calendar.svg';
const Container = (props: { img: any; name: string; text: string }) => (
  <div className='relative flex flex-col items-center w-full mx-6 mt-8 bg-white sm:w-96 sm:h-96 rounded-xl'>
    <div
      className='p-8 sm:p-10 bg-[length:22.5px_22.5px] sm:bg-[length:45px_45px] bg-no-repeat bg-center absolute sm:-top-8 sm:w-8 -top-8 w-4 bg-black-pearl-950 rounded-full aspect-square'
      style={{ backgroundImage: `url(${props.img})` }}
    />
    <h1 className='px-2 pt-4 mt-6 sm:mt-16 text-md sm:text-2xl'>
      {props.name}
    </h1>
    <p className='px-4 pb-4 mt-3 text-sm text-gray-800 sm:text-lg sm:mt-6'>
      {props.text}
    </p>
  </div>
);
export const SecondLandingPart = () => {
  return (
    <div
      className='w-full text-center text-white bg-black-pearl-950'
      id='features'
    >
      <h1 className='mt-10 text-4xl font-medium'>Why should you choose us?</h1>
      <div className='mt-20 sm:mx-10 justify-evenly flex flex-wrap min-h-[600px] text-black'>
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
  );
};
