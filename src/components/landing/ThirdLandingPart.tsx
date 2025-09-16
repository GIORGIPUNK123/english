import students_girl from '../../assets/student_girl.png';
export const ThirdLandingPart = () => {
  return (
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
  );
};
