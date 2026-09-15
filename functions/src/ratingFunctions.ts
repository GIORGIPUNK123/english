import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { db } from './firebaseAdmin';

type StudentRatingDoc = {
  rating?: number;
  comment?: string;
};

export const computeAverageFor = async (
  userId: string,
  collectionName: 'student_ratings' | 'teacher_ratings',
) => {
  const ratingsSnap = await db
    .collection('users')
    .doc(userId)
    .collection(collectionName)
    .get();

  let total = 0;
  let count = 0;
  const ratings = ratingsSnap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as StudentRatingDoc) }))
    .filter((doc) => typeof doc.rating === 'number');

  for (const ratingDoc of ratings) {
    total += ratingDoc.rating as number;
    count += 1;
  }

  return {
    average: count > 0 ? total / count : 0,
    count,
  };
};

export const getTeacherRatingAverage = onCall(async ({ auth }) => {
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Login required');
  }

  return await computeAverageFor(auth.uid, 'teacher_ratings');
});
