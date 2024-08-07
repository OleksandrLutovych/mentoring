import { useMemo, useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import {
  eachDayOfInterval,
  eachHourOfInterval,
  eachMonthOfInterval,
  endOfYear,
  getUnixTime,
  startOfYear,
} from "date-fns";

import { Box } from "@chakra-ui/layout";

import { useDraggableScroll } from "utils/hooks";

import HourlyScheduleProvider from "./HourlyScheduleContext";
import {
  HourlyScheduleAside,
  HourlyScheduleBody,
  HourlyScheduleHeader,
  HourlyScheduleSummary,
} from "./partial";
import { Filters } from "./partial/components";
import {
  Event,
  ExtractEventLabelFn,
  ExtractEventLookFn,
  ExtractEventTooltipLabelFn,
  ExtractRowLabelFn,
  Holiday,
  ScheduleData,
  Summary,
  WithId,
} from "./types";
import { getAllMonthsOfYear, pixelsPerDay } from "./utils/constants";
import { useHourlyScheduleMode, useStartedScrollPosition } from "./utils/hooks";
import { getModeSizes } from "./utils/methods";

type CommonProps<T extends WithId, E extends Event> = {
  data: Array<ScheduleData<T, E>>;
  onEventClick?: (header: T, event: E) => void;
  holidays: Array<Holiday>;
  extractRowLabel: ExtractRowLabelFn<T>;
  extractEventLabel: ExtractEventLabelFn<E>;
  extractEventLook: ExtractEventLookFn<E>;
  extractTooltipLabel: ExtractEventTooltipLabelFn<E>;
  datesRangeStart: number;
  datesRangeEnd: number;
  handleZoomIn?: () => void;
  handleZoomOut?: () => void;
  disableZoom?: boolean;
  mode: ReturnType<typeof useHourlyScheduleMode>["mode"];
  summary?: Array<Summary>;
  cellActions?: boolean;
  onCellClick?: (date: Date) => void;
  afterSelectActionFn?: (
    selectedDays: Array<{ id: number | string; date: Date }>
  ) => void;
  emptyCellText?: string;
  enableWeekFilters?: boolean;
  enableDefaultFilters?: boolean;
};

type ConditionalProps =
  | {
      cellActionsEnabled?: false;
    }
  | {
      cellActionsEnabled: true;
      afterSelectActionFn: (
        selectedDays: Array<{ id: number | string; date: Date }>
      ) => void;
    };

type Props<T extends WithId, E extends Event> = CommonProps<T, E> &
  ConditionalProps;

const HourlySchedule = <T extends WithId, E extends Event>({
  data,
  holidays,
  datesRangeStart,
  datesRangeEnd,
  mode,
  summary,
  cellActionsEnabled,
  emptyCellText,
  onEventClick,
  afterSelectActionFn,
  extractEventLabel,
  extractEventLook,
  extractRowLabel,
  handleZoomIn,
  handleZoomOut,
  extractTooltipLabel,
  disableZoom = false,
  enableWeekFilters = false,
  enableDefaultFilters = false,
}: Props<T, E>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const props = useDraggableScroll({ parent: parentRef, mode: "horizontal" });

  const month = useMemo(
    () =>
      eachMonthOfInterval({
        start: startOfYear(new Date(datesRangeStart)),
        end: endOfYear(new Date(datesRangeEnd)),
      }),
    [datesRangeEnd, datesRangeStart]
  );

  const modeSizes = useMemo(
    () => getModeSizes(month, { start: datesRangeStart, end: datesRangeEnd }),
    [datesRangeEnd, datesRangeStart, month]
  );

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: modeSizes[mode].daysMapping.start,
        end: modeSizes[mode].daysMapping.end,
      }),
    [modeSizes, mode]
  );

  const hours = useMemo(
    () =>
      eachHourOfInterval({
        start: modeSizes[mode].daysMapping.start,
        end: modeSizes[mode].daysMapping.end,
      }),
    [mode, modeSizes]
  );

  useStartedScrollPosition({
    parentRef,
    startDate: datesRangeStart,
    endDate: datesRangeEnd,
    pixelsPerDay,
    mode,
  });

  const handleEventClick = (header: T, event: E) => {
    if (typeof onEventClick !== "function") {
      return;
    }

    onEventClick(header, event);
  };

  const subHeaderVirtualizer = useVirtualizer({
    horizontal: true,
    count: mode === "DEFAULT" ? hours.length : days.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => modeSizes[mode].subHeaderPixels,
    overscan: 2,
  });

  const mainHeaderVirtualizer = useVirtualizer({
    horizontal: true,
    count: mode === "DEFAULT" ? days.length : getAllMonthsOfYear().length,
    getScrollElement: () => parentRef.current,
    estimateSize: modeSizes[mode].mainHeaderPixels,
    overscan: 0,
  });

  const summaryHeaders = useMemo(
    () =>
      summary
        ?.reduce((acc, curr) => {
          curr.records.forEach((record) => {
            const typeSubType = `${record.type}:${record.subType}`;
            if (!acc.includes(typeSubType)) {
              acc.push(typeSubType);
            }
          });
          return acc;
        }, [] as string[])
        .map((pair) => {
          const [type, subType] = pair.split(":");
          return { type, subType: subType === "null" ? null : subType };
        }),
    [summary]
  );

  return (
    <HourlyScheduleProvider data={data}>
      {enableDefaultFilters && <Filters />}
      <Box ref={parentRef} height="900px" overflow="auto" position="relative">
        <Box
          {...props}
          w={`${mainHeaderVirtualizer.getTotalSize()}px`}
          display="flex"
        >
          <HourlyScheduleAside<T, E>
            summaryHeaders={summaryHeaders}
            extractLabel={extractRowLabel}
            handleZoomIn={handleZoomIn}
            handleZoomOut={handleZoomOut}
            disableZoom={disableZoom}
            mode={mode}
          />
          <Box className="wrapper">
            <HourlyScheduleHeader
              days={days}
              subHeaderVizualizer={subHeaderVirtualizer}
              mainHeaderVizualizer={mainHeaderVirtualizer}
              hours={mode === "DEFAULT" ? hours : days}
              month={month}
              mode={mode}
              holidays={holidays}
              datesRangeStart={datesRangeStart}
              datesRangeEnd={datesRangeEnd}
              enableWeekFilters={enableWeekFilters}
            />

            <HourlyScheduleBody<T, E>
              subHeaderVizualizer={subHeaderVirtualizer}
              mainHeaderVizualizer={mainHeaderVirtualizer}
              onEventClick={handleEventClick}
              extractLabel={extractEventLabel}
              extractLook={extractEventLook}
              extractTooltipLabel={extractTooltipLabel}
              datesRangeEnd={
                mode === "DEFAULT"
                  ? datesRangeEnd
                  : getUnixTime(endOfYear(datesRangeEnd)) * 1000
              }
              datesRangeStart={
                mode === "DEFAULT"
                  ? datesRangeStart
                  : getUnixTime(startOfYear(datesRangeStart)) * 1000
              }
              mode={mode}
              days={days}
              holidays={holidays}
              afterSelectActionFn={afterSelectActionFn}
              cellActionsEnabled={cellActionsEnabled}
              emptyCellText={emptyCellText}
            />
            <HourlyScheduleSummary
              data={summary}
              days={days}
              columns={days}
              mode={mode}
              headers={summaryHeaders}
            />
          </Box>
        </Box>
      </Box>
    </HourlyScheduleProvider>
  );
};

export default HourlySchedule;
