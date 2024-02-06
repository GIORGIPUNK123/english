export interface LessonT {
  day: number;
  time: number;
  month: number;
  topic: string;
}

export interface BlockDetailsT {
  date: Date | null;
  isDisabled: boolean;
  currLesson: LessonT | null;
}
export interface BlockT {
  name?: string;
  time?: number;
  blockTime: number;
  blockDay: number;
  blockMonth: number;
  blockYear: number;
  disabled?: boolean;
  setIsModalOn: any;
}
export interface FormInputT {
  onChange: any;
  onBlur: any;
  value: string | number;
  placeholder: string;
  name: string;
  error?: string;
}
