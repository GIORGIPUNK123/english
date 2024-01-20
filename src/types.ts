export interface LessonType {
  day: number;
  time: number;
  month: number;
  topic: string;
}

export interface BlockDetailsType {
  date: Date | null;
  isDisabled: boolean;
  currLesson: LessonType | null;
}
