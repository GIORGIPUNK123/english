export interface LessonT {
  id: string;
  date: number;
  status:
    | 'finished'
    | 'scheduled'
    | 'in-progress'
    | 'missed_student'
    | 'missed_teacher'
    | 'cancelled_student'
    | 'cancelled_teacher';
  topic: TopicT | null;
  teacher: TeacherT | null;
}
export interface BlockDetailsT {
  date: Date;
  isDisabled: boolean;
  currLesson: LessonT | null;
}
export interface LessonHoverT {
  isHovering: boolean;
  isStart: boolean; // true for the first 30min half, false for the second
}
export interface BlockT {
  currLesson?: LessonT | null;
  border: boolean;
  startTopic?: TopicT | null;
  endTopic?: TopicT | null;
  time?: number;
  date: Date;
  disabled?: boolean;
  disabledForHover?: boolean;
  setIsModalOn: (x: boolean) => void;
  setDefaultBlockDate: (d: Date) => void;
  hasLesson: boolean;
  lessons: LessonT[];
  // hovered: boolean | null; // <-- Add this line
  // lessonHover?: LessonHoverT;
  // onMouseEnter?: () => void; // <-- Add this line
  // onMouseLeave?: () => void; // <-- Add this line
}
export interface FormInputT {
  onChange: any;
  onBlur: any;
  value: string | number;
  placeholder: string;
  name: string;
  error?: string;
}
export interface TopicT {
  id: string;
  heading: string;
}
export interface optionT {
  label: string;
  id: number | string;
}
export interface selectSmallObjectT {
  defaultId: number;
  options: optionT[];
}
export interface notificationT {
  id: string;
  teacher?: TeacherT | null;
  teacher_id?: string;
  message_type: 'regular' | 'positive' | 'negative';
  message: string;
  heading: string;
  read: boolean;
}
export interface userDataT {
  classes: {
    id: string;
  }[];
  notifications: {
    id: string;
    teacher_id?: string;
    message_type: 'regular' | 'positive' | 'negative';
    message: string;
    heading: string;
    read: boolean;
  }[];
  first_name: string;
  last_name: string;
  role: 'student' | 'teacher';
  tokens: number;
  used_tokens: number;
}
export interface ClassesT {
  date: number;
  status:
    | 'finished'
    | 'scheduled'
    | 'in-progress'
    | 'missed_student'
    | 'missed_teacher'
    | 'cancelled_student'
    | 'cancelled_teacher';
  topic_id: string;
  student_id: string;
  teacher_id: string;
}
export interface TeacherT {
  first_name: string;
  last_name: string;
  img: string;
  rating: number;
}
