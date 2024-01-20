export const getMonday = (d: Date) => {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};
export const daysInMonth = (month: number, year: number) =>
  new Date(year, month, 0).getDate();
export const isCurrentDay = (day: number, month: number, year: number) => {
  const now = new Date();
  return (
    day === now.getDate() &&
    month === now.getMonth() &&
    year === now.getFullYear()
  );
};
