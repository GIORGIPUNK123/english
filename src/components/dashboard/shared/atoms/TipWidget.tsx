export const TipWidget = (props: { tip: string; min?: boolean }) => {
  const { tip, min } = props;
  return (
    <div
      className={`p-3 text-sm border rounded-xl border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300 sm:text-base ${min ? 'w-fit' : ''}`}
    >
      {tip}
    </div>
  );
};
