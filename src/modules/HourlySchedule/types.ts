import { ReactNode } from "react";

import { BoxProps } from "@chakra-ui/react";

import { EventType } from "../utils/enums";

type ScheduleData<T extends WithId, E extends Event> = {
  header: T;
  events: Array<E>;
};

type Summary = {
  forDate: string;
  records: Array<SummaryRecords>;
};

type SummaryRecords = {
  type: EventType;
  subType: string | null;
  count: number;
};

type WithId = {
  id: number | string;
  firstName: string;
  lastName: string;
  newestContract?: {
    endsAt?: number | null;
  };
};

type Event = {
  id: number;
  startsAt: number;
  endsAt: number;
  type: EventType;
};

type FilteredEvent = Event & {
  realDatesRange?: {
    start: number;
    end: number;
  };
};

type Holiday = {
  id: number;
  date: number;
  free: boolean;
};

type ExtractRowLabelFn<T extends WithId> = (header: T) => ReactNode;

type ExtractEventLabelFn<E extends Event> = (event: E) => ReactNode;

type ExtractEventLookFn<E extends Event> = (event: E) => Partial<BoxProps>;

type ExtractEventTooltipLabelFn<E extends Event> = (event: E) => ReactNode;

enum ScheduleMode {
  DEFAULT = "DEFAULT",
  MONTH = "MONTH",
}
type ScheduleModeElements = {
  subHeaderPixels: number;
  mainHeaderPixels: (index: number) => number;
  eventHeight: number;
  daysMapping: {
    start: Date | number;
    end: Date | number;
  };
};

type WeekFilter = {
  startDate: Date | "";
  endDate: Date | "";
  filter: string;
};

export { ScheduleMode };
export type {
  Event,
  FilteredEvent,
  Holiday,
  ScheduleData,
  WithId,
  ExtractEventLabelFn,
  ExtractEventLookFn,
  ExtractRowLabelFn,
  ExtractEventTooltipLabelFn,
  ScheduleModeElements,
  Summary,
  SummaryRecords,
  WeekFilter,
};
