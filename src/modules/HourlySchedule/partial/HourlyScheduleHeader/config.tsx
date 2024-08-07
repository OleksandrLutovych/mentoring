import {
  differenceInDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  getDayOfYear,
  isToday,
  isWeekend,
  max,
  min,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { times } from "lodash-es";

import { ColorCodes } from "components/schedules/utils/types";

import { ScheduleMode } from "../../types";

const getStartOfWeek = (date: Date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  return startOfWeek;
};

const generateWeekDates = (startDate: Date) => {
  const startOfWeek = getStartOfWeek(startDate);
  const weekDates = times(365, (i) => {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i + 1);

    return currentDate;
  });

  return weekDates;
};

const getWeekDate = (startDate: Date) => {
  const startOfWeek = getStartOfWeek(startDate);
  const weekDates = times(8, (i) => {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i + 1);
    return currentDate;
  });

  return weekDates;
};

const getBackgroundColor = (
  day: Date,
  filteredHolidays: Array<number>,
  colors: ColorCodes,
  mode: ScheduleMode
) => {
  if (mode === "MONTH" && isWeekend(day)) {
    return `${colors["WEEKEND"]}50`;
  }

  if (mode === "DEFAULT" && isWeekend(day)) {
    return `${colors["WEEKEND"]}50`;
  }
  if (
    mode === "MONTH" &&
    filteredHolidays.some((holiday) => holiday === getDayOfYear(day))
  ) {
    return `${colors["HOLIDAY"]}70`;
  }

  return "transparent";
};

const getDayColor = (day: Date, fontColor: string, mode: ScheduleMode) =>
  mode === "MONTH" && isToday(day) ? "white" : fontColor;

const getDayBgColor = (day: Date, mode: ScheduleMode) => {
  if (mode === "MONTH" && isToday(day)) {
    return "#f7a823";
  }
  return "transparent";
};

const headerTitles = (date: Date) => generateWeekDates(date);

const weekDays = (date: number | Date) => getWeekDate(startOfDay(date));

const daysInCurrentWeek = (
  week: Date,
  datesRangeStart: Date | number,
  datesRangeEnd: Date | number,
  mode: ScheduleMode
): number => {
  const weekStart = startOfWeek(week);
  const weekEnd = endOfWeek(week);
  const yearStart = startOfYear(datesRangeStart);
  const yearEnd = endOfYear(datesRangeEnd);
  const monthStart = startOfMonth(datesRangeStart);
  const monthEnd = endOfMonth(datesRangeEnd);

  const effectiveStart = max([
    weekStart,
    mode === "MONTH" ? yearStart : monthStart,
  ]);
  const effectiveEnd = min([weekEnd, mode === "MONTH" ? yearEnd : monthEnd]);

  return differenceInDays(effectiveEnd, effectiveStart) + 1;
};

export {
  headerTitles,
  weekDays,
  getBackgroundColor,
  getDayColor,
  getDayBgColor,
  daysInCurrentWeek,
};
