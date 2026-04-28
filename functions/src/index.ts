// functions/src/index.ts
export const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
export const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
export const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
export { cleanUpOldClasses } from './scheduledFunctions';
export {
  scheduleLesson,
  joinGroupLesson,
  rescheduleLesson,
  cancelLesson,
  acceptLesson,
  getUsersPublicNames,
} from './lessonFunctions';
export {
  markNotificationAsRead,
  notifyTeacherApplication,
} from './notificationFunctions';
export {
  registerUser,
  registerSocialUser,
  getCurrentUser,
  updateUserNames,
  upgradeToTeacher,
  createFirestoreUser,
} from './authFunctions';
export {
  getStudentRatingAverage,
  getTeacherRatingAverage,
} from './ratingFunctions';
export { purchaseTokens } from './tokenFunctions';
