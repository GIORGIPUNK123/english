// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAPskVYaIAXPTFiu7gANtPpu7exBMrdYPw',
  authDomain: 'english-learning-396508.firebaseapp.com',
  projectId: 'english-learning-396508',
  storageBucket: 'english-learning-396508.appspot.com',
  messagingSenderId: '639290805058',
  appId: '1:639290805058:web:7e5e5291afc948ada316db',
  measurementId: 'G-FSHDLEC620',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
// const analytics = getAnalytics(app);
