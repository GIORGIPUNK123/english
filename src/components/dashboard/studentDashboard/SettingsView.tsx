import { useEffect, useState } from 'react';
import { UserDataT } from '../../../types';
import {
  Globe,
  Mail,
  Moon,
  Sun,
  User as UserImg,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { Language, useLanguage } from '../../../context/LanguageContext';
import { useUserMode } from '../../../context/UserModeContext';
import { BecomeTeacherModal } from '../shared/BecomeTeacherModal';

export const SettingsView = (props: {
  userData: UserDataT | null;
  email: string;
  openTeacherApply?: boolean;
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [becomeTeacherIsOn, setBecomeTeacherIsOn] = useState(false);
  const { userMode, setUserMode, canSwitchToTeacher } = useUserMode();
  const [advertisementEmails, setAdvertisementEmails] = useState(false);
  const { email, userData, openTeacherApply = false } = props;

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
      title: t('settings.profileSettings'),
      icon: UserImg,
      items: [
        {
          label: t('settings.fullName'),
          value: capitalNames[0] + ' ' + capitalNames[1],
        },
        {
          label: t('settings.email'),
          value: email,
        },
        { label: t('settings.phone'), value: '' },
      ],
    },
  ];

  useEffect(() => {
    if (openTeacherApply && !userData?.teacher_status) {
      setBecomeTeacherIsOn(true);
    }
  }, [openTeacherApply, userData?.teacher_status]);

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
      <div className='mb-4'>
        <h1 className='mb-1 text-xl text-gray-900 dark:text-white sm:text-2xl lg:text-3xl'>
          {t('settings.title')}
        </h1>
        <p className='text-sm text-gray-600 dark:text-gray-400 sm:text-base'>
          {t('settings.subtitle')}
        </p>
      </div>

      <div className='space-y-4'>
        {/* Email & Notifications Always Enabled Notice */}
        <div className='p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-600/10 dark:border-blue-500/30'>
          <div className='flex items-start gap-3'>
            <Mail className='w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5' />
            <div>
              <h3 className='mb-1 text-sm font-medium text-blue-700 dark:text-blue-300 sm:text-base'>
                {t('settings.emailPushTitle')}
              </h3>
              <p className='text-xs text-blue-600/80 dark:text-blue-200/70 sm:text-sm'>
                {t('settings.emailPushBody')}
              </p>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-5'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg sm:w-10 sm:h-10 dark:bg-gray-700'>
              <Globe className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
            </div>
            <h2 className='text-base text-gray-900 dark:text-white sm:text-lg lg:text-xl'>
              {t('settings.language')}
            </h2>
          </div>

          <div className='flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60'>
            <p className='text-xs text-gray-700 sm:text-sm dark:text-gray-300'>
              {language === 'ka'
                ? t('settings.georgian')
                : t('settings.english')}
            </p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className='px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:border-blue-600 focus:outline-none'
            >
              <option value='en'>{t('settings.english')}</option>
              <option value='ka'>{t('settings.georgian')}</option>
            </select>
          </div>
        </div>

        {/* Theme Toggle Card */}
        <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-5'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg sm:w-10 sm:h-10 dark:bg-gray-700'>
              {isDarkMode ? (
                <Moon className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
              ) : (
                <Sun className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
              )}
            </div>
            <h2 className='text-base text-gray-900 dark:text-white sm:text-lg lg:text-xl'>
              {t('settings.theme')}
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
                {isDarkMode ? t('settings.darkMode') : t('settings.lightMode')}
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
          <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-5'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg sm:w-10 sm:h-10 dark:bg-gray-700'>
                {userMode === 'teacher' ? (
                  <GraduationCap className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
                ) : (
                  <BookOpen className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
                )}
              </div>
              <h2 className='text-base text-gray-900 dark:text-white sm:text-lg lg:text-xl'>
                {t('settings.userMode')}
              </h2>
            </div>

            <div className='space-y-3'>
              <div className='p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-600/10 dark:border-blue-500/30'>
                <p className='text-xs text-blue-600 dark:text-blue-300 sm:text-sm'>
                  {t('settings.accessText')}
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
                    {userMode === 'teacher'
                      ? t('settings.currentModeTeacher')
                      : t('settings.currentModeStudent')}
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
        <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-5'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg sm:w-10 sm:h-10 dark:bg-gray-700'>
              <Mail className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
            </div>
            <h2 className='text-base text-gray-900 dark:text-white sm:text-lg lg:text-xl'>
              {t('settings.notificationPreferences')}
            </h2>
          </div>

          <div className='flex items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60'>
            <p className='text-xs text-gray-700 sm:text-sm dark:text-gray-300'>
              {t('settings.adsEmails')}
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
        <div className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-5'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg sm:w-10 sm:h-10 dark:bg-gray-700'>
              <GraduationCap className='w-4 h-4 text-gray-700 sm:w-5 sm:h-5 dark:text-gray-300' />
            </div>
            <h2 className='text-base text-gray-900 dark:text-white sm:text-lg lg:text-xl'>
              {t('settings.becomeTeacher')}
            </h2>
          </div>

          <div className='space-y-3'>
            <p className='text-xs text-gray-700 sm:text-sm dark:text-gray-300'>
              {t('settings.becomeTeacherBody')}
            </p>
            {userData?.teacher_status && (
              <div className='p-3 text-xs text-blue-700 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-600/10 dark:border-blue-500/30 dark:text-blue-300 sm:text-sm'>
                {userData.teacher_status === 'pending' &&
                  t('settings.applicationPending')}
                {userData.teacher_status === 'approved' &&
                  t('settings.applicationApproved')}
                {userData.teacher_status === 'rejected' &&
                  t('settings.applicationRejected')}
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
              {t('settings.applyButton')}
            </button>
          </div>
        </div>

        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className='p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800/40 dark:border-gray-700 sm:p-5'
            >
              <div className='flex items-center gap-3 mb-3'>
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
      </div>
    </div>
  );
};
