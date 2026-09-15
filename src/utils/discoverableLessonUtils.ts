import { LessonT } from '../types';

export type DiscoverableLessonDto = {
  id: string;
  date: number;
  status: LessonT['status'];
  lessonType: LessonT['lessonType'];
  level?: LessonT['level'];
  participantIds: string[];
  participantCount: number;
  maxParticipants: number;
  topic: { id: string; heading: string } | null;
  teacher: {
    first_name: string;
    last_name: string;
    img: string;
    rating: number;
  } | null;
  student: { first_name: string; last_name: string } | null;
  studentId: string;
  createdBy: string;
};

export const discoverableLessonToLessonT = (
  dto: DiscoverableLessonDto,
): LessonT => ({
  id: dto.id,
  date: dto.date,
  status: dto.status,
  lessonType: dto.lessonType,
  level: dto.level,
  participantIds: dto.participantIds,
  participantCount: dto.participantCount,
  maxParticipants: dto.maxParticipants,
  topic: dto.topic,
  teacher: dto.teacher,
  student: dto.student,
  studentId: dto.studentId,
  createdBy: dto.createdBy,
  link: null,
});
