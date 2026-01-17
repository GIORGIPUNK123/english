import { bool, object, string, array, mixed } from 'yup';

export const TeacherRegisterSchema = object().shape({
  name: string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Firstname is required'),

  surname: string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Lastname is required'),

  email: string().email('Invalid email').required('Email is required'),

  files: array()
    .of(
      mixed<File>()
        .test('fileType', 'Unsupported file format', (value) => {
          if (!value) return true;
          const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
          return allowed.includes(value.type);
        })
        .test('fileSize', 'File too large (max 10MB)', (value) => {
          if (!value) return true;
          return value.size <= 10000000; // 10MB
        })
    )
    .min(1, 'At least one file is required')
    .required('Please upload your CV'),

  accepted: bool().oneOf([true], 'You must accept the terms'),
});
