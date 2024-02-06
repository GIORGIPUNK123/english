import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};
const loginWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  return await signInWithPopup(auth, provider);
};
const loginWithTwitter = async () => {
  const provider = new TwitterAuthProvider();
  return await signInWithPopup(auth, provider);
};
export const useFirebaseLogins = () => {
  return { loginWithGoogle, loginWithFacebook, loginWithTwitter };
};
