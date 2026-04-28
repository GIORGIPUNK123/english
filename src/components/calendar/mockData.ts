import { LessonT, TopicT, TeacherT } from '../../types';

// Example lessons with Unix timestamps (these would come from database)
export const mockLessons: LessonT[] = [
  {
    id: '1',
    date: 1768545600, // Jan 13, 2026 09:00 (Monday)
    status: 'scheduled',
    lessonType: '1on1',
    participantCount: 1,
    maxParticipants: 1,
    topic: {
      id: 'topic-1',
      heading: 'Business English',
    },
    teacher: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      rating: 4.9,
    },
    link: null,
  },
  {
    id: '2',
    date: 1768581600, // Jan 13, 2026 19:00 (Monday)
    status: 'scheduled',
    lessonType: 'group',
    participantCount: 4,
    maxParticipants: 5,
    topic: {
      id: 'topic-2',
      heading: 'B1.1 Group Class',
    },
    teacher: {
      first_name: 'Michael',
      last_name: 'Chen',
      img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      rating: 4.8,
    },
    link: null,
  },
  {
    id: '3',
    date: 1768637400, // Jan 14, 2026 10:30 (Tuesday)
    status: 'scheduled',
    lessonType: 'group',
    participantCount: 1,
    maxParticipants: 5,
    topic: {
      id: 'topic-3',
      heading: 'Conversation Practice',
    },
    teacher: null, // Pending - no teacher assigned yet
    link: null,
  },
  {
    id: '4',
    date: 1768722000, // Jan 15, 2026 14:00 (Wednesday)
    status: 'finished',
    lessonType: '1on1',
    participantCount: 1,
    maxParticipants: 1,
    topic: {
      id: 'topic-4',
      heading: 'Grammar & Writing',
    },
    teacher: {
      first_name: 'Emma',
      last_name: 'Williams',
      img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      rating: 4.95,
    },
    link: 'https://meet.example.com/abc123',
  },
  {
    id: '5',
    date: 1768668000, // Jan 14, 2026 19:00 (Tuesday)
    status: 'scheduled',
    lessonType: 'group',
    participantCount: 3,
    maxParticipants: 5,
    topic: {
      id: 'topic-2',
      heading: 'B1.1 Group Class',
    },
    teacher: {
      first_name: 'Michael',
      last_name: 'Chen',
      img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      rating: 4.8,
    },
    link: null,
  },
  {
    id: '6',
    date: 1768811400, // Jan 16, 2026 18:30 (Thursday)
    status: 'scheduled',
    lessonType: '1on1',
    participantCount: 1,
    maxParticipants: 1,
    topic: {
      id: 'topic-5',
      heading: 'IELTS Preparation',
    },
    teacher: {
      first_name: 'David',
      last_name: 'Martinez',
      img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      rating: 4.85,
    },
    link: null,
  },
  {
    id: '7',
    date: 1768893600, // Jan 17, 2026 17:00 (Friday)
    status: 'in-progress',
    lessonType: '1on1',
    participantCount: 1,
    maxParticipants: 1,
    topic: {
      id: 'topic-6',
      heading: 'General Speaking',
    },
    teacher: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      rating: 4.9,
    },
    link: 'https://meet.example.com/xyz789',
  },
  {
    id: '8',
    date: 1768974600, // Jan 18, 2026 13:30 (Saturday)
    status: 'scheduled',
    lessonType: '1on1',
    participantCount: 1,
    maxParticipants: 1,
    topic: {
      id: 'topic-7',
      heading: 'Listening Practice',
    },
    teacher: null,
    link: null,
  },
  {
    id: '9',
    date: 1768538400, // Jan 13, 2026 07:30 (Monday)
    status: 'finished',
    lessonType: '1on1',
    participantCount: 1,
    maxParticipants: 1,
    topic: {
      id: 'topic-8',
      heading: 'Morning Conversation',
    },
    teacher: {
      first_name: 'Emma',
      last_name: 'Williams',
      img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      rating: 4.95,
    },
    link: null,
  },
  {
    id: '10',
    date: 1768910400, // Jan 17, 2026 22:00 (Friday)
    status: 'scheduled',
    lessonType: '1on1',
    participantCount: 1,
    maxParticipants: 1,
    topic: {
      id: 'topic-9',
      heading: 'Late Night Study',
    },
    teacher: {
      first_name: 'Michael',
      last_name: 'Chen',
      img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      rating: 4.8,
    },
    link: null,
  },
];

// Available topics for lesson scheduling
export const availableTopics: TopicT[] = [
  { id: 'topic-1', heading: 'General Conversation' },
  { id: 'topic-2', heading: 'Business English' },
  { id: 'topic-5', heading: 'IELTS Preparation' },
  { id: 'topic-4', heading: 'Grammar & Writing' },
  { id: 'topic-10', heading: 'Pronunciation' },
  { id: 'topic-11', heading: 'Vocabulary Building' },
  { id: 'topic-12', heading: 'Reading Comprehension' },
  { id: 'topic-7', heading: 'Listening Skills' },
  { id: 'topic-6', heading: 'Speaking Practice' },
  { id: 'topic-13', heading: 'Job Interview Preparation' },
  { id: 'topic-14', heading: 'Academic English' },
  { id: 'topic-15', heading: 'Travel English' },
];

// Available teachers for lesson scheduling
export const availableTeachers: TeacherT[] = [
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    rating: 4.9,
  },
  {
    first_name: 'Michael',
    last_name: 'Chen',
    img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    rating: 4.8,
  },
  {
    first_name: 'Emma',
    last_name: 'Williams',
    img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    rating: 4.95,
  },
  {
    first_name: 'David',
    last_name: 'Martinez',
    img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    rating: 4.85,
  },
];
