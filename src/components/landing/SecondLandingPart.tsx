import calendar from '../../assets/calendar.svg';
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
export const SecondLandingPart = () => {
  return (
    <div className='w-full text-center text-white bg-black-pearl-950'>
      <h1 className='mt-10 text-4xl font-medium'>Why should you choose us?</h1>
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
  );
};
