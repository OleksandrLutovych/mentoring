import { useCallback, useMemo, useState } from "react";

import { Event, ScheduleData, WeekFilter, WithId } from "./types";
import { eventHeight } from "./utils/constants";
import { useFilterData } from "./utils/hooks";
import { mapEvents } from "./utils/methods";
import { createHourlyScheduleContext } from "./utils/useHourlySchedule";

type PropsWithChildren<T extends WithId, E extends Event> = {
  children: React.ReactNode;
  data: ScheduleData<T, E>[];
};

const HourlyScheduleContext = createHourlyScheduleContext();

const HourlyScheduleProvider = <T extends WithId, E extends Event>({
  children,
  data,
}: PropsWithChildren<T, E>) => {
  const [searchPhrase, setSearchPhrase] = useState("");
  const [isNoContractShow, setIsNoContractShow] = useState(true);
  const [weekFilters, setWeekFilter] = useState<WeekFilter[]>([]);

  const onSearch = useCallback((searchPhrase: string) => {
    setSearchPhrase(searchPhrase);
  }, []);

  const toggleNoContractVisible = () => {
    setIsNoContractShow((prev) => !prev);
  };

  const searchFilterData = data.filter(({ header: { firstName, lastName } }) =>
    [firstName, lastName].some((name) =>
      name.toLowerCase().includes(searchPhrase.toLowerCase().trim())
    )
  );

  const { filteredData } = useFilterData({
    data: searchFilterData,
    weekFilters,
  });

  const height = useMemo(() => {
    return filteredData.reduce((acc, { events }) => {
      const parsedEvents = mapEvents(events);
      const height = parsedEvents.length || 0;
      return acc + height * eventHeight;
    }, 0);
  }, [filteredData]);

  const value = useMemo(
    () => ({
      searchPhrase,
      isNoContractShow,
      onSearch,
      setWeekFilter,
      weekFilters,
      toggleNoContractVisible,
      height,
      data: filteredData,
    }),
    [isNoContractShow, searchPhrase, weekFilters, filteredData, height]
  );

  return (
    <HourlyScheduleContext.Provider value={value}>
      {children}
    </HourlyScheduleContext.Provider>
  );
};

export default HourlyScheduleProvider;
export { HourlyScheduleContext };
