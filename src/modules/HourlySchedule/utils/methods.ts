import {
  differenceInDays,
  differenceInMinutes,
  endOfYear,
  getDaysInMonth,
  getUnixTime,
  isWithinInterval,
  startOfYear,
} from "date-fns";

import {
  allDaysOfYear,
  eventHeight,
  pixelsPerHour,
  pixelsPerMinutes,
} from "./constants";

import {
  Event,
  FilteredEvent,
  ScheduleData,
  ScheduleMode,
  ScheduleModeElements,
  WithId,
} from "../types";

const calculateEventSize = (
  startsAt: number,
  endsAt: number,
  mode: "DEFAULT" | "MONTH",
  startOfDatesRange?: number
) => {
  const startOfYear = getUnixTime(allDaysOfYear[0]) * 1000;

  if (mode === ScheduleMode.MONTH) {
    const positionDaysDiff = differenceInDays(startsAt, startOfYear);
    const lengthDayDiff = differenceInDays(endsAt, startsAt) + 1;

    return {
      width: lengthDayDiff * pixelsPerHour,
      left: positionDaysDiff * pixelsPerHour,
    };
  }

  const lengthMinutesDiff = differenceInMinutes(endsAt, startsAt);
  const positionHoursDiff = differenceInMinutes(
    startsAt,
    startOfDatesRange || startOfYear
  );

  return {
    width: lengthMinutesDiff * pixelsPerMinutes,
    left: positionHoursDiff * pixelsPerMinutes,
  };
};

const mapEvents = <T extends WithId, E extends Event>(
  events: ScheduleData<T, E>["events"]
) => {
  const overlaping = (e: E, event: E) => {
    return (
      (e.startsAt > event.startsAt && e.startsAt < event.endsAt) ||
      (e.endsAt > event.startsAt && e.endsAt < event.endsAt)
    );
  };

  return events.reduce(
    (acc, currentEvent) => {
      for (let i = 0; i < acc.length; i++) {
        const isOverlaping = acc[i].some((event) =>
          overlaping(currentEvent, event)
        );

        if (!isOverlaping) {
          acc[i].push(currentEvent);
          return acc;
        }
      }

      acc.push([currentEvent]);
      return acc;
    },
    [[]] as Array<Array<E>>
  );
};

const eventsFilter = <T extends WithId, E extends FilteredEvent>(
  events: ScheduleData<T, E>["events"],
  datesRangeStart: number,
  datesRangeEnd: number
) =>
  events.reduce((acc, event) => {
    const eventStartsWithinRange = isWithinInterval(event.startsAt, {
      start: datesRangeStart,
      end: datesRangeEnd,
    });
    const eventEndsWithinRange = isWithinInterval(event.endsAt, {
      start: datesRangeStart,
      end: datesRangeEnd,
    });

    if (event.endsAt > datesRangeEnd && eventStartsWithinRange) {
      acc.push({
        ...event,
        realDatesRange: { start: event.startsAt, end: event.endsAt },
        endsAt: datesRangeEnd,
      });
    }
    if (event.startsAt < datesRangeStart && eventEndsWithinRange) {
      acc.push({
        ...event,
        realDatesRange: { start: event.startsAt, end: event.endsAt },
        startsAt: datesRangeStart,
      });
    }
    if (eventStartsWithinRange && eventEndsWithinRange) {
      acc.push(event);
    }
    return acc;
  }, [] as Array<E>);

const getModeSizes = (
  month: Array<Date>,
  datesRange: {
    start: Date | number;
    end: Date | number;
  }
) => {
  const { start, end } = datesRange;
  const getMonthColumnSize = (index: number) =>
    getDaysInMonth(month[index]) * pixelsPerHour;

  const getDaysColumnSize = () => 24 * pixelsPerHour;

  const modeSizes: Record<ScheduleMode, ScheduleModeElements> = {
    DEFAULT: {
      subHeaderPixels: pixelsPerHour,
      mainHeaderPixels: () => getDaysColumnSize(),
      eventHeight,
      daysMapping: {
        start,
        end,
      },
    },
    MONTH: {
      subHeaderPixels: pixelsPerHour,
      mainHeaderPixels: (index: number) => getMonthColumnSize(index),
      eventHeight,
      daysMapping: {
        start: startOfYear(start),
        end: endOfYear(end),
      },
    },
  };

  return modeSizes;
};

export { calculateEventSize, eventsFilter, getModeSizes, mapEvents };
