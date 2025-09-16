import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase/firebase-config';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

export const Profile = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [name, setName] = useState('');
  const [surnname, setSurnname] = useState('');
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email!);
        setUid(user.uid!);
        const userDocRef = doc(db, 'userData', user.uid);

        getDoc(userDocRef)
          .then((docSnapshot) => {
            if (docSnapshot.exists()) {
              setName(docSnapshot.data().first_name);
              setSurnname(docSnapshot.data().last_name);
            } else {
              console.log('User document does not exist');
            }
          })
          .catch((error) => {
            console.error('Error getting user document:', error);
          });
      }
    });
  }, []);

  return (
    <div className='bg-black-pearl-950'>
      <h1 className='text-4xl text-torch-red-600'>Name: {name}</h1>
      <h1 className='text-4xl text-torch-red-600'>surName: {surnname}</h1>
      <h1 className='text-4xl text-torch-red-600'>Email: {email}</h1>
      <h1 className='text-4xl text-torch-red-600'>Uid: {uid}</h1>
      <button
        className='px-2 py-1 text-white rounded-md bg-cyan-500'
        onClick={() => {
          signOut(auth).then(() => {
            navigate('/');
          });
        }}
      >
        Log Out
      </button>
    </div>
  );
};
