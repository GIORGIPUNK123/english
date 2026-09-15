import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as functions from 'firebase-functions/v1';
import { admin, db } from './firebaseAdmin';
export interface UserDataT {
  // Common fields
  first_name: string;
  last_name: string;
  roles: {
    student: boolean;
    teacher: boolean;
  };
  notifications: any[]; // ⚠️ SUBCOLLECTION: users/{userId}/notifications

  // Student fields
  classes: string[]; // Classes the user is taking
  tokens: number;
  used_tokens: number;
  group_tokens: number;
  used_group_tokens: number;
  one_on_one_tokens: number;
  used_one_on_one_tokens: number;
  student_ratings?: {
    [raterId: string]: { rating: number; comment?: string }[];
  }; // ⚠️ SUBCOLLECTION: users/{userId}/student_ratings

  // Teacher fields
  teaching_classes: string[]; // Classes the teacher is teaching/scheduled
  teacher_ratings?: {
    [raterId: string]: { rating: number; comment?: string }[];
  }; // ⚠️ SUBCOLLECTION: users/{userId}/teacher_ratings
  teacher_bio?: string;
}

export const createFirestoreUser = functions.auth
  .user()
  .onCreate(async (user) => {
    const userRef = admin.firestore().collection('users').doc(user.uid);
    const existing = await userRef.get();
    if (existing.exists) {
      return;
    }

    await userRef.set({
        email: user.email,
        created_at: Math.floor(Date.now() / 1000),
        first_name: '',
        last_name: '',
        roles: {
          student: true,
          teacher: false,
        },
        classes: [],
        tokens: 0,
        used_tokens: 0,
        group_tokens: 0,
        used_group_tokens: 0,
        one_on_one_tokens: 0,
        used_one_on_one_tokens: 0,
        teaching_classes: [],
    });

    const notificationId = db.collection('users').doc().id;
    await db
      .collection('users')
      .doc(user.uid)
      .collection('notifications')
      .doc(notificationId)
      .set({
        created_at: Math.floor(Date.now() / 1000),
        heading: 'Welcome to English Learning Platform!',
        message:
          'Thank you for joining! Start by completing your profile and booking your first lesson.',
        message_type: 'achievement',
        read: false,
      });
    return notificationId;
  });

/**
 * Register a new user with email and password
 */
export const registerUser = onCall<{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}>(async ({ data }) => {
  const { email, password, firstName, lastName } = data;

  // Validate input
  if (!email || !password || !firstName || !lastName) {
    throw new HttpsError(
      'invalid-argument',
      'Email, password, firstName, and lastName are required',
    );
  }

  if (password.length < 6) {
    throw new HttpsError(
      'invalid-argument',
      'Password must be at least 6 characters',
    );
  }

  try {
    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
    });

    // Create Firestore document directly (don't wait for trigger)
    await db
      .collection('users')
      .doc(userRecord.uid)
      .set({
        email,
        created_at: Math.floor(Date.now() / 1000),
        first_name: firstName,
        last_name: lastName,
        roles: {
          student: true,
          teacher: false,
        },
        classes: [],
        tokens: 0,
        used_tokens: 0,
        group_tokens: 0,
        used_group_tokens: 0,
        one_on_one_tokens: 0,
        used_one_on_one_tokens: 0,
        teaching_classes: [],
      });

    // Create welcome notification
    const notificationId = db.collection('users').doc().id;
    await db
      .collection('users')
      .doc(userRecord.uid)
      .collection('notifications')
      .doc(notificationId)
      .set({
        created_at: Math.floor(Date.now() / 1000),
        heading: 'Welcome to English Learning Platform!',
        message:
          'Thank you for joining! Start by completing your profile and booking your first lesson.',
        message_type: 'achievement',
        read: false,
      });

    return {
      success: true,
      uid: userRecord.uid,
      message: 'User registered successfully',
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-exists') {
      throw new HttpsError(
        'already-exists',
        'An account with this email already exists',
      );
    }
    throw new HttpsError('internal', 'Registration failed: ' + error.message);
  }
});

// const storage = new Storage();
// const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET!);

// interface TeacherFields {
//   email: string;
//   password: string;
//   firstName: string;
//   lastName: string;
//   phone: string;
//   country: string;
//   education: string;
//   yearsExperience: string;
//   teachingCertificates: string;
//   nativeLanguage: string;
//   proficiencyLevel: string;
//   bio: string;
//   motivation: string;
//   _uid?: string;
// }

// export const registerTeacherUser = onRequest(
//   async (req: Request, res: Response) => {
//     if (req.method !== 'POST') {
//       return res.status(405).send('Method Not Allowed');
//     }

//     const busboy = Busboy({ headers: req.headers });

//     const fields: Partial<TeacherFields> = {};
//     let resumePath: string | null = null;
//     let videoPath: string | null = null;

//     busboy.on('field', (name: string, value: string) => {
//       fields[name as keyof TeacherFields] = value as any;
//     });

//     busboy.on(
//       'file',
//       async (
//         fieldname: string,
//         file: NodeJS.ReadableStream,
//         info: { filename: string; mimeType: string },
//       ) => {
//         const { filename, mimeType } = info;

//         // ✅ File validation
//         if (
//           fieldname === 'resume' &&
//           ![
//             'application/pdf',
//             'application/msword',
//             'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//           ].includes(mimeType)
//         ) {
//           file.resume();
//           throw new Error('Invalid resume type');
//         }

//         if (
//           fieldname === 'videoIntro' &&
//           !['video/mp4', 'video/webm', 'video/quicktime'].includes(mimeType)
//         ) {
//           file.resume();
//           throw new Error('Invalid video type');
//         }

//         // ✅ Create user once
//         if (!fields._uid) {
//           const userRecord = await admin.auth().createUser({
//             email: fields.email!,
//             password: fields.password!,
//             emailVerified: false,
//           });
//           fields._uid = userRecord.uid;
//         }

//         const uid = fields._uid!;
//         let filePath = '';

//         if (fieldname === 'resume') {
//           filePath = `teacher-applications/${uid}/resume.${filename.split('.').pop()}`;
//           resumePath = filePath;
//         }

//         if (fieldname === 'videoIntro') {
//           filePath = `teacher-applications/${uid}/intro.${filename.split('.').pop()}`;
//           videoPath = filePath;
//         }

//         const uploadStream = bucket.file(filePath).createWriteStream({
//           metadata: { contentType: mimeType },
//         });

//         file.pipe(uploadStream);
//       },
//     );

//     busboy.on('finish', async () => {
//       try {
//         const uid = fields._uid!;
//         const now = Math.floor(Date.now() / 1000);

//         // 🔥 Firestore user document
//         await admin
//           .firestore()
//           .collection('users')
//           .doc(uid)
//           .set({
//             email: fields.email,
//             created_at: now,
//             first_name: fields.firstName,
//             last_name: fields.lastName,
//             phone: fields.phone,
//             country: fields.country,
//             roles: {
//               student: true,
//               teacher: false,
//             },
//             classes: [],
//             tokens: 0,
//             used_tokens: 0,
//             teaching_classes: [],

//             // Teacher info
//             teacher_education: fields.education,
//             teacher_years_experience: fields.yearsExperience,
//             teacher_certificates: fields.teachingCertificates,
//             teacher_native_language: fields.nativeLanguage,
//             teacher_proficiency_level: fields.proficiencyLevel,
//             teacher_bio: fields.bio,
//             teacher_motivation: fields.motivation,
//             teacher_status: 'pending',
//             last_applied_teacher: now,

//             file_paths: [resumePath, videoPath].filter(Boolean),
//           });

//         // 🔔 Notification
//         const notificationId = admin.firestore().collection('users').doc().id;
//         await admin
//           .firestore()
//           .collection('users')
//           .doc(uid)
//           .collection('notifications')
//           .doc(notificationId)
//           .set({
//             created_at: now,
//             heading: 'Welcome to English Learning Platform!',
//             message:
//               'Your teacher application has been submitted and is under review.',
//             message_type: 'achievement',
//             read: false,
//           });

//         res.status(200).json({
//           success: true,
//           uid,
//           message: 'Teacher registered and files uploaded successfully',
//         });
//       } catch (err: any) {
//         console.error('Teacher register error:', err);
//         res.status(500).json({
//           success: false,
//           error: err.message,
//         });
//       }
//     });

//     req.pipe(busboy);
//   },
// );
/**
 * Register a social user (Google, Facebook, etc.)
 */
export const registerSocialUser = onCall<{
  uid: string;
  email: string;
  provider: 'google' | 'facebook' | 'twitter' | 'apple';
}>(async ({ data }) => {
  const { uid, email, provider } = data;

  if (!uid || !email || !provider) {
    throw new HttpsError(
      'invalid-argument',
      'UID, email, and provider are required',
    );
  }

  try {
    // Check if user document already exists
    const userDoc = await db.collection('users').doc(uid).get();

    if (userDoc.exists) {
      return {
        success: true,
        message: 'User already registered',
        uid,
      };
    }

    // Create Firestore document for social user
    await db
      .collection('users')
      .doc(uid)
      .set({
        email,
        provider,
        created_at: Math.floor(Date.now() / 1000),
        first_name: '',
        last_name: '',
        roles: {
          student: true,
          teacher: false,
        },
        classes: [],
        tokens: 0,
        used_tokens: 0,
        group_tokens: 0,
        used_group_tokens: 0,
        one_on_one_tokens: 0,
        used_one_on_one_tokens: 0,
        teaching_classes: [],
      });

    // Create welcome notification
    const notificationId = db.collection('users').doc().id;
    await db
      .collection('users')
      .doc(uid)
      .collection('notifications')
      .doc(notificationId)
      .set({
        created_at: Math.floor(Date.now() / 1000),
        heading: 'Welcome to English Learning Platform!',
        message:
          'Thank you for joining! Start by completing your profile and booking your first lesson.',
        message_type: 'achievement',
        read: false,
      });

    return {
      success: true,
      uid,
      message: 'Social user registered successfully',
    };
  } catch (error: any) {
    console.error('Social registration error:', error);
    throw new HttpsError('internal', 'Registration failed: ' + error.message);
  }
});

/**
 * Get current user's data (includes all UserDataT fields)
 */
export const getCurrentUser = onCall(async ({ auth }) => {
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Login required');
  }

  const userDoc = await db.collection('users').doc(auth.uid).get();

  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User profile not found');
  }

  return userDoc.data();
});

/**
 * Update user name and surname field safely
 * Only allows updating certain fields to prevent security issues
 */

export const updateUserNames = onCall<{
  first_name: string;
  last_name: string;
}>(async ({ auth, data }) => {
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Login required');
  }

  const { first_name, last_name } = data;

  // Validate name fields
  if (
    (first_name && typeof first_name !== 'string') ||
    (last_name && typeof last_name !== 'string')
  ) {
    throw new HttpsError('invalid-argument', 'Name fields must be strings');
  }

  if (
    (first_name && first_name.trim().length < 2) ||
    (last_name && last_name.trim().length < 2)
  ) {
    throw new HttpsError(
      'invalid-argument',
      'Name fields must be at least 2 characters long',
    );
  }

  try {
    const userDoc = await db.collection('users').doc(auth.uid).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User profile not found');
    }

    const userData = userDoc.data() as UserDataT;
    if (userData?.roles?.teacher) {
      throw new HttpsError(
        'permission-denied',
        'Only student accounts can update name fields',
      );
    }

    await db
      .collection('users')
      .doc(auth.uid)
      .update({ first_name, last_name });

    return { success: true, message: 'Name fields updated successfully' };
  } catch (error: any) {
    throw new HttpsError('internal', 'Update failed: ' + error.message);
  }
});

/**
 * Upgrade user to teacher
 */
type UpgradeTeacherData = {
  bio: string;
};

export const upgradeToTeacher = onCall<UpgradeTeacherData>(
  async ({ auth, data }) => {
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Login required');
    }

    const { bio } = data;

    if (!bio || bio.trim().length < 10) {
      throw new HttpsError(
        'invalid-argument',
        'Bio must be at least 10 characters',
      );
    }

    try {
      await db.collection('users').doc(auth.uid).update({
        teacher_bio: bio.trim(),
        teacher_status: 'pending',
        last_applied_teacher: Math.floor(Date.now() / 1000),
      });

      return {
        success: true,
        message: 'Teacher application submitted for review',
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new HttpsError('internal', 'Upgrade failed: ' + message);
    }
  },
);
