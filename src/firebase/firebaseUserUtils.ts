import { httpsCallable } from 'firebase/functions';
import { doc, updateDoc } from 'firebase/firestore';
import { functions, db, auth } from './firebase-config';

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

export const updateUserNames = async (firstName: string, lastName: string) => {
  const updateUserNamesFn = httpsCallable(functions, 'updateUserNames');
  return await updateUserNamesFn({
    first_name: firstName,
    last_name: lastName,
  });
};
