export const useBlockDate = (
  rowIndex: number,
  colIndex: number,
  month: number,
  year: number
) => {
  const date = new Date(year, month, colIndex);
  return date;
};
