export interface LessonT {
  date: number;
  topic: string;
}
export interface BlockDetailsT {
  date: Date;
  isDisabled: boolean;
  currLesson: LessonT | null;
}
export interface BlockT {
  name?: string;
  time?: number;
  date: Date;
  disabled?: boolean;
  setIsModalOn: (x: boolean) => void;
  setClickedBlockDate: (d: Date) => void;
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
  id: number;
  text: string;
  value: string | undefined;
}
