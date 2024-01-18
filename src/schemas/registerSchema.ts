import { bool, object, ref, string } from 'yup';
export const RegisterSchema = object().shape({
  name: string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Firstname is required'),

  surname: string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Lastname is required'),

  email: string().email().required('Email is required'),

  password: string()
    .required('Password is required')
    .min(6, 'Password is too short - should be 6 chars minimum'),

  confirmPassword: string().oneOf(
    [ref('password')],
    'Must match "password" field value'
  ),
  accepted: bool().oneOf([true], 'Field must be checked'),
});
