import {
  addMonths,
  eachDayOfInterval,
  endOfYear,
  format,
  startOfHour,
  startOfYear,
} from "date-fns";

const currentYear = new Date().getFullYear();

const pixelsPerHour = 40;
const pixelsPerMinutes = pixelsPerHour / 60;
const pixelsPerDay = 24 * pixelsPerHour;
const eventHeight = 35;

const startDate = startOfYear(new Date(currentYear, 0, 1));
const endDate = endOfYear(new Date(currentYear, 11, 31));

const allDaysOfYear = eachDayOfInterval({ start: startDate, end: endDate });

const getAllMonthsOfYear = (year?: number) => {
  const months = [];
  let currentDate = new Date(year || currentYear, 0, 1);

  for (let i = 0; i < 12; i++) {
    months.push(format(currentDate, "MMMM"));
    currentDate = addMonths(currentDate, 1);
  }

  return months;
};

const getAllHoursOfDay = (numberOfdays: number) => {
  const hours = [];

  for (let i = 0; i < numberOfdays; i++) {
    for (let j = 0; j < 24; j++) {
      const formattedHour = format(startOfHour(new Date().setHours(j)), "HH");
      hours.push(formattedHour);
    }
  }

  return hours;
};


export {
  allDaysOfYear,
  eventHeight,
  getAllHoursOfDay,
  getAllMonthsOfYear,
  pixelsPerDay,
  pixelsPerHour,
  pixelsPerMinutes,
};
