import '../css/reset.css';
import '../css/index.css';
import { Landing } from './Landing';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Login } from './Login';
import { Register } from './Register';
import { Profile } from './Profile';
import { auth } from '../firebase/firebase-config';
import { TeacherDashboard } from './TeacherDashboard';
import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
export const App = () => {
  const [user, setUser] = useState<any | User>(null);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  console.log(user);
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/dashboard' element={<TeacherDashboard />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};
