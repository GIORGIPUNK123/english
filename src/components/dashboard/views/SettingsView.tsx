import { useState } from 'react';
import { UserDataT } from '../../../types';
import { Globe, Mail, Moon, Sun, User as UserImg } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface SettingsViewProps {
  userData: UserDataT | null;
  capitalNames: string[];
  email: string;
  userType?: 'student' | 'teacher'; // For future teacher dashboard support
}

export const SettingsView = ({
  userData,
  capitalNames,
  email,
  userType = 'student',
}: SettingsViewProps) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [advertisementEmails, setAdvertisementEmails] = useState(false);

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

  const handleChangePassword = () => {
    alert('Change password feature coming soon!');
  };

  return (
    <div className='h-full overflow-y-auto'>
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
            <Mail className='w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5' />
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
              className={`w-12 h-6 rounded-full relative transition-all flex-shrink-0 ${
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
              className={`w-12 h-6 rounded-full relative transition-all flex-shrink-0 ${
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
          <button className='px-4 py-3 text-sm text-white transition-all bg-blue-600 rounded-lg sm:px-6 hover:bg-blue-700 sm:text-base'>
            Save Changes
          </button>
          <button className='px-4 py-3 text-sm text-gray-700 transition-all bg-gray-200 rounded-lg sm:px-6 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 sm:text-base'>
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};
