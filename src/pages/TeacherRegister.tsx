import { FormInput } from '../atoms/FormInput';
import { Formik } from 'formik';
import { Header } from '../components/Header';
import { TeacherRegisterSchema } from '../schemas/TeacherRegisterSchema';
import homeImg from '../assets/home.svg';
import { useState } from 'react';
export const TeacherRegister = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  return (
    <>
      <div className='flex flex-col'>
        <Header
          loggedIn={false}
          main={false}
          // registerPage={true}
          backUrl='../'
        />
        <div
          className='flex justify-center w-full bg-black-pearl-950'
          style={{ minHeight: 'calc(100vh - 96px)' }}
        >
          <div className='w-full rounded-md flex flex-col h-fit items-center mx-12 my-12 bg-white lg:flex-row lg:max-w-[1000px]'>
            <div className='flex flex-col justify-center w-full h-full px-12 py-8 '>
              <div className=''>
                <Formik
                  initialValues={{
                    name: '',
                    surname: '',
                    email: '',
                    accepted: false,
                    files: [],
                  }}
                  validationSchema={TeacherRegisterSchema}
                  onSubmit={(values, { setSubmitting }) => {
                    console.log('Form submitted:', values);

                    // Example: send with FormData
                    const formData = new FormData();
                    formData.append('name', values.name);
                    formData.append('surname', values.surname);
                    formData.append('email', values.email);

                    values.files.forEach((file: File) => {
                      formData.append('files', file);
                    });

                    // send formData with fetch (example)
                    // fetch('/api/upload', { method: 'POST', body: formData });

                    setSubmitting(false);
                  }}
                >
                  {({
                    values,
                    errors,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                    isSubmitting,
                  }) => (
                    <form
                      onSubmit={handleSubmit}
                      className='flex flex-col justify-center w-full h-full px-12 py-8'
                    >
                      <h2 className='mb-4 text-3xl text-center'>
                        Become A Teacher
                      </h2>
                      <p className='mb-4'>
                        Upload your CV and we will contact you
                      </p>

                      <div className='flex justify-between gap-4'>
                        <div className='w-1/2'>
                          <FormInput
                            name='name'
                            placeholder='First Name'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.name}
                            error={errors.name}
                            // required={true}
                            // className='w-1/2 p-2 mr-5 border rounded'
                          />
                        </div>
                        <div className='w-1/2'>
                          <FormInput
                            name='surname'
                            placeholder='Surname'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.surname}
                            error={errors.surname}
                          />
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

                      <div className='mt-4'>
                        {selectedFiles.length > 0 && (
                          <div className='flex flex-wrap gap-2 mb-4'>
                            {selectedFiles.map((file, index) => (
                              <div
                                key={index}
                                className='flex items-center h-10 gap-2 px-3 bg-gray-100 rounded-md hover:bg-gray-200'
                              >
                                <span className='truncate max-w-[120px]'>
                                  {file.name}
                                </span>
                                <img
                                  className='rounded-sm cursor-pointer h-7 hover:bg-gray-300'
                                  src={homeImg}
                                  alt='Remove'
                                  onClick={() => {
                                    const newFiles = selectedFiles.filter(
                                      (_, i) => i !== index
                                    );
                                    setSelectedFiles(newFiles);
                                    setFieldValue('files', newFiles);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Dropzone */}
                        <div className='flex items-center justify-center w-full border border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100'>
                          <label className='flex flex-col items-center justify-center w-full h-64 text-sm text-gray-900 cursor-pointer'>
                            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                              <svg
                                className='w-8 h-8 mb-4 text-gray-500'
                                aria-hidden='true'
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 20 16'
                              >
                                <path
                                  stroke='currentColor'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='2'
                                  d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 
                         5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 
                         0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                                />
                              </svg>
                              <p className='mb-2 text-sm text-gray-500'>
                                <span className='font-semibold'>
                                  Click to upload
                                </span>
                                or drag and drop
                              </p>
                              <p className='text-xs text-gray-500'>
                                PDF, DOCX, PNG, JPEG
                              </p>
                            </div>
                            <input
                              id='dropzone-file'
                              type='file'
                              multiple
                              accept='.pdf,.docx,.png,.jpg,.jpeg'
                              className='hidden'
                              onChange={(event) => {
                                const files = Array.from(
                                  event.currentTarget.files || []
                                );
                                const valid = files.filter((file) => {
                                  const allowedTypes = [
                                    'application/pdf',
                                    'image/jpeg',
                                    'image/png',
                                  ];
                                  return (
                                    allowedTypes.includes(file.type) &&
                                    file.size < 10 * 1024 * 1024
                                  );
                                });
                                if (valid.length < files.length) {
                                  alert(
                                    'Some files were rejected invalid type or size'
                                  );
                                } else {
                                  const allFiles = [...selectedFiles, ...files];
                                  setSelectedFiles(allFiles);
                                  setFieldValue('files', allFiles);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      {errors.files && (
                        <div className='mt-1 text-sm text-red-500'>
                          {errors.files as string}
                        </div>
                      )}
                      {/* --- Terms --- */}
                      <div className='mt-3'>
                        <input
                          type='checkbox'
                          name='accepted'
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.accepted}
                          className='mr-2'
                        />
                        <span>
                          I accept the{' '}
                          <a href='#' className='font-semibold text-purple-500'>
                            Terms of Use
                          </a>{' '}
                          and{' '}
                          <a href='#' className='font-semibold text-purple-500'>
                            Privacy Policy
                          </a>
                        </span>
                      </div>

                      {/* --- Submit --- */}
                      <button
                        type='submit'
                        disabled={isSubmitting}
                        className='w-full py-3 mt-5 text-center text-white bg-purple-500 rounded'
                      >
                        Register Now
                      </button>
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
