import { object, string } from 'yup';

export const LoginSchema = object().shape({
  email: string().email('Invalid email address').required('Email is required'),

  password: string()
    // .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});
