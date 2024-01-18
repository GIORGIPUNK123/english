import {
  loginWithFacebook,
  loginWithGoogle,
  loginWithTwitter,
} from '../firebase/firebaseLogins';
import google_logo from '../assets/google_logo.svg';
import facebook_logo from '../assets/facebook_logo.svg';
import twitter_logo from '../assets/twitter_logo.svg';
import { Header } from '../components/Header';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { FormInput } from '../atoms/FormInput';
export const Login = () => {
  const navigate = useNavigate();
  return (
    <div className='flex flex-col'>
      <Header loggedIn={false} main={false} backUrl='../' />
      <div
        className='flex flex-col justify-center items-center py-6 h-full bg-black-pearl-950 sm:py-12'
        style={{ minHeight: 'calc(100vh - 96px)' }}
      >
        <div className='relative py-3 w-full sm:max-w-4xl'>
          <div className='absolute inset-0 bg-gradient-to-r shadow-lg transform -skew-y-6 sm:w-full from-black-pearl-700 to-black-pearl-900 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl' />
          <div className='relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20'>
            <div className='mx-auto max-w-md'>
              <div>
                <h1 className='text-2xl font-semibold'>Login</h1>
              </div>
              <div className='divide-y divide-gray-200'>
                <div className='py-8 space-y-4 text-base leading-6 text-gray-700 sm:text-lg sm:leading-7'>
                  <Formik
                    initialValues={{
                      email: '',
                      password: '',
                    }}
                    // validationSchema={RegisterSchema}
                    onSubmit={(values, { setSubmitting }) => {
                      console.log('email: ', values.email);
                      signInWithEmailAndPassword(
                        auth,
                        values.email,
                        values.password
                      )
                        .then(async (res) => {
                          setSubmitting(false);
                          // Navigate only if the authentication is successful
                          if (res) {
                            navigate('/');
                          }
                        })
                        .catch((err) => {
                          alert(JSON.stringify(err.message, null, 2));
                          setSubmitting(false);
                        });
                    }}
                  >
                    {({
                      values,
                      errors,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      isSubmitting,
                    }) => (
                      <Form>
                        <FormInput
                          name='email'
                          placeholder='Email Address'
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.email}
                          error={errors.email}
                        />
                        <FormInput
                          name='password'
                          placeholder='Password'
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.password}
                          error={errors.password}
                        />

                        <div className='relative'>
                          <button
                            type='submit'
                            className='py-3 w-full text-center text-white bg-cyan-500 rounded-sm'
                            disabled={isSubmitting}
                          >
                            Log Now
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>

            <div className='flex justify-center w-full'>
              <div className='flex justify-evenly mb-5 w-full lg:w-4/6'>
                <button
                  onClick={loginWithFacebook}
                  className='flex items-center px-6 py-2 h-12 text-sm font-medium text-gray-800 bg-white rounded-lg border border-gray-300 shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                >
                  <img src={facebook_logo} width='28px' alt='Facebook Logo' />
                </button>
                <button
                  onClick={loginWithGoogle}
                  className='flex items-center px-6 py-2 h-12 text-sm font-medium text-gray-800 bg-white rounded-lg border border-gray-300 shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                >
                  <img src={google_logo} width='28px' alt='Google Logo' />
                </button>
                <button
                  onClick={loginWithTwitter}
                  className='flex items-center px-6 py-2 h-12 text-sm font-medium text-gray-800 bg-white rounded-lg border border-gray-300 shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                >
                  <img src={twitter_logo} width='28px' alt='twitter Logo' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
