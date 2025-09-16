export interface LessonT {
  date: number;
  status:
    | 'finished'
    | 'scheduled'
    | 'in-progress'
    | 'missed_student'
    | 'missed_teacher'
    | 'cancelled_student'
    | 'cancelled_teacher';
  topic: string;
}
export interface BlockDetailsT {
  date: Date;
  isDisabled: boolean;
  currLesson: LessonT | null;
}
export interface BlockT {
  border: boolean;
  name?: string;
  time?: number;
  date: Date;
  disabled?: boolean;
  setIsModalOn: (x: boolean) => void;
  setDefaultBlockDate: (d: Date) => void;
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
export interface userDataT {
  classes: LessonT[];
  first_name: string;
  last_name: string;
  role: 'student' | 'teacher';
}
