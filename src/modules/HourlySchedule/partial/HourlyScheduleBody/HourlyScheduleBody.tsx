import { MouseEvent, useCallback, useMemo, useState } from "react";

import { Virtualizer } from "@tanstack/react-virtual";
import {
  eachWeekendOfInterval,
  getDate,
  getDayOfYear,
  getDaysInMonth,
  getDaysInYear,
  getMonth,
  isWithinInterval,
} from "date-fns";

import { Box, Flex } from "@chakra-ui/react";

import colors from "components/schedules/utils/colors";

import {
  Event,
  ExtractEventLabelFn,
  ExtractEventLookFn,
  ExtractEventTooltipLabelFn,
  Holiday,
  ScheduleMode,
  WithId,
} from "../../types";
import { pixelsPerDay, pixelsPerHour } from "../../utils/constants";
import { useHourlyScheduleMode, useSelectCell } from "../../utils/hooks";
import {
  calculateEventSize,
  eventsFilter,
  mapEvents,
} from "../../utils/methods";
import { useHourlySchedule } from "../../utils/useHourlySchedule";
import { Columns, EventBox, NoContractEvent, SpecialDays } from "../components";

type Props<T extends WithId, E extends Event> = {
  subHeaderVizualizer: Virtualizer<HTMLDivElement, Element>;
  mainHeaderVizualizer: Virtualizer<HTMLDivElement, Element>;
  onEventClick?: (header: T, event: E) => void;
  extractLabel: ExtractEventLabelFn<E>;
  extractLook: ExtractEventLookFn<E>;
  extractTooltipLabel: ExtractEventTooltipLabelFn<E>;
  afterSelectActionFn?: (
    selectedDays: Array<{ id: number | string; date: Date }>
  ) => void;
  datesRangeStart: number;
  holidays: Array<Holiday>;
  datesRangeEnd: number;
  mode: ReturnType<typeof useHourlyScheduleMode>["mode"];
  days: Date[];
  cellActionsEnabled?: boolean;
  emptyCellText?: string;
};

const HourlyScheduleBody = <T extends WithId, E extends Event>({
  subHeaderVizualizer,
  mainHeaderVizualizer,
  onEventClick,
  datesRangeStart,
  datesRangeEnd,
  extractLabel,
  extractLook,
  extractTooltipLabel,
  afterSelectActionFn,
  mode,
  holidays,
  days,
  cellActionsEnabled,
  emptyCellText,
}: Props<T, E>) => {
  const { isNoContractShow, data, height } = useHourlySchedule<T, E>();
  const [hoveredEventId, setHoveredEventId] = useState<string | number | null>(
    null
  );
  const { selectedColumns, setSelectedColumns, selectedDays, setSelectedDays } =
    useSelectCell({
      afterSelectActionFn,
    });

  const handleNoContractEventClick =
    (id: string | number) => (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      setHoveredEventId(id);

      if (hoveredEventId === id) {
        setHoveredEventId(null);
      }
    };

  const hideNoContractEvent = () => {
    setHoveredEventId(null);
  };

  const filteredHolidays = useMemo(
    () =>
      holidays
        .filter((holiday) =>
          isWithinInterval(holiday.date, {
            start: days[0],
            end: days[days.length - 1],
          })
        )
        .map((holiday) => {
          if (mode === "MONTH") {
            return getDayOfYear(holiday.date);
          } else {
            return getDate(holiday.date);
          }
        }),
    [holidays, days, mode]
  );

  const weekends = useMemo(
    () =>
      eachWeekendOfInterval({ start: days[0], end: days[days.length - 1] }).map(
        (weekend) => {
          if (mode === "MONTH") {
            return getDayOfYear(weekend);
          } else {
            return getDate(weekend);
          }
        }
      ),
    [days, mode]
  );

  const left = useMemo(() => {
    return Array.from(
      {
        length:
          mode === "MONTH"
            ? getDaysInYear(datesRangeStart)
            : getDaysInMonth(datesRangeStart),
      },
      (_, index) => index * (mode === "MONTH" ? pixelsPerHour : pixelsPerDay)
    );
  }, [datesRangeStart, mode]);

  const onCellClick = (headerId: number | string) => (e: MouseEvent) => {
    setSelectedDays([]);
    const parentRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - parentRect.left;
    const dayIndex = Math.floor(x / pixelsPerHour);
    const day = days[dayIndex];

    if (day) {
      setSelectedColumns([...selectedColumns, { id: headerId, date: day }]);
    }
  };

  const eventClick = (header: T, event: E) => (e: MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(header, event);
  };
  return (
    <Box
      position="relative"
      w={`${mainHeaderVizualizer.getTotalSize()}px`}
      h={`${height}px`}
      top={0}
      onClick={hideNoContractEvent}
    >
      <SpecialDays
        key={"holidays"}
        filteredSpecialDays={filteredHolidays}
        height={height}
        left={left}
        mode={mode}
        color={colors["HOLIDAY"]}
      />
      <SpecialDays
        key={"weekends"}
        filteredSpecialDays={weekends}
        height={height}
        left={left}
        mode={mode}
        color={colors["WEEKEND"]}
      />
      <Columns height={height} columnVirtualizer={subHeaderVizualizer} />
      <Flex
        className="rows"
        flexDir={"column"}
        position={"relative"}
        key={JSON.stringify(data)}
      >
        {data.map(({ events, header }) => {
          const { newestContract } = header;
          const contractEndDate = newestContract?.endsAt;

          const filtredEvents =
            datesRangeEnd && datesRangeStart
              ? eventsFilter(events, datesRangeStart, datesRangeEnd)
              : events;
          const parsedEvents = mapEvents(filtredEvents);
          const height = parsedEvents.length;

          const noContractEvent = contractEndDate
            ? (() => {
                if (contractEndDate > datesRangeEnd) {
                  return null;
                }
                const noContractEventStart =
                  mode === ScheduleMode.DEFAULT &&
                  getMonth(datesRangeStart) !== getMonth(contractEndDate)
                    ? datesRangeStart
                    : 86400000 + contractEndDate;

                const {
                  left: noContractEventLeft,
                  width: NoContractEventWidth,
                } = calculateEventSize(
                  noContractEventStart,
                  datesRangeEnd,
                  mode,
                  datesRangeStart
                );

                return (
                  <NoContractEvent
                    left={noContractEventLeft}
                    width={NoContractEventWidth}
                    id={header.id}
                    handleEventVisibility={handleNoContractEventClick(
                      header.id
                    )}
                    isHovered={hoveredEventId === header.id}
                  />
                );
              })()
            : null;

          return (
            <Flex
              key={header.id}
              width={`${mainHeaderVizualizer.getTotalSize()}px`}
              height={`${height * 35}px`}
              borderBottom="1px solid #bbb"
              zIndex={1}
              position="relative"
              onClick={cellActionsEnabled ? onCellClick(header.id) : undefined}
              cursor={cellActionsEnabled ? "pointer" : "default"}
            >
              {emptyCellText &&
                subHeaderVizualizer.getVirtualItems().map((item) => {
                  return (
                    <Box
                      key={item.index}
                      borderLeft={"1px solid #bbb"}
                      width={`${pixelsPerHour}px`}
                      height={height * 35}
                      textAlign={"center"}
                      position={"absolute"}
                      left={item.start}
                      zIndex={0}
                    >
                      {emptyCellText}
                    </Box>
                  );
                })}
              {selectedColumns.map((selectedColumn) => {
                const { id, date } = selectedColumn;
                const dayIndex = days.findIndex(
                  (d) => d.getTime() === date.getTime()
                );
                const left = dayIndex * pixelsPerHour;
                if (id === header.id) {
                  return (
                    <Box
                      key={`${date}_${id}`}
                      left={left}
                      position="absolute"
                      bgColor={"yellow"}
                      opacity="0.5"
                      width={`${pixelsPerHour}px`}
                      height={height * 35}
                    />
                  );
                }
              })}
              {selectedDays.map((selectedDay) => {
                const { id, date } = selectedDay;
                const dayIndex = days.findIndex(
                  (d) => d.getTime() === date.getTime()
                );
                const left = dayIndex * pixelsPerHour;
                if (id === header.id) {
                  return (
                    <Box
                      key={`${date}_${id}`}
                      left={left}
                      position="absolute"
                      bgColor={"yellow"}
                      opacity="0.5"
                      width={`${pixelsPerHour}px`}
                      height={height * 35}
                    />
                  );
                }
              })}
              {parsedEvents.map((row, rowIndex) => {
                return row.map((event) => {
                  const { id, startsAt, endsAt } = event;
                  const { left, width } = calculateEventSize(
                    startsAt,
                    endsAt,
                    mode,
                    datesRangeStart
                  );
                  return (
                    <EventBox<E>
                      key={id}
                      event={event}
                      left={left}
                      rowIndex={rowIndex}
                      width={width}
                      extractLabel={extractLabel}
                      extractLook={extractLook}
                      extractTooltipLabel={extractTooltipLabel}
                      onEventClick={eventClick(header, event)}
                      mode={mode}
                    />
                  );
                });
              })}
              {isNoContractShow && noContractEvent}
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

export default HourlyScheduleBody;
