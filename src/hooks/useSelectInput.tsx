import { useEffect, useState } from 'react';
import { optionT } from '../types';

export const useSelectInput = (
  defaultId: optionT['id'],
  options: optionT[]
) => {
  const findFunc = (findById: optionT['id']) => {
    const find = options.find((x) => x.id === findById);
    return find ? find.id : options[0].id;
  };
  const [value, setValue] = useState(options[0].id);
  useEffect(() => {
    setValue(findFunc(defaultId));
  }, [defaultId]);
  const handleChange = (event: any) => {
    setValue(event.target.value);
  };
  return {
    value,
    handleChange,
    options,
  };
};
