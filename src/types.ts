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
  link: string | null;
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
export interface OptionT {
  label: string;
  id: number | string;
}
export interface SelectSmallObjectT {
  defaultId: number;
  options: OptionT[];
}
export interface NotificationT {
  created_at: number;
  id: string;
  teacher?: TeacherT | null;
  teacher_id?: string;
  message_type:
    | 'info'
    | 'success'
    | 'warning'
    | 'course'
    | 'assignment'
    | 'calendar'
    | 'group'
    | 'achievement';
  message: string;
  heading: string;
  read: boolean;
}
export interface UserDataT {
  classes: string[];
  notifications: NotificationT[];
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
  link: string | null;
}
export interface TeacherT {
  first_name: string;
  last_name: string;
  img: string;
  rating: number;
}
