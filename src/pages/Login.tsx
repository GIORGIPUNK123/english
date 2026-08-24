import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Chrome,
  Facebook,
  Twitter,
  Eye,
  EyeOff,
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { LoginSchema } from '../schemas/LoginSchema';
import { ValidationError } from 'yup';
import { useFirebaseLogins } from '../hooks/useFirebaseLogins';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../firebase/firebase-config';

type FormData = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

// import { fakeAuth } from '../utils/fakeAuth';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const logins = useFirebaseLogins();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        navigate('/dashboard', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts editing
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      await LoginSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ValidationError) {
        const newErrors: FormErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            newErrors[error.path as keyof FormData] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await logins.loginWithEmail(formData.email, formData.password);
      // await fakeAuth.login(formData.email, formData.password);
      // navigate('/dashboard');
    } catch (error: any) {
      alert(error.message || t('auth.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col min-h-screen bg-background'>
      {/* Header */}
      <div className='p-4 sm:p-6'>
        <Link
          to='/'
          className='inline-flex items-center space-x-2 transition-colors text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='w-5 h-5' />
          <span>{t('auth.backToHome')}</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className='flex items-center justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='w-full max-w-md'>
          {/* Logo */}
          <div className='mb-8 text-center'>
            <div className='inline-flex items-center mb-4 space-x-2'>
              <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-purple-600'>
                <span className='text-xl font-bold text-white'>BW</span>
              </div>
              <span className='text-2xl font-semibold text-foreground'>
                British World
              </span>
            </div>
            <h1 className='mb-2 text-3xl font-bold text-foreground'>
              {t('auth.loginWelcome')}
            </h1>
            <p className='text-muted-foreground'>
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Card */}
          <div className='p-8 border shadow-lg bg-card border-border rounded-2xl'>
            {/* Social Login Buttons */}
            <div className='mb-6 space-y-3'>
              <button
                onClick={() => {
                  logins.loginWithGoogle().catch((error: any) => {
                    alert(error.message || 'Login failed');
                  });
                }}
                className='flex items-center justify-center w-full px-4 py-3 space-x-3 transition-all duration-300 border rounded-lg bg-background border-border hover:bg-accent'
              >
                <Chrome className='w-5 h-5' />
                <span className='text-foreground'>{t('auth.continueWithGoogle')}</span>
              </button>

              <div className='grid grid-cols-2 gap-3'>
                <button
                  onClick={() => {
                    logins.loginWithFacebook().catch((error: any) => {
                      alert(error.message || 'Login failed');
                    });
                  }}
                  className='flex items-center justify-center px-4 py-3 space-x-2 transition-all duration-300 border rounded-lg bg-background border-border hover:bg-accent'
                >
                  <Facebook className='w-5 h-5' />
                  <span className='text-foreground'>{t('auth.facebook')}</span>
                </button>

                <button
                  onClick={() => {
                    logins.loginWithTwitter().catch((error: any) => {
                      alert(error.message || 'Login failed');
                    });
                  }}
                  className='flex items-center justify-center px-4 py-3 space-x-2 transition-all duration-300 border rounded-lg bg-background border-border hover:bg-accent'
                >
                  <Twitter className='w-5 h-5' />
                  <span className='text-foreground'>{t('auth.twitter')}</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className='relative my-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-border'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-4 bg-card text-muted-foreground'>
                  {t('auth.loginEmailDivider')}
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  {t('auth.emailAddress')}
                </label>
                <input
                  type='email'
                  name='email'
                  placeholder={t('auth.emailAddress')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 transition-all border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                />
                {errors.email && (
                  <p className='mt-1 text-sm text-red-500'>{errors.email}</p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  {t('auth.password')}
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    placeholder={t('auth.password')}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 pr-12 transition-all border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                      errors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-border focus:ring-blue-500'
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground'
                  >
                    {showPassword ? (
                      <EyeOff className='w-5 h-5' />
                    ) : (
                      <Eye className='w-5 h-5' />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className='mt-1 text-sm text-red-500'>{errors.password}</p>
                )}
              </div>

              <div className='flex items-center justify-between text-sm'>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input type='checkbox' className='rounded border-border' />
                  <span className='text-muted-foreground'>{t('auth.rememberMe')}</span>
                </label>
                <Link
                  to='#'
                  className='text-blue-500 transition-colors hover:text-blue-600'
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full px-4 py-3 font-medium text-white transition-all duration-300 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? t('auth.signingIn') : t('auth.signInButton')}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className='mt-6 text-sm text-center'>
              <span className='text-muted-foreground'>
                {t('auth.doNotHaveAccount')} {' '}
              </span>
              <Link
                to='/register'
                className='font-medium text-blue-500 transition-colors hover:text-blue-600'
              >
                {t('auth.signUp')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
