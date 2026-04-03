export const TipWidget = (props: { tip: string; min?: boolean }) => {
  const { tip, min } = props;
  return (
    <div
      className={`p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/20 text-sm text-gray-600 dark:text-gray-400 sm:text-base ${min && 'w-fit'}`}
    >
      <span className='text-xs text-blue-600 sm:text-sm dark:text-blue-400'>
        {tip}
      </span>
    </div>
  );
};
