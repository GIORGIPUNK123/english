import { useState } from 'react';
import {
  BookOpen,
  Users,
  Clock,
  Calendar,
  Headphones,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  MessageCircleMore,
} from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'upcoming' | 'locked';
  teacherFeedback?: {
    message: string;
    practiceAreas: string[];
    rating: number;
  };
}

interface Course {
  id: string;
  name: string;
  type: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  groupSize: number;
  spotsLeft: number;
  schedule: string;
  startDate: string;
  color: string;
  icon: any;
  lessons: Lesson[];
  isEnrolled: boolean;
}

export const StudentCoursesView = () => {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const courses: Course[] = [
    {
      id: '1',
      name: 'A1.1 - Elementary English',
      type: 'Level Course',
      description: 'Perfect for absolute beginners',
      totalLessons: 20,
      completedLessons: 0,
      duration: '10 weeks',
      groupSize: 4,
      spotsLeft: 1,
      schedule: 'Mon & Wed, 6:00 PM',
      startDate: 'Feb 1, 2026',
      color: 'from-blue-500 to-blue-600',
      icon: BookOpen,
      isEnrolled: false,
      lessons: [
        {
          id: 1,
          title: 'Introduction & Greetings',
          description:
            'Learn basic greetings, introduce yourself, and practice simple conversations',
          status: 'locked',
        },
        {
          id: 2,
          title: 'Numbers & Time',
          description:
            'Count from 1-100, tell time, and talk about daily schedules',
          status: 'locked',
        },
        {
          id: 3,
          title: 'Family & Relationships',
          description: 'Describe your family members and relationships',
          status: 'locked',
        },
      ],
    },
    {
      id: '3',
      name: 'B1.1 - Intermediate English',
      type: 'Level Course',
      description: 'Expand your vocabulary and grammar',
      totalLessons: 24,
      completedLessons: 12,
      duration: '12 weeks',
      groupSize: 4,
      spotsLeft: 0,
      schedule: 'Mon & Wed, 7:00 PM',
      startDate: 'Started Dec 15, 2025',
      color: 'from-green-500 to-green-600',
      icon: BookOpen,
      isEnrolled: true,
      lessons: [
        {
          id: 1,
          title: 'Past Tenses Review',
          description:
            'Master simple past, past continuous, and past perfect tenses',
          status: 'completed',
          teacherFeedback: {
            message:
              'Great work, Giorgi! Your understanding of past tenses is solid. You participated actively in class.',
            practiceAreas: [
              'Irregular verbs',
              'Past perfect in complex sentences',
            ],
            rating: 5,
          },
        },
        {
          id: 2,
          title: 'Conditionals (First & Second)',
          description: 'Learn to express real and hypothetical situations',
          status: 'completed',
          teacherFeedback: {
            message:
              "Good progress! You're getting the hang of conditionals, but need more practice with second conditional.",
            practiceAreas: [
              'Second conditional structure',
              'Would vs Could usage',
            ],
            rating: 4,
          },
        },
        {
          id: 3,
          title: 'Business Communication',
          description:
            'Professional emails, phone calls, and meetings vocabulary',
          status: 'completed',
          teacherFeedback: {
            message:
              'Excellent! Your business vocabulary has improved significantly. Very professional tone in practice exercises.',
            practiceAreas: ['Formal vs informal register', 'Meeting phrases'],
            rating: 5,
          },
        },
        {
          id: 4,
          title: 'Describing Trends & Data',
          description: 'Discuss graphs, charts, and statistics effectively',
          status: 'upcoming',
        },
        {
          id: 5,
          title: 'Idioms & Expressions',
          description: 'Common English idioms and when to use them',
          status: 'upcoming',
        },
        {
          id: 6,
          title: 'Mid-course Speaking Test',
          description:
            'Evaluate your speaking progress with comprehensive test',
          status: 'locked',
        },
      ],
    },
    {
      id: '5',
      name: 'General Speaking',
      type: 'Skills Course',
      description: 'Improve fluency and confidence',
      totalLessons: 12,
      completedLessons: 8,
      duration: '6 weeks',
      groupSize: 4,
      spotsLeft: 1,
      schedule: 'Fridays, 5:00 PM',
      startDate: 'Started Jan 5, 2026',
      color: 'from-purple-500 to-purple-600',
      icon: MessageSquare,
      isEnrolled: true,
      lessons: [
        {
          id: 1,
          title: 'Daily Routines & Habits',
          description: 'Discuss your daily life and habits naturally',
          status: 'completed',
          teacherFeedback: {
            message:
              'Giorgi, you spoke confidently about your routine! Keep working on pronunciation of -ed endings.',
            practiceAreas: ['Pronunciation: -ed endings', 'Sentence stress'],
            rating: 4,
          },
        },
        {
          id: 2,
          title: 'Travel & Experiences',
          description: 'Share travel stories and ask about experiences',
          status: 'completed',
          teacherFeedback: {
            message:
              'Wonderful storytelling! You used past tenses accurately. Try to incorporate more descriptive adjectives.',
            practiceAreas: [
              'Descriptive vocabulary',
              'Connectors (although, however)',
            ],
            rating: 5,
          },
        },
        {
          id: 3,
          title: 'Opinions & Debates',
          description: 'Express and defend your opinions on various topics',
          status: 'upcoming',
        },
        {
          id: 4,
          title: 'Problem Solving',
          description: 'Discuss solutions to everyday problems',
          status: 'locked',
        },
      ],
    },
    {
      id: '2',
      name: 'A1.2 - Elementary English',
      type: 'Level Course',
      description: 'Continue building your foundation',
      totalLessons: 20,
      completedLessons: 0,
      duration: '10 weeks',
      groupSize: 4,
      spotsLeft: 2,
      schedule: 'Tue & Thu, 5:00 PM',
      startDate: 'Feb 5, 2026',
      color: 'from-cyan-500 to-cyan-600',
      icon: BookOpen,
      isEnrolled: false,
      lessons: [
        {
          id: 1,
          title: 'Shopping & Money',
          description: 'Learn vocabulary for shopping and handling money',
          status: 'locked',
        },
        {
          id: 2,
          title: 'Food & Restaurants',
          description:
            'Order food, describe dishes, and talk about preferences',
          status: 'locked',
        },
      ],
    },
    {
      id: '4',
      name: 'B1.2 - Intermediate English',
      type: 'Level Course',
      description: 'Master intermediate level skills',
      totalLessons: 24,
      completedLessons: 0,
      duration: '12 weeks',
      groupSize: 4,
      spotsLeft: 3,
      schedule: 'Tue & Thu, 6:30 PM',
      startDate: 'Feb 10, 2026',
      color: 'from-emerald-500 to-emerald-600',
      icon: BookOpen,
      isEnrolled: false,
      lessons: [
        {
          id: 1,
          title: 'Passive Voice',
          description: 'Understand and use passive constructions',
          status: 'locked',
        },
        {
          id: 2,
          title: 'Reported Speech',
          description: 'Report what others have said accurately',
          status: 'locked',
        },
      ],
    },
    {
      id: '6',
      name: 'Listening Comprehension',
      type: 'Skills Course',
      description: 'Develop listening skills with native speakers',
      totalLessons: 10,
      completedLessons: 0,
      duration: '5 weeks',
      groupSize: 4,
      spotsLeft: 2,
      schedule: 'Saturdays, 10:00 AM',
      startDate: 'Feb 3, 2026',
      color: 'from-orange-500 to-orange-600',
      icon: Headphones,
      isEnrolled: false,
      lessons: [
        {
          id: 1,
          title: 'Everyday Conversations',
          description: 'Listen to and understand casual conversations',
          status: 'locked',
        },
        {
          id: 2,
          title: 'News & Media',
          description: 'Comprehend news reports and podcasts',
          status: 'locked',
        },
      ],
    },
    {
      id: '7',
      name: 'Grammar Mastery',
      type: 'Skills Course',
      description: 'Deep dive into English grammar',
      totalLessons: 16,
      completedLessons: 0,
      duration: '8 weeks',
      groupSize: 4,
      spotsLeft: 0,
      schedule: 'Wed & Fri, 4:00 PM',
      startDate: 'Jan 28, 2026',
      color: 'from-pink-500 to-pink-600',
      icon: FileText,
      isEnrolled: false,
      lessons: [
        {
          id: 1,
          title: 'Articles (a, an, the)',
          description: 'Master the correct use of English articles',
          status: 'locked',
        },
        {
          id: 2,
          title: 'Prepositions',
          description: 'Learn common preposition patterns',
          status: 'locked',
        },
      ],
    },
    {
      id: '8',
      name: 'Business English',
      type: 'Specialized Course',
      description: 'English for professional environments',
      totalLessons: 15,
      completedLessons: 0,
      duration: '7.5 weeks',
      groupSize: 4,
      spotsLeft: 4,
      schedule: 'Tuesdays, 7:00 PM',
      startDate: 'Feb 12, 2026',
      color: 'from-indigo-500 to-indigo-600',
      icon: BookOpen,
      isEnrolled: false,
      lessons: [
        {
          id: 1,
          title: 'Professional Introductions',
          description: 'Introduce yourself in business contexts',
          status: 'locked',
        },
        {
          id: 2,
          title: 'Email Writing',
          description: 'Write clear and professional emails',
          status: 'locked',
        },
      ],
    },
  ];

  const toggleExpand = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed')
      return <CheckCircle className='w-5 h-5 text-green-400' />;
    if (status === 'upcoming')
      return <Circle className='w-5 h-5 text-blue-400' />;
    return <Circle className='w-5 h-5 text-gray-600' />;
  };

  return (
    <div className='h-full overflow-y-auto'>
      <div className='mb-6'>
        <h1 className='mb-2 text-xl text-white sm:text-2xl lg:text-3xl'>
          Available Courses
        </h1>
        <p className='text-sm text-gray-400 sm:text-base'>
          Choose from structured group courses (max 4 students per class)
        </p>
      </div>

      <div className='space-y-4'>
        {courses.map((course) => {
          const Icon = course.icon;
          const progress =
            (course.completedLessons / course.totalLessons) * 100;
          const isExpanded = expandedCourse === course.id;
          const isFull = course.spotsLeft === 0;

          return (
            <div
              key={course.id}
              className='overflow-hidden transition-all border border-gray-700 rounded-lg bg-gray-800/40 hover:bg-gray-800/60'
            >
              {/* Course Header */}
              <div
                className={`h-20 sm:h-24 bg-gradient-to-r ${course.color} p-4 flex items-center justify-between`}
              >
                <div className='flex items-center gap-3'>
                  <Icon className='w-8 h-8 text-white sm:w-10 sm:h-10' />
                  <div>
                    <h3 className='text-base font-semibold text-white sm:text-lg'>
                      {course.name}
                    </h3>
                    <p className='text-xs sm:text-sm text-white/80'>
                      {course.startDate}
                    </p>
                  </div>
                </div>
                <span className='px-2 py-1 text-xs rounded sm:text-sm text-white/90 bg-white/20'>
                  {course.type}
                </span>
              </div>

              {/* Course Content */}
              <div className='p-4'>
                <p className='mb-4 text-sm text-gray-400'>
                  {course.description}
                </p>

                <div className='grid grid-cols-2 gap-3 mb-4'>
                  <div className='flex items-center gap-2 text-sm text-gray-400'>
                    <BookOpen className='flex-shrink-0 w-4 h-4' />
                    <span className='text-xs sm:text-sm'>
                      {course.totalLessons} lessons
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-400'>
                    <Calendar className='flex-shrink-0 w-4 h-4' />
                    <span className='text-xs sm:text-sm'>
                      {course.duration}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-400'>
                    <Clock className='flex-shrink-0 w-4 h-4' />
                    <span className='text-xs sm:text-sm'>
                      {course.schedule}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-sm text-gray-400'>
                      <Users className='flex-shrink-0 w-4 h-4' />
                      <span className='text-xs sm:text-sm'>
                        Max {course.groupSize}
                      </span>
                    </div>
                    <div
                      className={`text-xs sm:text-sm px-2 py-1 rounded ${
                        isFull
                          ? 'bg-red-500/20 text-red-400'
                          : course.spotsLeft === 1
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {isFull ? 'Full' : `${course.spotsLeft} spots`}
                    </div>
                  </div>
                </div>

                {/* Progress Bar (if enrolled) */}
                {course.isEnrolled && (
                  <div className='mb-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <p className='text-xs text-gray-400'>Your Progress</p>
                      <p className='text-xs text-gray-300'>
                        {course.completedLessons}/{course.totalLessons}{' '}
                        completed
                      </p>
                    </div>
                    <div className='w-full h-2 overflow-hidden bg-gray-700 rounded-full'>
                      <div
                        className={`h-full bg-gradient-to-r ${course.color} transition-all`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className='flex gap-2'>
                  <button
                    onClick={() => toggleExpand(course.id)}
                    className='flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm text-white transition-all bg-gray-700 rounded-lg hover:bg-gray-600 sm:text-base'
                  >
                    {isExpanded ? (
                      <ChevronUp className='w-4 h-4' />
                    ) : (
                      <ChevronDown className='w-4 h-4' />
                    )}
                    <span>{isExpanded ? 'Hide' : 'View'} Lessons</span>
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
                      isFull
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : course.isEnrolled
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={isFull}
                  >
                    {isFull
                      ? 'Course Full'
                      : course.isEnrolled
                        ? 'Continue'
                        : 'Enroll Now'}
                  </button>
                </div>

                {/* Expanded Lessons Section */}
                {isExpanded && (
                  <div className='pt-4 mt-4 border-t border-gray-700'>
                    <h4 className='mb-3 text-sm font-semibold text-white sm:text-base'>
                      Course Lessons
                    </h4>
                    <div className='space-y-3'>
                      {course.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`p-3 rounded-lg border ${
                            lesson.status === 'completed'
                              ? 'bg-green-500/10 border-green-500/30'
                              : lesson.status === 'upcoming'
                                ? 'bg-blue-500/10 border-blue-500/30'
                                : 'bg-gray-800/50 border-gray-700'
                          }`}
                        >
                          <div className='flex items-start gap-3'>
                            <div className='flex-shrink-0 mt-0.5'>
                              {getStatusIcon(lesson.status)}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-start justify-between mb-1'>
                                <h5 className='text-sm text-white sm:text-base'>
                                  Lesson {lesson.id}: {lesson.title}
                                </h5>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ml-2 ${
                                    lesson.status === 'completed'
                                      ? 'bg-green-500/20 text-green-400'
                                      : lesson.status === 'upcoming'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-gray-700 text-gray-400'
                                  }`}
                                >
                                  {lesson.status === 'completed'
                                    ? 'Completed'
                                    : lesson.status === 'upcoming'
                                      ? 'Next'
                                      : 'Locked'}
                                </span>
                              </div>
                              <p className='mb-2 text-xs text-gray-400 sm:text-sm'>
                                {lesson.description}
                              </p>

                              {/* Teacher Feedback */}
                              {lesson.teacherFeedback && (
                                <div className='p-3 mt-3 border border-gray-700 rounded-lg bg-gray-900/50'>
                                  <div className='flex items-center gap-2 mb-2'>
                                    <MessageCircleMore className='w-4 h-4 text-blue-400' />
                                    <span className='text-xs font-semibold text-blue-400'>
                                      Teacher Feedback
                                    </span>
                                    <div className='flex items-center gap-1 ml-auto'>
                                      {[...Array(5)].map((_, i) => (
                                        <span
                                          key={i}
                                          className={`text-xs ${
                                            i < lesson.teacherFeedback!.rating
                                              ? 'text-yellow-400'
                                              : 'text-gray-600'
                                          }`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <p className='mb-2 text-xs italic text-gray-300 sm:text-sm'>
                                    "{lesson.teacherFeedback.message}"
                                  </p>
                                  <div className='mt-2'>
                                    <p className='mb-1 text-xs text-gray-400'>
                                      Areas to practice:
                                    </p>
                                    <div className='flex flex-wrap gap-1'>
                                      {lesson.teacherFeedback.practiceAreas.map(
                                        (area, idx) => (
                                          <span
                                            key={idx}
                                            className='px-2 py-1 text-xs text-orange-400 rounded bg-orange-500/20'
                                          >
                                            {area}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
