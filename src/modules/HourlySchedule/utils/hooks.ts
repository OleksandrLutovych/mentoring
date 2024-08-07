import { useEffect, useMemo, useState } from "react";

import {
  differenceInDays,
  eachDayOfInterval,
  getUnixTime,
  isWeekend,
  isWithinInterval,
  startOfYear,
} from "date-fns";

import { pixelsPerHour } from "./constants";

import {
  Event,
  ScheduleData,
  ScheduleMode,
  WeekFilter,
  WithId,
} from "../types";

type Props = {
  parentRef: React.MutableRefObject<HTMLDivElement | null>;
  startDate: Date | number;
  endDate: Date | number;
  pixelsPerDay: number;
  mode?: ReturnType<typeof useHourlyScheduleMode>["mode"];
};

type UseSelectCell = {
  afterSelectActionFn?: (selectedDays: SelectCell[]) => void;
};

type UseFilterData<T extends WithId, E extends Event> = {
  data: ScheduleData<T, E>[];
  weekFilters: WeekFilter[];
};

type SelectCell = {
  id: number | string;
  date: Date;
};

const useStartedScrollPosition = ({
  parentRef,
  startDate,
  pixelsPerDay,
  endDate,
  mode,
}: Props) => {
  useEffect(() => {
    const todayDate = new Date();
    if (!parentRef.current) {
      return;
    }
    if (mode === ScheduleMode.MONTH) {
      const daysDiff = differenceInDays(startDate, startOfYear(startDate));
      const pixelsForMonth = daysDiff * pixelsPerHour;

      parentRef.current.scrollLeft = pixelsForMonth;
    } else if (mode === ScheduleMode.DEFAULT || !mode) {
      const daysDiff = differenceInDays(todayDate, startDate);
      const pixelsForToday = daysDiff * pixelsPerDay;

      parentRef.current.scrollLeft = pixelsForToday;
    }
  }, [mode, startDate, endDate]);
};

const useHourlyScheduleMode = () => {
  const [mode, setMode] = useState<ScheduleMode>(ScheduleMode.MONTH);

  return { mode, setMode };
};

const useSelectCell = ({ afterSelectActionFn }: UseSelectCell) => {
  const [selectedColumns, setSelectedColumns] = useState<SelectCell[]>([]);
  const [selectedDays, setSelectedDays] = useState<SelectCell[]>([]);

  useEffect(() => {
    if (selectedColumns.length === 2) {
      const [startDate, endDate] = selectedColumns;
      const start = startDate.date;
      const end = endDate.date;
      const id = startDate.id;

      const selectedDaysInterval = eachDayOfInterval({
        start: start < end ? start : end,
        end: start < end ? end : start,
      });

      const selectedDaysWithId = selectedDaysInterval.map((day) => ({
        id,
        date: day,
      }));
      setSelectedDays(selectedDaysWithId);
      setSelectedColumns([]);
      afterSelectActionFn?.(selectedDaysWithId);

      setTimeout(() => {
        setSelectedDays([]);
      }, 2000);
    }
  }, [selectedColumns]);

  return { selectedColumns, setSelectedColumns, selectedDays, setSelectedDays };
};

const useFilterData = <T extends WithId, E extends Event>({
  data,
  weekFilters,
}: UseFilterData<T, E>) => {
  const filteredData = useMemo(() => {
    const allWeekdaysCovered = (
      events: E[],
      startDate: Date | string,
      endDate: Date | string
    ): boolean => {
      const daysInRange = eachDayOfInterval({
        start: new Date(startDate),
        end: new Date(endDate),
      });

      return daysInRange.every((day) => {
        if (isWeekend(day)) {
          return true;
        }
        const dayStart = getUnixTime(day) * 1000;
        const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;

        return events.some(
          (event) => event.startsAt <= dayEnd && event.endsAt >= dayStart
        );
      });
    };

    return data.filter(({ events }) =>
      weekFilters.every((weekFilter) => {
        const { startDate, endDate, filter } = weekFilter;
        const weekFilterIsNotEmpty = startDate !== "" && endDate !== "";

        const filterStartDate =
          startDate !== "" ? getUnixTime(new Date(startDate)) * 1000 : 0;
        const filterEndDate =
          endDate !== "" ? getUnixTime(new Date(endDate)) * 1000 : 0;

        const isSomeEventDayInFilterInterval = (start: number, end: number) => {
          const days = eachDayOfInterval({
            start,
            end,
          });

          return days.some((day) =>
            isWithinInterval(day, {
              start: filterStartDate,
              end: filterEndDate,
            })
          );
        };

        if (filter === "x" && weekFilterIsNotEmpty) {
          return !allWeekdaysCovered(events, startDate, endDate);
        }

        const filterConditions: { [key: string]: (event: E) => boolean } = {
          u: ({ type, startsAt, endsAt }) =>
            type === "VACATION" &&
            isSomeEventDayInFilterInterval(startsAt, endsAt),

          L4: ({ type, startsAt, endsAt }) =>
            type === "L4" && isSomeEventDayInFilterInterval(startsAt, endsAt),
        };

        if (filter in filterConditions) {
          return events.some(filterConditions[filter]);
        }

        return true;
      })
    );
  }, [data, weekFilters]);

  return { filteredData };
};

export {
  useHourlyScheduleMode,
  useStartedScrollPosition,
  useSelectCell,
  useFilterData,
};
