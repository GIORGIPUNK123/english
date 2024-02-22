import { TopicT, optionT } from '../types';

export const SelectInput: React.FC<{
  value: string | number;
  defaultValue?: string | number;
  onChange: (e: any) => void;
  options: optionT[];
}> = (props) => {
  return (
    <select
      // id={props.inputId}
      className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
      onChange={props.onChange}
      value={props.value}
    >
      {props.options.map((x, _) => (
        <option key={_} value={x.id}>
          {x.label}
        </option>
      ))}
    </select>
  );
};

const topicSelectInput = (props: any) => {
  return (
    <select
      id={props.inputId}
      className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
      onChange={(e: any) => {
        props.setSelectedTopicId(Number(e.target.value));
      }}
      value={props.selectedTopicId}
    >
      {(props.selectArr as TopicT[]).map((x) => (
        <option key={x.id} value={x.id}>
          {x.text}
        </option>
      ))}
    </select>
  );
};
