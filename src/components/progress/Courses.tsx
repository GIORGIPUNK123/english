import { userDataT } from '../../types';

export const Courses = (props: { userData: userDataT }) => {
  const courses: { test: string; id: number }[] = [
    { test: 'string', id: 2 },
    { test: 'ptaset', id: 5 },
  ];
  return (
    <div className='py-32 text-2xl text-center text-gray-600'>
      Courses coming soon!
    </div>
    // <div className='w-full p-8 bg-[#CCCCCC] rounded-sm'>
    //   <div className='p-4 bg-white rounded-md shadow-md'>
    //     <span>Enrolled Courses</span>
    //     <div className='flex flex-col'>
    //       {courses.map((course) => (
    //         <div
    //           key={course.id}
    //           className='p-4 px-6 m-4 text-white bg-blue-800 border rounded-md'
    //         >
    //           <span>Course ID: {course.id}</span>
    //           <p>{course.test}</p>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </div>
  );
};
