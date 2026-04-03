import { httpsCallable } from 'firebase/functions';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { functions, db, auth } from './firebase-config';
import { UserDataT, NotificationT } from '../types';

/**
 * Register a new user with email and password
 * Requires first_name and last_name
 */
export const registerNewUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) => {
  const registerUserFn = httpsCallable(functions, 'registerUser');
  return await registerUserFn({
    email,
    password,
    firstName,
    lastName,
  });
};

/**
 * Register a new user with social provider
 * Called after social authentication (Google, Facebook, etc.)
 * User can set first_name and last_name later via updateUserField
 */
export const registerSocialUser = async (
  uid: string,
  email: string,
  provider: 'google' | 'facebook' | 'twitter' | 'apple',
) => {
  const registerSocialFn = httpsCallable(functions, 'registerSocialUser');
  return await registerSocialFn({
    uid,
    email,
    provider,
  });
};

/**
 * Helper function to convert File to base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Register a new teacher with files
 * Handles complete teacher registration including file uploads
 */
export const registerTeacherUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  bio: string,
  motivation: string,
  resumeFile: File,
  videoFile?: File | null,
) => {
  // Convert files to base64
  const resumeData = await fileToBase64(resumeFile);

  const data: any = {
    email,
    password,
    firstName,
    lastName,
    bio,
    motivation,
    resumeData,
    resumeName: resumeFile.name,
    resumeType: resumeFile.type,
  };

  // Add video if provided
  if (videoFile) {
    const videoData = await fileToBase64(videoFile);
    data.videoData = videoData;
    data.videoName = videoFile.name;
    data.videoType = videoFile.type;
  }

  const registerTeacherFn = httpsCallable(functions, 'registerTeacherUser');
  return await registerTeacherFn(data);
};

type SubmitTeacherApplicationData = {
  teacher_bio: string;
  teacher_motivation: string;
  teacher_education: string;
  teacher_years_experience: string;
  teacher_certificates?: string;
  teacher_native_language: string;
  teacher_proficiency_level: string;
  teacher_status: 'pending';
  last_applied_teacher: number;
};

export const submitTeacherApplication = async (
  data: SubmitTeacherApplicationData,
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('You must be logged in to apply as a teacher');
  }

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};

/**
 * Get current user's complete profile (all UserDataT fields)
 */
export const fetchCurrentUserData = async (): Promise<UserDataT> => {
  const getCurrentUserFn = httpsCallable(functions, 'getCurrentUser');
  const result = await getCurrentUserFn();
  return result.data as UserDataT;
};

/**
 * Fetch notifications from subcollection
 * Path: users/{userId}/notifications
 */
export const fetchUserNotifications = async (
  userId: string,
): Promise<NotificationT[]> => {
  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(notificationsRef, orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as NotificationT[];
};

/**
 * Fetch unread notifications only
 */
export const fetchUnreadNotifications = async (
  userId: string,
): Promise<NotificationT[]> => {
  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(
    notificationsRef,
    where('read', '==', false),
    orderBy('created_at', 'desc'),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as NotificationT[];
};

/**
 * Fetch student ratings from subcollection
 * Path: users/{userId}/student_ratings
 */
export const fetchStudentRatings = async (userId: string) => {
  const ratingsRef = collection(db, 'users', userId, 'student_ratings');
  const snapshot = await getDocs(ratingsRef);

  return snapshot.docs.map((doc) => ({
    raterId: doc.id,
    ...doc.data(),
  }));
};

/**
 * Fetch teacher ratings from subcollection
 * Path: users/{userId}/teacher_ratings
 */
export const fetchTeacherRatings = async (userId: string) => {
  const ratingsRef = collection(db, 'users', userId, 'teacher_ratings');
  const snapshot = await getDocs(ratingsRef);

  return snapshot.docs.map((doc) => ({
    raterId: doc.id,
    ...doc.data(),
  }));
};

/**
 * Update specific user fields
 */
export const updateUserField = async (field: keyof UserDataT, value: any) => {
  const updateUserFn = httpsCallable(functions, 'updateUserField');
  return await updateUserFn({ field, value });
};

/**
 * Update user's first and last name (one-time setup)
 */
export const updateUserNames = async (firstName: string, lastName: string) => {
  const updateUserNamesFn = httpsCallable(functions, 'updateUserNames');
  const response = await updateUserNamesFn({
    first_name: firstName,
    last_name: lastName,
  });
  console.log('updateUserNames response:', response);
  return response;
};

/**
 * Get current user's student rating average
 */
export const getStudentRatingAverage = async () => {
  const getAverageFn = httpsCallable(functions, 'getStudentRatingAverage');
  const result = await getAverageFn();
  return result.data as { average: number; count: number };
};

/**
 * Get current user's teacher rating average
 */
export const getTeacherRatingAverage = async () => {
  const getAverageFn = httpsCallable(functions, 'getTeacherRatingAverage');
  const result = await getAverageFn();
  return result.data as { average: number; count: number };
};

/**
 * Upgrade user to teacher role
 */
export const upgradeToTeacher = async (bio: string) => {
  const upgradeTeacherFn = httpsCallable(functions, 'upgradeToTeacher');
  return await upgradeTeacherFn({ bio });
};

/**
 * Add a student rating
 * Path: users/{userId}/student_ratings/{raterId}
 */
export const addStudentRating = async (
  userId: string,
  raterId: string,
  rating: number,
  comment?: string,
) => {
  const ratingRef = collection(db, 'users', userId, 'student_ratings');
  await getDocs(query(ratingRef, where('__name__', '==', raterId)));
  // Use set with merge to add/update rating
  const docRef = doc(db, 'users', userId, 'student_ratings', raterId);
  return await setDoc(
    docRef,
    { rating, comment, rated_at: new Date() },
    { merge: true },
  );
};

/**
 * Add a teacher rating
 * Path: users/{userId}/teacher_ratings/{raterId}
 */
export const addTeacherRating = async (
  userId: string,
  raterId: string,
  rating: number,
  comment?: string,
) => {
  const docRef = doc(db, 'users', userId, 'teacher_ratings', raterId);
  return await setDoc(
    docRef,
    { rating, comment, rated_at: new Date() },
    { merge: true },
  );
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  const markReadFn = httpsCallable(functions, 'markNotificationAsRead');
  return await markReadFn({ notificationId });
};

export const userUtils = {
  registerNewUser,
  registerSocialUser,
  submitTeacherApplication,
  fetchCurrentUserData,
  fetchUserNotifications,
  fetchUnreadNotifications,
  fetchStudentRatings,
  fetchTeacherRatings,
  addStudentRating,
  addTeacherRating,
  updateUserField,
  updateUserNames,
  getStudentRatingAverage,
  getTeacherRatingAverage,
  upgradeToTeacher,
  markNotificationAsRead,
};
