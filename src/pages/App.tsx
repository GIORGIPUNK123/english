import '../css/reset.css';
import '../css/index.css';
import { Landing } from './Landing';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Login } from './Login';
import { Register } from './Register';
import { Profile } from './Profile';
import { TeacherDashboard } from './TeacherDashboard';
export const App = () => {
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
