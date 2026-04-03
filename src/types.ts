import { Timestamp } from 'firebase/firestore';

export type StatusT =
  | 'finished'
  | 'scheduled'
  | 'in-progress'
  | 'missed_student'
  | 'missed_teacher'
  | 'cancelled_student'
  | 'cancelled_teacher'
  | 'cancelled_system';

export interface LessonT {
  id: string;
  date: number;
  status: StatusT;
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
  // Common fields
  first_name: string;
  last_name: string;
  roles: {
    student: boolean;
    teacher: boolean;
  };
  notifications: NotificationT[]; // ⚠️ SUBCOLLECTION: users/{userId}/notifications

  // Student fields
  classes: string[]; // Classes the user is taking
  tokens: number;
  used_tokens: number;
  student_ratings?: {
    [raterId: string]: { rating: number; comment?: string }[];
  }; // ⚠️ SUBCOLLECTION: users/{userId}/student_ratings

  // Teacher fields
  teaching_classes: string[]; // Classes the teacher is teaching/scheduled
  teacher_ratings?: {
    [raterId: string]: { rating: number; comment?: string }[];
  }; // ⚠️ SUBCOLLECTION: users/{userId}/teacher_ratings
  teacher_bio?: string;
  teacher_motivation?: string;
  teacher_education?: string;
  teacher_years_experience?: string;
  teacher_certificates?: string;
  teacher_native_language?: string;
  teacher_proficiency_level?: string;
  teacher_status?: 'pending' | 'approved' | 'rejected';
  last_applied_teacher?: number;
  cv_file_path?: string; // Path to CV in Storage
  pfp_file_path?: string; // Path to profile picture in Storage
  video_file_path?: string; // Path to intro video in Storage
}
export interface ClassesT {
  date: number;
  status: StatusT;
  topic_id: string;
  student_id: string;
  teacher_id: string;
  student_link: string | null;
  teacher_link: string | null;
  cancelled_by?: 'student' | 'teacher';
  cancelled_at?: Timestamp;
}
export interface TeacherT {
  first_name: string;
  last_name: string;
  img: string;
  rating: number;
}
export interface BlockDetailsT {
  date: number;
  isDisabled: boolean;
  currLesson: LessonT | null;
}

export interface FileMetadataT {
  id: string;
  name: string; // Original filename
  type: string; // MIME type (e.g., 'video/mp4', 'text/csv')
  size: number; // File size in bytes
  url: string; // Download URL from Firebase Storage
  storagePath: string; // Path in Firebase Storage
  uploadedAt: number; // Timestamp
  folder: string; // Subfolder (e.g., 'videos', 'documents', 'csvs')
}
