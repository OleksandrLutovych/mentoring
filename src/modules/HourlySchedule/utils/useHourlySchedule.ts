import { Dispatch, SetStateAction, createContext, useContext } from "react";

import { once } from "lodash-es";

import { Event, ScheduleData, WeekFilter, WithId } from "../types";

type HourlyScheduleContextType<T extends WithId, E extends Event> = {
  isNoContractShow: boolean;
  searchPhrase: string;
  weekFilters: WeekFilter[];
  toggleNoContractVisible: () => void;
  onSearch: (searchPhrase: string) => void;
  setWeekFilter: Dispatch<SetStateAction<WeekFilter[]>>;
  height: number;
  data: ScheduleData<T, E>[];
};

const createHourlyScheduleContext = once(<
  T extends WithId,
  E extends Event
>() => createContext({} as HourlyScheduleContextType<T, E>));

const useHourlySchedule = <T extends WithId, E extends Event>() => {
  const hourlyScheduleContext = useContext(createHourlyScheduleContext<T, E>());

  if (!hourlyScheduleContext) {
    throw new Error(
      "useHourlySchedule must be used within a HourlyScheduleProvider"
    );
  }

  return hourlyScheduleContext;
};

export { useHourlySchedule };
export { createHourlyScheduleContext };
