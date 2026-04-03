import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const useFirebaseLogins = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register new user with email/password
  const registerWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login with email/password
  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generic social login
  const loginWithProvider = async (provider: any) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => loginWithProvider(new GoogleAuthProvider());
  const loginWithFacebook = () => loginWithProvider(new FacebookAuthProvider());
  const loginWithTwitter = () => loginWithProvider(new TwitterAuthProvider());

  return {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginWithFacebook,
    loginWithTwitter,
    loading,
    error,
  };
};
