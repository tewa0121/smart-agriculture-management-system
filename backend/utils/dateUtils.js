
const formatDate = (date) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    throw new Error("Invalid date");
  }

  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
};

const addDays = (date, days) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    throw new Error("Invalid date");
  }

  value.setDate(value.getDate() + Number(days));

  return formatDate(value);
};

const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new Error("Invalid date");
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round(
    (end.getTime() - start.getTime()) / millisecondsPerDay
  );
};

const isPast = (date) => {
  const today = formatDate(new Date());
  return formatDate(date) < today;
};

const isToday = (date) => {
  const today = formatDate(new Date());
  return formatDate(date) === today;
};

const isFuture = (date) => {
  const today = formatDate(new Date());
  return formatDate(date) > today;
};

module.exports = {
  formatDate,
  addDays,
  daysBetween,
  isPast,
  isToday,
  isFuture,
};

