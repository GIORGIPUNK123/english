import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  GraduationCap,
  Globe,
  Clock,
  DollarSign,
  CheckCircle,
  Video,
} from 'lucide-react';
import { BecomeTeacherSchema } from '../schemas/BecomeTeacherSchema';
import { registerTeacherUser } from '../firebase/firebaseUserUtils';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
  phone: string;
  country: string;
  education: string;
  yearsExperience: string;
  teachingCertificates: string;
  nativeLanguage: string;
  proficiencyLevel: string;
  bio: string;
  motivation: string;
  resume: File | null;
  videoIntro: File | null;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const REQUIRED_FIELDS_BY_STEP: Record<number, (keyof FormData)[]> = {
  1: ['firstName', 'lastName', 'email', 'password', 'repeatPassword', 'phone', 'country'],
  2: ['education', 'yearsExperience', 'nativeLanguage', 'proficiencyLevel'],
  3: ['bio', 'motivation', 'resume'],
};

export const BecomeTeacher = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: '',
    phone: '',
    country: '',

    // Professional Info
    education: '',
    yearsExperience: '',
    teachingCertificates: '',
    nativeLanguage: '',
    proficiencyLevel: '',

    // Additional Info
    bio: '',
    motivation: '',
    resume: null,
    videoIntro: null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (field === 'resume') {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedTypes.includes(file.type)) {
          setErrors({
            ...errors,
            [field]: 'Only PDF, DOC, and DOCX files are allowed',
          });
          return;
        }
      } else if (field === 'videoIntro') {
        if (!file.type.startsWith('video/')) {
          setErrors({
            ...errors,
            [field]: 'Only video files are allowed',
          });
          return;
        }
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors({
          ...errors,
          [field]: `File size must be less than 50MB`,
        });
        return;
      }
      setFormData({
        ...formData,
        [field]: file,
      });
      // Clear error for this field
      if (errors[field as keyof FormData]) {
        setErrors({
          ...errors,
          [field]: undefined,
        });
      }
    }
  };

  const validateStep = (step: number): boolean => {
    const fieldsToValidate = REQUIRED_FIELDS_BY_STEP[step];
    const newErrors: FormErrors = {};

    fieldsToValidate.forEach((field) => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] =
          `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
      }
    });

    // Password validation
    if (step === 1) {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.repeatPassword) {
        newErrors.repeatPassword = 'Passwords do not match';
      }
    }

    // Validate using Yup schema
    BecomeTeacherSchema.validate(formData, { abortEarly: false }).catch(
      (err) => {
        err.inner.forEach((error: any) => {
          if (fieldsToValidate.includes(error.path as keyof FormData)) {
            newErrors[error.path as keyof FormData] = error.message;
          }
        });
      },
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('formData', formData);
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required files
      if (!formData.resume) {
        throw new Error('Resume is required');
      }

      console.log('Registering teacher with files...');
      
      // Register teacher (creates account, uploads files, saves all data)
      const result = await registerTeacherUser(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.bio,
        formData.motivation,
        formData.resume,
        formData.videoIntro,
      );

      console.log('Teacher registration successful:', result);

      // Show success message and redirect
      alert(
        'Application submitted successfully! We will review your application and contact you within 3-5 business days.',
      );
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting teacher application:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to submit application. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(3, currentStep + 1));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
    setErrors({});
  };

  const totalSteps = 3;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            <div>
              <h2 className='mb-2 text-2xl font-bold text-foreground'>
                Personal Information
              </h2>
              <p className='text-muted-foreground'>Tell us about yourself</p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  First Name *
                </label>
                <input
                  type='text'
                  name='firstName'
                  placeholder='John'
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 transition-all border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.firstName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                />
                {errors.firstName && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Last Name *
                </label>
                <input
                  type='text'
                  name='lastName'
                  placeholder='Doe'
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 transition-all border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.lastName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                />
                {errors.lastName && (
                  <p className='mt-1 text-sm text-red-500'>{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Email Address *
                </label>
                <input
                  type='email'
                  name='email'
                  placeholder='john.doe@example.com'
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
                  Password *
                </label>
                <input
                  type='password'
                  name='password'
                  placeholder='Enter password (min 6 characters)'
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 transition-all border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                />
                {errors.password && (
                  <p className='mt-1 text-sm text-red-500'>{errors.password}</p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Repeat Password *
                </label>
                <input
                  type='password'
                  name='repeatPassword'
                  placeholder='Repeat password'
                  value={formData.repeatPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 transition-all border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.repeatPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                />
                {errors.repeatPassword && (
                  <p className='mt-1 text-sm text-red-500'>{errors.repeatPassword}</p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Phone Number *
                </label>
                <input
                  type='tel'
                  name='phone'
                  placeholder='+1 (555) 123-4567'
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 transition-all border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                />
                {errors.phone && (
                  <p className='mt-1 text-sm text-red-500'>{errors.phone}</p>
                )}
              </div>

              <div className='md:col-span-2'>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Country of Residence *
                </label>
                <select
                  name='country'
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 transition-all border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 ${
                    errors.country
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                >
                  <option value=''>Select your country</option>
                  <option value='GE'>Georgia</option>
                  <option value='US'>United States</option>
                  <option value='UK'>United Kingdom</option>
                  <option value='CA'>Canada</option>
                  <option value='AU'>Australia</option>
                  <option value='NZ'>New Zealand</option>
                  <option value='IE'>Ireland</option>
                  <option value='RU'>Russia</option>
                  <option value='other'>Other</option>
                </select>
                {errors.country && (
                  <p className='mt-1 text-sm text-red-500'>{errors.country}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div>
              <h2 className='mb-2 text-2xl font-bold text-foreground'>
                Professional Background
              </h2>
              <p className='text-muted-foreground'>
                Share your teaching experience and qualifications
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Highest Education Level *
                </label>
                <select
                  name='education'
                  value={formData.education}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 transition-all border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 ${
                    errors.education
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                >
                  <option value=''>Select education level</option>
                  <option value='bachelors'>Bachelor's Degree</option>
                  <option value='masters'>Master's Degree</option>
                  <option value='phd'>PhD</option>
                  <option value='other'>Other</option>
                </select>
                {errors.education && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.education}
                  </p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Years of Teaching Experience *
                </label>
                <select
                  name='yearsExperience'
                  value={formData.yearsExperience}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 transition-all border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 ${
                    errors.yearsExperience
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                >
                  <option value=''>Select experience</option>
                  <option value='0-1'>Less than 1 year</option>
                  <option value='1-3'>1-3 years</option>
                  <option value='3-5'>3-5 years</option>
                  <option value='5-10'>5-10 years</option>
                  <option value='10+'>10+ years</option>
                </select>
                {errors.yearsExperience && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.yearsExperience}
                  </p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Teaching Certificates (e.g., TEFL, TESOL, CELTA)
                </label>
                <input
                  type='text'
                  name='teachingCertificates'
                  placeholder='TEFL, TESOL, etc.'
                  value={formData.teachingCertificates}
                  onChange={handleChange}
                  className='w-full px-4 py-3 transition-all border rounded-lg bg-background border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Native Language *
                </label>
                <input
                  type='text'
                  name='nativeLanguage'
                  placeholder='English'
                  value={formData.nativeLanguage}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 transition-all border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.nativeLanguage
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                />
                {errors.nativeLanguage && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.nativeLanguage}
                  </p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  English Proficiency Level *
                </label>
                <select
                  name='proficiencyLevel'
                  value={formData.proficiencyLevel}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 transition-all border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 ${
                    errors.proficiencyLevel
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                >
                  <option value=''>Select proficiency</option>
                  <option value='native'>Native Speaker</option>
                  <option value='c2'>C2 - Proficient</option>
                  <option value='c1'>C1 - Advanced</option>
                </select>
                {errors.proficiencyLevel && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.proficiencyLevel}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div>
              <h2 className='mb-2 text-2xl font-bold text-foreground'>
                Additional Information
              </h2>
              <p className='text-muted-foreground'>
                Help us get to know you better
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Short Bio *
                </label>
                <textarea
                  name='bio'
                  placeholder='Tell students about yourself, your teaching style, and what makes you a great teacher...'
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={`w-full px-4 py-3 transition-all border rounded-lg resize-none bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.bio
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                />
                {errors.bio && (
                  <p className='mt-1 text-sm text-red-500'>{errors.bio}</p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Why do you want to teach at British World? *
                </label>
                <textarea
                  name='motivation'
                  placeholder='Share your motivation for joining our platform...'
                  value={formData.motivation}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={`w-full px-4 py-3 transition-all border rounded-lg resize-none bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.motivation
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                />
                {errors.motivation && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.motivation}
                  </p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Upload Resume/CV *
                </label>
                <div className='relative'>
                  <input
                    type='file'
                    accept='.pdf,.doc,.docx'
                    onChange={(e) => handleFileChange(e, 'resume')}
                    required
                    className='hidden'
                    id='resume-upload'
                  />
                  <label
                    htmlFor='resume-upload'
                    className={`flex items-center justify-center w-full px-4 py-6 transition-all border-2 border-dashed rounded-lg cursor-pointer ${
                      errors.resume
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        : 'bg-background border-border hover:bg-accent'
                    }`}
                  >
                    <div className='text-center'>
                      <Upload className='w-8 h-8 mx-auto mb-2 text-muted-foreground' />
                      <span className='text-sm text-foreground'>
                        {formData.resume
                          ? formData.resume.name
                          : 'Click to upload (PDF, DOC, DOCX)'}
                      </span>
                    </div>
                  </label>
                </div>
                {errors.resume && (
                  <p className='mt-1 text-sm text-red-500'>{errors.resume}</p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-foreground'>
                  Video Introduction (Optional)
                </label>
                <div className='relative'>
                  <input
                    type='file'
                    accept='video/*'
                    onChange={(e) => handleFileChange(e, 'videoIntro')}
                    className='hidden'
                    id='video-upload'
                  />
                  <label
                    htmlFor='video-upload'
                    className='flex items-center justify-center w-full px-4 py-6 transition-all border-2 border-dashed rounded-lg cursor-pointer bg-background border-border hover:bg-accent'
                  >
                    <div className='text-center'>
                      <Video className='w-8 h-8 mx-auto mb-2 text-muted-foreground' />
                      <span className='text-sm text-foreground'>
                        {formData.videoIntro
                          ? formData.videoIntro.name
                          : 'Click to upload a short video (Max 2 minutes)'}
                      </span>
                    </div>
                  </label>
                </div>
                <p className='mt-1 text-xs text-muted-foreground'>
                  A short video introduction can help you stand out!
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='flex flex-col min-h-screen bg-background'>
      {/* Header */}
      <div className='p-4 border-b sm:p-6 border-border'>
        <div className='flex items-center justify-between max-w-4xl mx-auto'>
          <Link
            to='/'
            className='inline-flex items-center space-x-2 transition-colors text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='w-5 h-5' />
            <span>Back to home</span>
          </Link>

          <div className='flex items-center space-x-2'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-purple-600'>
              <span className='text-xl font-bold text-white'>BW</span>
            </div>
            <span className='hidden text-xl font-semibold text-foreground sm:inline'>
              British World
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='mb-12 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-linear-to-br from-blue-500 to-purple-600'>
              <GraduationCap className='w-8 h-8 text-white' />
            </div>
            <h1 className='mb-4 text-4xl font-bold text-foreground'>
              Become a Teacher
            </h1>
            <p className='max-w-2xl mx-auto text-lg text-muted-foreground'>
              Join our global community of educators and inspire students
              worldwide
            </p>
          </div>

          {/* Benefits */}
          <div className='grid gap-6 mb-12 md:grid-cols-3'>
            <div className='p-6 text-center border bg-card border-border rounded-xl'>
              <Globe className='w-10 h-10 mx-auto mb-3 text-blue-500' />
              <h3 className='mb-2 font-semibold text-foreground'>
                Work From Anywhere
              </h3>
              <p className='text-sm text-muted-foreground'>
                Teach from the comfort of your home
              </p>
            </div>
            <div className='p-6 text-center border bg-card border-border rounded-xl'>
              <Clock className='w-10 h-10 mx-auto mb-3 text-purple-500' />
              <h3 className='mb-2 font-semibold text-foreground'>
                Flexible Schedule
              </h3>
              <p className='text-sm text-muted-foreground'>
                Set your own availability
              </p>
            </div>
            <div className='p-6 text-center border bg-card border-border rounded-xl'>
              <DollarSign className='w-10 h-10 mx-auto mb-3 text-green-500' />
              <h3 className='mb-2 font-semibold text-foreground'>
                Competitive Pay
              </h3>
              <p className='text-sm text-muted-foreground'>
                Earn $15-$50 per hour
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              {[1, 2, 3].map((step) => (
                <div key={step} className='flex items-center flex-1'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step === currentStep
                        ? 'bg-linear-to-br from-blue-500 to-purple-600 text-white'
                        : step < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step < currentStep ? (
                      <CheckCircle className='w-6 h-6' />
                    ) : (
                      step
                    )}
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step < currentStep ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Personal</span>
              <span className='text-muted-foreground'>Professional</span>
              <span className='text-muted-foreground'>Additional</span>
            </div>
          </div>

          {/* Form */}
          <div className='p-8 border shadow-lg bg-card border-border rounded-2xl'>
            <form onSubmit={handleSubmit}>
              {renderStep()}

              {/* Navigation Buttons */}
              <div className='flex items-center justify-between pt-6 mt-8 border-t border-border'>
                <button
                  type='button'
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className='px-6 py-3 font-medium transition-all border rounded-lg bg-background border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Previous
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type='button'
                    onClick={handleNextStep}
                    className='px-6 py-3 font-medium text-white transition-all rounded-lg bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='px-8 py-3 font-medium text-white transition-all rounded-lg bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
