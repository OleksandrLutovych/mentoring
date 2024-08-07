import { useMemo } from "react";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfYear,
  startOfYear,
} from "date-fns";

type UseYearlySchedulerPeriodsProps = {
  datesRangeStart: Date | number;
  datesRangeEnd: Date | number;
};

const useYearlySchedulerPeriods = ({
  datesRangeStart,
  datesRangeEnd,
}: UseYearlySchedulerPeriodsProps) => {
  const months = useMemo(
    () =>
      eachMonthOfInterval({
        start: startOfYear(new Date(datesRangeStart)),
        end: endOfYear(new Date(datesRangeEnd)),
      }),
    []
  );

  const weeks = useMemo(() => {
    return eachWeekOfInterval({
      start: startOfYear(datesRangeStart),
      end: endOfYear(datesRangeEnd),
    });
  }, [datesRangeStart, datesRangeEnd]);

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfYear(datesRangeStart),
        end: endOfYear(datesRangeEnd),
      }),
    [datesRangeEnd, datesRangeStart]
  );

  return { months, weeks, days };
};

export default useYearlySchedulerPeriods;
