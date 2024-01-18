import { FormInput } from '../atoms/FormInput';
import { Formik } from 'formik';
import {
  loginWithFacebook,
  loginWithGoogle,
  loginWithTwitter,
} from '../firebase/firebaseLogins';
import google_logo from '../assets/google_logo.svg';
import facebook_logo from '../assets/facebook_logo.svg';
import twitter_logo from '../assets/twitter_logo.svg';
import booksImg from '../assets/books.svg';
import { Header } from '../components/Header';
import { RegisterSchema } from '../schemas/registerSchema';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebase-config';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
export const Register = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className='flex flex-col'>
        <Header loggedIn={false} main={false} backUrl='../' />
        <div
          className='bg-black-pearl-950'
          style={{ minHeight: 'calc(100vh - 96px)' }}
        >
          <div className=' rounded-md flex flex-col h-[640px] items-center mx-12 my-12 bg-white lg:flex-row'>
            <div className='hidden relative flex-col justify-center items-center w-full h-full bg-center bg-no-repeat bg-cover lg:flex lg:w-1/2'>
              <div
                className=' size-full absolute bg-center bg-[length:70%_70%] bg-no-repeat'
                style={{ backgroundImage: `url(${booksImg})` }}
              />
            </div>
            <div className='flex flex-col justify-center px-12 py-8 w-full h-full lg:w-1/2'>
              <div className=''>
                <h2 className='mb-4 text-3xl'>Register</h2>
                <p className='mb-4'>
                  Create your account. It’s free and only take a minute
                </p>
                <Formik
                  initialValues={{
                    name: '',
                    surname: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    accepted: false,
                  }}
                  validationSchema={RegisterSchema}
                  onSubmit={(values, { setSubmitting }) => {
                    // alert(JSON.stringify(values, null, 2));
                    console.log('email: ', values.email);
                    createUserWithEmailAndPassword(
                      auth,
                      values.email,
                      values.password
                    )
                      .then(async (res) => {
                        const docRef = doc(db, 'userData', res.user.uid);
                        await setDoc(
                          docRef,
                          {
                            first_name: values.name.toLowerCase(),
                            last_name: values.surname.toLowerCase(),
                          },
                          { merge: true }
                        );
                        console.log('res user: ', res.user);
                        console.log('docRef: ', docRef);
                        setSubmitting(false);
                        navigate('/');
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
                    <form onSubmit={handleSubmit}>
                      <div className='flex flex-col'>
                        <div className='flex justify-between'>
                          <div className='mr-5 w-1/2'>
                            <FormInput
                              name='name'
                              placeholder='First Name'
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.name}
                              error={errors.name}
                            />
                          </div>
                          <div className='ml-5 w-1/2'>
                            <FormInput
                              name='surname'
                              placeholder='Surname'
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.surname}
                              error={errors.surname}
                            />{' '}
                          </div>
                        </div>
                        <div className='mt-2'>
                          <FormInput
                            name='email'
                            placeholder='Email'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.email}
                            error={errors.email}
                          />
                        </div>
                        <div className='mt-2'>
                          <FormInput
                            name='password'
                            placeholder='Password'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.password}
                            error={errors.password}
                          />
                        </div>
                        <div className='mt-2'>
                          <FormInput
                            name='confirmPassword'
                            placeholder='Confirm Password'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.confirmPassword}
                            error={errors.confirmPassword}
                          />
                        </div>
                        <div className='mt-2'>
                          <input
                            type='checkbox'
                            name='accepted'
                            className='border border-gray-400'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            checked={values.accepted}
                          />
                          <span>
                            {' '}
                            I accept the{' '}
                            <a
                              href='#'
                              className='font-semibold text-purple-500'
                            >
                              Terms of Use{' '}
                            </a>
                            &{' '}
                            <a
                              href='#'
                              className='font-semibold text-purple-500'
                            >
                              Privacy Policy
                            </a>
                          </span>
                        </div>
                        <div className='mt-2'>
                          <div className='flex justify-evenly mb-5'>
                            <button
                              onClick={loginWithFacebook}
                              className='flex items-center px-6 py-2 h-12 text-sm font-medium text-gray-800 bg-white rounded-lg border border-gray-300 shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                            >
                              <img
                                src={facebook_logo}
                                width='28px'
                                alt='Facebook Logo'
                              />
                            </button>
                            <button
                              onClick={loginWithGoogle}
                              className='flex items-center px-6 py-2 h-12 text-sm font-medium text-gray-800 bg-white rounded-lg border border-gray-300 shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                            >
                              <img
                                src={google_logo}
                                width='28px'
                                alt='Google Logo'
                              />
                            </button>
                            <button
                              onClick={loginWithTwitter}
                              className='flex items-center px-6 py-2 h-12 text-sm font-medium text-gray-800 bg-white rounded-lg border border-gray-300 shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                            >
                              <img
                                src={twitter_logo}
                                width='28px'
                                alt='twitter Logo'
                              />
                            </button>
                          </div>
                          <button
                            type='submit'
                            className={`w-full text-center text-white bg-purple-500 py-3 ${
                              isSubmitting ? 'disabled' : ''
                            }`}
                          >
                            Register Now
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
