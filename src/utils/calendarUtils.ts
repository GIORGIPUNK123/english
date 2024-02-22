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
export const myGetHourCorrectly = (hour: number): number[] => {
  const hourDecimal = Math.floor(hour);
  const minuteDecimal = Math.round((hour - hourDecimal) * 60);
  return [hourDecimal, minuteDecimal];
};
export const convertLocalDateToUTC = (localDate: Date) => {
  const utcOffset = localDate.getTimezoneOffset();
  const utcMilliseconds = localDate.getTime() + utcOffset * 60 * 1000;
  return new Date(utcMilliseconds);
};

export const generateAvailableHours = () => {
  const now = new Date(); // Current local time
  const nowUTC = convertLocalDateToUTC(now); // Current time in UTC
  const availableHoursUTC = [];

  for (let hour = 0; hour < 24; hour++) {
    // Set the current hour in UTC
    const currentHourUTC = new Date(nowUTC);
    currentHourUTC.setUTCHours(hour);

    // Check if the hour is not within the blocked range (20:00 UTC to 5:00 UTC)
    const isNotBlocked =
      currentHourUTC.getUTCHours() < 20 || currentHourUTC.getUTCHours() >= 5;

    if (isNotBlocked) {
      availableHoursUTC.push(hour);
    }
  }

  // Convert UTC hours to local time
  const availableHoursLocal = availableHoursUTC.map((hour) => {
    const utcDate = new Date();
    utcDate.setUTCHours(hour);
    return convertLocalDateToUTC(utcDate).getHours();
  });

  return availableHoursLocal;
};

export const generateHoursArr = () => {
  let arr: number[] = Array.from({ length: 24 }, (_, i) => i).filter(
    (i) => i < 20 && i > 4
  );
  const offset = -new Date().getTimezoneOffset() / 60;
  const localArr = arr.map((x) => {
    if (x + offset > 23) {
      return x - 24 + offset;
    } else {
      return x + offset;
    }
  });
  console.log('offset: ', offset);
  return localArr;
};
