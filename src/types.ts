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

export type LessonTypeT = '1on1' | 'group';
export const LEVEL_OPTIONS = [
  'A1.1',
  'A1.2',
  'A2.1',
  'A2.2',
  'B1.1',
  'B1.2',
  'B2.1',
  'B2.2',
  'C1.1',
  'C1.2',
  'C2.1',
  'C2.2',
] as const;
export type LevelT = (typeof LEVEL_OPTIONS)[number];

export interface LessonT {
  id: string;
  date: number;
  status: StatusT;
  lessonType: LessonTypeT;
  level?: LevelT;
  participantIds?: string[];
  participantCount: number;
  maxParticipants: number;
  topic: TopicT | null;
  teacher: TeacherT | null;
  student?: StudentT | null;
  studentId?: string;
  createdBy?: string;
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
  tokens: number; // Legacy flexible tokens (backward compatibility)
  used_tokens: number; // Legacy flexible token usage
  group_tokens?: number;
  used_group_tokens?: number;
  one_on_one_tokens?: number;
  used_one_on_one_tokens?: number;
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
  level?: LevelT;
  lesson_type?: LessonTypeT;
  max_students?: number;
  participant_ids?: string[];
  participant_token_sources?: Record<string, 'group' | '1on1' | 'legacy'>;
  participant_count?: number;
  created_by?: string;
  valid_min_students?: number;
  student_id: string;
  student_first_name?: string;
  student_last_name?: string;
  teacher_id: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  teacher_img?: string;
  teacher_rating?: number;
  student_link: string | null;
  teacher_link: string | null;
  zoom_meeting_id?: number | null;
  cancelled_by?: 'student' | 'teacher' | 'system';
  cancelled_at?: Timestamp;
  cancelled_reason?: string;
}
export interface TeacherT {
  first_name: string;
  last_name: string;
  img: string;
  rating: number;
}

export interface StudentT {
  first_name: string;
  last_name: string;
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
