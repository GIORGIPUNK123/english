import { FormInputT } from '../types';

export const FormInput = (props: FormInputT) => {
  return (
    <div>
      <input
        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  '
        placeholder={props.placeholder}
        required
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        name={props.name}
      />
      <span className='pl-2 text-red-700'>{props.error}</span>

      {/* <input
        name={props.name}
        type='text'
        className='w-full h-10 placeholder-transparent text-gray-900 border-b-2 border-gray-300 peer focus:outline-none focus:borer-rose-600'
        placeholder={props.placeholder}
      />
      <label className='absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm'>
        {props.name}
      </label> */}
    </div>
  );
};
