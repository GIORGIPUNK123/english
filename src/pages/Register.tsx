import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Chrome,
  Facebook,
  Twitter,
  Eye,
  EyeOff,
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase-config';
import { useFirebaseLogins } from '../hooks/useFirebaseLogins';

export const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const logins = useFirebaseLogins();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const registerUserFn = httpsCallable(functions, 'registerUser');
      const result = await registerUserFn({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      console.log('Registration successful:', result.data);
      alert('Account created! You can now login.');
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || error.code || 'Registration failed');
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
          <span>Back to home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className='flex items-center justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='w-full max-w-5xl'>
          <div className='grid items-center gap-10 lg:grid-cols-2'>
            {/* Brand Column */}
            <div className='text-center lg:text-left'>
              <div className='inline-flex items-center mb-5 space-x-2'>
                <div className='flex items-center justify-center w-11 h-11 rounded-lg bg-linear-to-br from-blue-500 to-purple-600'>
                  <span className='text-xl font-bold text-white'>BW</span>
                </div>
                <span className='text-2xl font-semibold text-foreground'>
                  British World
                </span>
              </div>
              <h1 className='mb-3 text-3xl font-bold text-foreground'>
                Create an account
              </h1>
              <p className='mb-6 text-muted-foreground'>
                Start your learning journey today with curated lessons and
                expert teachers.
              </p>
              <div className='space-y-3 text-sm text-muted-foreground'>
                <div className='flex items-start justify-center gap-3 lg:justify-start'>
                  <span className='mt-1 inline-block h-2 w-2 rounded-full bg-blue-500'></span>
                  <span>Personalized study plans for faster progress</span>
                </div>
                <div className='flex items-start justify-center gap-3 lg:justify-start'>
                  <span className='mt-1 inline-block h-2 w-2 rounded-full bg-blue-500'></span>
                  <span>Flexible scheduling that fits your routine</span>
                </div>
                <div className='flex items-start justify-center gap-3 lg:justify-start'>
                  <span className='mt-1 inline-block h-2 w-2 rounded-full bg-blue-500'></span>
                  <span>Track milestones with weekly progress insights</span>
                </div>
              </div>
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
                  <span className='text-foreground'>Continue with Google</span>
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
                    <span className='text-foreground'>Facebook</span>
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
                    <span className='text-foreground'>Twitter</span>
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
                    Or register with email
                  </span>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block mb-2 text-sm font-medium text-foreground'>
                      First Name
                    </label>
                    <input
                      type='text'
                      name='firstName'
                      placeholder='John'
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-3 transition-all border rounded-lg bg-background border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block mb-2 text-sm font-medium text-foreground'>
                      Last Name
                    </label>
                    <input
                      type='text'
                      name='lastName'
                      placeholder='Doe'
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-3 transition-all border rounded-lg bg-background border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                <div>
                  <label className='block mb-2 text-sm font-medium text-foreground'>
                    Email Address
                  </label>
                  <input
                    type='email'
                    name='email'
                    placeholder='john.doe@example.com'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 transition-all border rounded-lg bg-background border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='grid gap-4 lg:grid-cols-2'>
                  <div>
                    <label className='block mb-2 text-sm font-medium text-foreground'>
                      Password
                    </label>
                    <div className='relative'>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name='password'
                        placeholder='Create a password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className='w-full px-4 py-3 pr-12 transition-all border rounded-lg bg-background border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                  </div>

                  <div>
                    <label className='block mb-2 text-sm font-medium text-foreground'>
                      Confirm Password
                    </label>
                    <div className='relative'>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name='confirmPassword'
                        placeholder='Confirm your password'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className='w-full px-4 py-3 pr-12 transition-all border rounded-lg bg-background border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground'
                      >
                        {showConfirmPassword ? (
                          <EyeOff className='w-5 h-5' />
                        ) : (
                          <Eye className='w-5 h-5' />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full px-4 py-3 font-medium text-white transition-all duration-300 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              {/* Login Link */}
              <div className='mt-6 text-sm text-center'>
                <span className='text-muted-foreground'>
                  Already have an account?{' '}
                </span>
                <Link
                  to='/login'
                  className='font-medium text-blue-500 transition-colors hover:text-blue-600'
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
