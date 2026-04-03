// import '../css/reset.css';
// import '../css/theme.css';
import '../css/index.css';
import { Landing } from './Landing';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Login } from './Login';
import { Register } from './Register';
import { Profile } from './Profile';
import { Dashboard } from './Dashboard';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import { UserModeProvider } from '../context/UserModeContext';
// import { BecomeTeacher } from './BecomeTeacher.old';
export const App = () => {
  return (
    <>
      <BrowserRouter>
        <ThemeProvider>
          <UserModeProvider>
            <ToastProvider>
              <Routes>
                <Route path='/' element={<Landing />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                {/* <Route path='/become-teacher' element={<BecomeTeacher />} /> */}
                <Route path='/profile' element={<Profile />} />
              </Routes>
            </ToastProvider>
          </UserModeProvider>
        </ThemeProvider>
      </BrowserRouter>
    </>
  );
};
