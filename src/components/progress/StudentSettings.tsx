import { useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase-config';
import profileImg from '../../assets/profile.svg';
import { userDataT } from '../../types';

export const StudentSettings = (props: {
  userData: userDataT | null;
  capitalNames: string[];
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    // Optionally redirect to login page here
  };

  const handleChangePassword = () => {
    // Implement password change logic or redirect to password change page
    alert('Change password feature coming soon!');
  };

  return (
    <div className='flex justify-center w-full py-16 bg-gray-100'>
      <div className='flex flex-col items-center w-full max-w-2xl p-12 bg-white shadow-2xl rounded-2xl'>
        <img
          src={user?.photoURL || profileImg}
          alt='Profile'
          className='mb-6 rounded-full shadow w-28 h-28'
        />
        <h2 className='mb-2 text-3xl font-bold'>
          {props.capitalNames[0]} {props.capitalNames[1]}
        </h2>
        <p className='mb-6 text-lg text-gray-700'>
          {user?.email || 'No email available'}
        </p>
        <h1 className='mb-8 text-4xl font-bold'>Student Settings</h1>
        <button
          onClick={handleChangePassword}
          className='px-8 py-3 mb-4 text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700'
        >
          Change Password
        </button>
        <button
          onClick={handleLogout}
          className='px-8 py-3 mb-4 text-white transition rounded-lg shadow bg-torch-red-500 hover:bg-torch-red-700'
        >
          Logout
        </button>
        <p className='mb-4 text-lg text-gray-700'>More settings coming soon.</p>
        <p className='text-sm text-gray-500'>
          Please check back later for updates.
        </p>
      </div>
    </div>
  );
};
