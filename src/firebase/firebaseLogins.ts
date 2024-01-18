import { auth } from './firebase-config';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  TwitterAuthProvider,
} from 'firebase/auth';
export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {})
    .catch((error) => {});
};
export const loginWithFacebook = () => {
  const provider = new FacebookAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {})
    .catch((error) => {});
};
export const loginWithTwitter = () => {
  const provider = new TwitterAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {})
    .catch((error) => {});
};
