import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  User,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '../firebase/firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const useFirebaseLogins = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save user data if new
  const saveUserIfNew = async (user: User) => {
    const docRef = doc(db, 'userData', user.uid);
    const docSnap = await getDoc(docRef);

    const displayName = user.displayName || '';
    const [firstName = '', lastName = ''] = displayName.split(' ');

    if (!docSnap.exists()) {
      await setDoc(
        docRef,
        {
          first_name: firstName.toLowerCase(),
          last_name: lastName.toLowerCase(),
          role: 'student',
          classes: [],
          credits: 0,
        },
        { merge: true }
      );
    }
  };

  // Register new user with email/password
  const registerWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserIfNew(res.user);
      setLoading(false);
      navigate('/'); // or wherever you want after signup
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed');
    }
  };

  // Generic social login
  const loginWithProvider = async (provider: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await saveUserIfNew(user);
      setLoading(false);
      navigate('/');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Login failed');
    }
  };

  const loginWithGoogle = () => loginWithProvider(new GoogleAuthProvider());
  const loginWithFacebook = () => loginWithProvider(new FacebookAuthProvider());
  const loginWithTwitter = () => loginWithProvider(new TwitterAuthProvider());

  return {
    registerWithEmail,
    loginWithGoogle,
    loginWithFacebook,
    loginWithTwitter,
    loading,
    error,
  };
};
