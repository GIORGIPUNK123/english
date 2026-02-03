import { bool, object, string, mixed } from 'yup';

export const BecomeTeacherSchema = object().shape({
  // Step 1: Personal Information
  firstName: string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .required('First name is required'),

  lastName: string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .required('Last name is required'),

  email: string().email('Invalid email address').required('Email is required'),

  phone: string()
    .matches(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      'Invalid phone number format',
    )
    .required('Phone number is required'),

  country: string().required('Country is required'),

  // Step 2: Professional Background
  education: string().required('Education level is required'),

  yearsExperience: string().required('Years of experience is required'),

  teachingCertificates: string().max(
    500,
    'Teaching certificates must not exceed 500 characters',
  ),

  nativeLanguage: string()
    .min(2, 'Native language must be at least 2 characters')
    .required('Native language is required'),

  proficiencyLevel: string().required('English proficiency level is required'),

  // Step 3: Additional Information
  bio: string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio must not exceed 1000 characters')
    .required('Bio is required'),

  motivation: string()
    .min(50, 'Motivation must be at least 50 characters')
    .max(1000, 'Motivation must not exceed 1000 characters')
    .required('Motivation is required'),

  resume: mixed<File | null>()
    .test('fileRequired', 'Resume is required', (value) => {
      return value instanceof File;
    })
    .test('fileType', 'Resume must be PDF, DOC, or DOCX', (value) => {
      if (!value || !(value instanceof File)) return true;
      const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      return allowed.includes(value.type);
    })
    .test('fileSize', 'Resume must be less than 10MB', (value) => {
      if (!value || !(value instanceof File)) return true;
      return value.size <= 10 * 1024 * 1024; // 10MB
    }),

  videoIntro: mixed<File | null>()
    .test('fileType', 'Video must be a video file', (value) => {
      if (!value) return true;
      return value instanceof File && value.type.startsWith('video/');
    })
    .test('fileSize', 'Video must be less than 100MB', (value) => {
      if (!value || !(value instanceof File)) return true;
      return value.size <= 100 * 1024 * 1024; // 100MB
    }),
});
