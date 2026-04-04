import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../firebase/firebase-config';
import { UserDataT } from '../../../types';
import {
  Globe,
  Mail,
  Moon,
  Sun,
  User as UserImg,
  LogOut,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useUserMode } from '../../../context/UserModeContext';
import { useNavigate } from 'react-router-dom';
import { BecomeTeacherModal } from '../shared/BecomeTeacherModal';

export const SettingsView = (props: {
  userData: UserDataT | null;
  email: string;
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [becomeTeacherIsOn, setBecomeTeacherIsOn] = useState(false);
  const { userMode, setUserMode, canSwitchToTeacher } = useUserMode();
  const navigate = useNavigate();
  const [advertisementEmails, setAdvertisementEmails] = useState(false);
  const { email, userData } = props;

  const capitalNames = userData
    ? [
        userData.first_name.charAt(0).toUpperCase() +
          userData.first_name.slice(1),
        userData.last_name.charAt(0).toUpperCase() +
          userData.last_name.slice(1),
      ]
    : ['', ''];

  const sections = [
    {
      title: 'Profile Settings',
      icon: UserImg,
      items: [
        { label: 'Full Name', value: capitalNames[0] + ' ' + capitalNames[1] },
        {
          label: 'Email',
          value: email,
        },
        { label: 'Phone', value: '' },
      ],
    },
    {
      title: 'Preferences',
      icon: Globe,
      items: [
        { label: 'Language', value: 'English' },
        { label: 'Time Zone', value: 'EST (UTC-5)' },
      ],
    },
  ];
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      // Handle auth state change
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleApplyTeacher = () => {
    if (!userData?.teacher_status) {
      setBecomeTeacherIsOn(true);
    }
  };

  return (
    <div className='h-full overflow-y-auto'>
      <BecomeTeacherModal
        isOpen={becomeTeacherIsOn}
        onClose={() => setBecomeTeacherIsOn(false)}
      />
      <div className='mb-6'>
        <h1 className='mb-2 text-xl text-gray-900 dark:text-white sm:text-2xl lg:text-3xl'>
          Settings
        </h1>
        <p className='text-sm text-gray-600 dark:text-gray-400 sm:text-base'>
          Manage your account preferences and settings
        </p>
      </div>

      <div className='space-y-6'>
        {/* Email & Notifications Always Enabled Notice */}
        <div className='p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-600/10 dark:border-blue-500/30'>
          <div className='flex items-start gap-3'>
            <Mail className='w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5' />
            <div>
              <h3 className='mb-1 text-sm font-medium text-blue-700 dark:text-blue-300 sm:text-base'>
                Email & Push Notifications
              </h3>
              <p className='text-xs text-blue-600/80 dark:text-blue-200/70 sm:text-sm'>
                Email notifications and push notifications are always enabled to
                ensure you never miss important updates about your lessons,
                assignments, and platform announcements.
              </p>
            </div>
          </div>
        </div>

        {/* Theme Toggle Card */}
        <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg sm:w-10 sm:h-10 dark:bg-gray-700'>
              {isDarkMode ? (
                <Moon className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
              ) : (
                <Sun className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
              )}
            </div>
            <h2 className='text-base text-gray-900 dark:text-white sm:text-lg lg:text-xl'>
              Theme
            </h2>
          </div>

          <div className='flex items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60'>
            <div className='flex items-center gap-2'>
              {isDarkMode ? (
                <Moon className='w-4 h-4 text-gray-600 dark:text-gray-400' />
              ) : (
                <Sun className='w-4 h-4 text-gray-600 dark:text-gray-400' />
              )}
              <p className='text-xs text-gray-700 sm:text-sm dark:text-gray-300'>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full relative transition-all shrink-0 ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  isDarkMode ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* User Mode Toggle Card */}
        {canSwitchToTeacher && (
          <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg sm:w-10 sm:h-10 dark:bg-gray-700'>
                {userMode === 'teacher' ? (
                  <GraduationCap className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
                ) : (
                  <BookOpen className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
                )}
              </div>
              <h2 className='text-base text-gray-900 dark:text-white sm:text-lg lg:text-xl'>
                User Mode
              </h2>
            </div>

            <div className='space-y-3'>
              <div className='p-3 rounded-lg bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/30'>
                <p className='text-xs text-blue-600 dark:text-blue-300 sm:text-sm'>
                  You have access to both Student and Teacher modes. Switch
                  between them to access different features.
                </p>
              </div>

              <div className='flex items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60'>
                <div className='flex items-center gap-2'>
                  {userMode === 'teacher' ? (
                    <GraduationCap className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                  ) : (
                    <BookOpen className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                  )}
                  <p className='text-xs text-gray-700 sm:text-sm dark:text-gray-300'>
                    {userMode === 'teacher' ? 'Teacher Mode' : 'Student Mode'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setUserMode(userMode === 'teacher' ? 'student' : 'teacher')
                  }
                  className={`w-12 h-6 rounded-full relative transition-all shrink-0 ${
                    userMode === 'teacher'
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      userMode === 'teacher' ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Preferences */}
        <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg sm:w-10 sm:h-10 dark:bg-gray-700'>
              <Mail className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
            </div>
            <h2 className='text-base text-gray-900 dark:text-white sm:text-lg lg:text-xl'>
              Notification Preferences
            </h2>
          </div>

          <div className='flex items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60'>
            <p className='text-xs text-gray-700 sm:text-sm dark:text-gray-300'>
              Advertisement & Sales Emails
            </p>
            <button
              onClick={() => setAdvertisementEmails(!advertisementEmails)}
              className={`w-12 h-6 rounded-full relative transition-all shrink-0 ${
                advertisementEmails
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  advertisementEmails ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Apply to be a Teacher */}
        <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg sm:w-10 sm:h-10 dark:bg-gray-700'>
              <GraduationCap className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
            </div>
            <h2 className='text-base text-gray-900 dark:text-white sm:text-lg lg:text-xl'>
              Become a Teacher
            </h2>
          </div>

          <div className='space-y-3'>
            <p className='text-xs text-gray-700 sm:text-sm dark:text-gray-300'>
              Ready to share your teaching experience? Apply to become a teacher
              on our platform and start earning money by teaching students
              worldwide.
            </p>
            {userData?.teacher_status && (
              <div className='p-3 text-xs text-blue-700 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-600/10 dark:border-blue-500/30 dark:text-blue-300 sm:text-sm'>
                {userData.teacher_status === 'pending' &&
                  'Your application is currently under review.'}
                {userData.teacher_status === 'approved' &&
                  'You are already approved as a teacher.'}
                {userData.teacher_status === 'rejected' &&
                  'Your application was not approved. Contact support to reapply.'}
              </div>
            )}
            <button
              onClick={handleApplyTeacher}
              disabled={Boolean(userData?.teacher_status)}
              className={`w-full px-4 py-3 text-sm transition-all rounded-lg sm:px-6 sm:text-base ${
                userData?.teacher_status
                  ? 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                  : 'text-white bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Apply to be a Teacher
            </button>
          </div>
        </div>

        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-6'
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg sm:w-10 sm:h-10 dark:bg-gray-700'>
                  <Icon className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
                </div>
                <h2 className='text-base text-gray-900 dark:text-white sm:text-lg lg:text-xl'>
                  {section.title}
                </h2>
              </div>

              <div className='space-y-3'>
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className='flex items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60'
                  >
                    <p className='text-xs text-gray-700 sm:text-sm dark:text-gray-300'>
                      {item.label}
                    </p>
                    <p className='text-xs text-right text-gray-600 sm:text-sm dark:text-gray-400'>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Action Buttons */}
        <div className='flex flex-col gap-3 sm:flex-row'>
          <button
            onClick={handleLogout}
            className='flex items-center justify-center gap-2 px-4 py-3 text-sm text-white transition-all bg-red-600 rounded-lg sm:px-6 hover:bg-red-700 sm:text-base'
          >
            <LogOut className='w-4 h-4' />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
