import {
  Clock,
  Calendar,
  Users,
  AlertCircle,
  Star,
  Video,
  Coins,
  Plus,
} from 'lucide-react';
import { LessonT, UserDataT } from '../../types';
import { arrayRemove, increment, updateDoc } from 'firebase/firestore';
import { LessonDetailModal } from '../calendar/LessonDetailModal';
import { useState } from 'react';

export const StudentDashboardView = (props: {
  userData: UserDataT;
  lessons: LessonT[];
}) => {
  const { userData, lessons } = props;
  const capitalNames = [
    userData.first_name.charAt(0).toUpperCase() + userData.first_name.slice(1),
    userData.last_name.charAt(0).toUpperCase() + userData.last_name.slice(1),
  ];
  const upcomingLessons = lessons.filter(
    (lesson) =>
      lesson.status === 'scheduled' &&
      lesson.date >= Math.floor(Date.now() / 1000) &&
      lesson.teacher !== null,
  );
  const pendingRequests = lessons.filter(
    (lesson) =>
      lesson.status === 'scheduled' &&
      lesson.date > Math.floor(Date.now() / 1000),
  );
  const stats = [
    {
      label: 'Available Tokens',
      value: userData.tokens,
      icon: Coins,
      color: 'bg-yellow-500',
    },
    {
      label: 'Upcoming Lessons',
      value: upcomingLessons.length,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      label: 'Hours Completed',
      value: lessons.filter((lesson) => lesson.status === 'finished').length,
      icon: Clock,
      color: 'bg-purple-500',
    },
    {
      label: 'Pending Requests',
      value: pendingRequests.length,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
  ];

  const favoriteTeachers = [
    {
      name: 'Sarah Johnson',
      specialty: 'Business English',
      rating: 4.9,
      lessons: 12,
      avatar: 'SJ',
      color: 'bg-blue-500',
    },
    {
      name: 'Michael Chen',
      specialty: 'Conversation',
      rating: 5.0,
      lessons: 8,
      avatar: 'MC',
      color: 'bg-purple-500',
    },
    {
      name: 'Emma Williams',
      specialty: 'Grammar',
      rating: 4.8,
      lessons: 6,
      avatar: 'EW',
      color: 'bg-green-500',
    },
  ];

  // const handleCancel = async (lesson: LessonT) => {
  //   try {
  //     const classId = lesson.id;
  //     console.log('classId: ', classId);
  //     if (props.isWithin48Hours) {
  //       console.error('Cannot cancel class within 48 hours');
  //       return;
  //     }
  //     if (!classId || !auth.currentUser?.uid) {
  //       console.error('Missing class id or user Id, cannot delete');
  //       return;
  //     }

  //     // Delete class document from 'classes' collection
  //     await deleteDoc(doc(db, 'classes', classId));

  //     // Get user's data to find the class reference
  //     const userDataDocRef = doc(db, 'userData', auth.currentUser.uid);

  //     // Update userData: remove class from array and increment tokens
  //     await updateDoc(userDataDocRef, {
  //       tokens: increment(1),
  //       used_tokens: increment(-1),
  //       classes: arrayRemove({ id: classId }),
  //     });

  //     props.setIsOn(false);
  //   } catch (error) {
  //     console.error('Error deleting class: ', error);
  //   }
  // };
  const [selectedLesson, setSelectedLesson] = useState<LessonT | null>(null);
  return (
    <div className='h-full overflow-y-auto'>
      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}
      {/* Welcome Section */}
      <div className='mb-8'>
        <h1 className='mb-2 text-xl text-white sm:text-2xl lg:text-3xl'>
          Welcome back, {capitalNames[0]}! 👋
        </h1>
        <p className='text-sm text-gray-400 sm:text-base'>
          You have {userData.tokens} tokens available. Each token = 1 lesson.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 gap-3 mb-8 lg:grid-cols-4 sm:gap-4'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isTokens = stat.label === 'Available Tokens';
          return (
            <div
              key={stat.label}
              className='p-4 transition-all border border-gray-700 rounded-lg bg-gray-800/40 sm:p-6 hover:bg-gray-800/60'
            >
              <div className='flex items-center justify-between mb-3'>
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.color} flex items-center justify-center`}
                >
                  <Icon className='w-4 h-4 text-white sm:w-5 sm:h-5' />
                </div>
                {isTokens && (
                  <button className='flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300'>
                    <Plus className='w-3 h-3' />
                    <span className='hidden sm:inline'>Top up</span>
                  </button>
                )}
              </div>
              <h3 className='mb-1 text-xl text-white sm:text-2xl'>
                {stat.value}
              </h3>
              <p className='text-xs text-gray-400 sm:text-sm'>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className='grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2 sm:gap-6'>
        {/* Upcoming Lessons */}
        <div className='p-4 border border-gray-700 rounded-lg bg-gray-800/40 sm:p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg text-white sm:text-xl'>Upcoming Lessons</h2>
            <button className='text-xs text-blue-400 transition-all sm:text-sm hover:text-blue-300'>
              View All
            </button>
          </div>
          <div className='space-y-3'>
            {upcomingLessons.map((lesson) => (
              <div
                key={lesson.id}
                className='p-3 transition-all border border-gray-700 rounded-lg bg-gray-800/60 hover:bg-gray-800'
              >
                <div className='flex items-start gap-3'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <span className='text-sm font-semibold text-white'>
                      {/* {lesson.avatar} */}
                    </span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='mb-1 text-sm text-white sm:text-base'>
                      {lesson.teacher
                        ? `${lesson.teacher.first_name} ${lesson.teacher.last_name}`
                        : 'TBA'}
                    </h4>
                    <p className='mb-2 text-xs text-gray-400 sm:text-sm'>
                      {/* {lesson.subject} */}
                    </p>
                    <div className='flex flex-wrap items-center gap-2 text-xs text-gray-500'>
                      <Calendar className='w-3 h-3' />
                      <span>{lesson.date}</span>
                      <span>•</span>
                      <Clock className='w-3 h-3' />
                      {/* <span>{lesson.time}</span> */}
                    </div>
                  </div>
                  <button className='px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-all flex items-center gap-1 flex-shrink-0'>
                    <Video className='w-3 h-3' />
                    <span className='hidden sm:inline'>Join</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className='w-full mt-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base'>
            + Schedule New Lesson
          </button>
        </div>

        {/* Pending Requests */}
        <div className='p-4 border border-gray-700 rounded-lg bg-gray-800/40 sm:p-6'>
          <h2 className='mb-4 text-lg text-white sm:text-xl'>
            Pending Requests
          </h2>
          <div className='mb-4 space-y-3'>
            {pendingRequests.map((lesson) => {
              const lessonDate = new Date(lesson.date * 1000);
              return (
                <div
                  key={lesson.id}
                  className='p-3 border border-gray-700 rounded-lg bg-gray-800/60'
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`w-10 h-10 rounded-full  flex items-center justify-center flex-shrink-0`}
                    >
                      <span className='text-sm font-semibold text-white'>
                        {/* {lesson.teacher?.img} */}
                        <Users />
                      </span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='mb-1 text-sm text-white sm:text-base'>
                        {lesson.teacher
                          ? `${lesson.teacher.first_name} ${lesson.teacher.last_name}`
                          : 'Any Available Teacher'}
                      </h4>
                      <p className='mb-2 text-xs text-gray-400 sm:text-sm'>
                        {lesson.topic?.heading}
                      </p>
                      <div className='flex flex-wrap items-center gap-2 text-xs text-gray-500'>
                        <Calendar className='w-3 h-3' />
                        <span>{lessonDate.toLocaleDateString()}</span>
                        <span>•</span>
                        <Clock className='w-3 h-3' />
                        <span>
                          {lessonDate.getHours()}:{lessonDate.getMinutes()} -{' '}
                          {lessonDate.getHours() + 1}:{lessonDate.getMinutes()}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center flex-shrink-0 gap-1'>
                      <AlertCircle className='w-4 h-4 text-orange-400' />
                    </div>
                  </div>
                  <div className='flex items-center justify-between pt-3 mt-3 border-t border-gray-700'>
                    <p className='text-xs text-gray-500'>
                      {lesson.teacher
                        ? 'Waiting for teacher confirmation...'
                        : 'Waiting for any teacher to accept...'}
                    </p>
                    <button
                      onClick={() => setSelectedLesson(lesson)}
                      className='text-xs sm:text-sm px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-600/30 rounded hover:bg-red-600/30 transition-all'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className='p-3 border rounded-lg bg-blue-500/10 border-blue-500/20'>
            <p className='text-xs text-blue-400 sm:text-sm'>
              💡 Tip: Teachers usually respond within 24 hours. You'll receive a
              notification once they accept!
            </p>
          </div>
        </div>
      </div>

      {/* Favorite Teachers */}
      <div className='p-4 border border-gray-700 rounded-lg bg-gray-800/40 sm:p-6'>
        <h2 className='mb-4 text-lg text-white sm:text-xl'>
          Your Favorite Teachers
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          {favoriteTeachers.map((teacher) => (
            <div
              key={teacher.name}
              className='flex items-center gap-3 p-3 transition-all border border-gray-700 rounded-lg cursor-pointer bg-gray-800/60 hover:bg-gray-800'
            >
              <div
                className={`w-12 h-12 rounded-full ${teacher.color} flex items-center justify-center flex-shrink-0`}
              >
                <span className='font-semibold text-white'>
                  {teacher.avatar}
                </span>
              </div>
              <div className='flex-1 min-w-0'>
                <h4 className='mb-1 text-sm text-white sm:text-base'>
                  {teacher.name}
                </h4>
                <p className='mb-1 text-xs text-gray-400'>
                  {teacher.specialty}
                </p>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <Star className='w-3 h-3 text-yellow-400 fill-yellow-400' />
                    <span className='text-xs text-gray-400'>
                      {teacher.rating}
                    </span>
                  </div>
                  <span className='text-xs text-gray-500'>•</span>
                  <span className='text-xs text-gray-500'>
                    {teacher.lessons} lessons
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
