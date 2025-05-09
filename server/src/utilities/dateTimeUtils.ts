export const getStartAndEndofTheDay = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return [start, end];
};

export const convertUtcStringToLocalDate = (utcTime: string) => {
  const localDateString = new Date(utcTime).toLocaleString();
  return new Date(localDateString);
};
