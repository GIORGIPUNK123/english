import '../css/reset.css';
import '../css/index.css';
import { Landing } from './Landing';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Login } from './Login';
import { Register } from './Register';
import { Profile } from './Profile';
import { StudentDashboard } from './StudentDashboard';
export const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/dashboard' element={<StudentDashboard />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};
