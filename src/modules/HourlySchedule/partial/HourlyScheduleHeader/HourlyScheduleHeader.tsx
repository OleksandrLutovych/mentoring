import { useMemo } from "react";

import { Virtualizer } from "@tanstack/react-virtual";
import {
  eachWeekOfInterval,
  endOfMonth,
  endOfYear,
  getDate,
  getDay,
  getDayOfYear,
  isWithinInterval,
  startOfMonth,
  startOfYear,
} from "date-fns";

import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box, Flex } from "@chakra-ui/react";

import colors from "components/schedules/utils/colors";
import { useDateLocalizer } from "utils/hooks";

import {
  daysInCurrentWeek,
  getBackgroundColor,
  getDayBgColor,
  getDayColor,
} from "./config";
import { HeaderWeeks } from "./partials";

import { Holiday, ScheduleMode } from "../../types";
import { pixelsPerDay, pixelsPerHour } from "../../utils/constants";

type Props = {
  days: Date[];
  subHeaderVizualizer: Virtualizer<HTMLDivElement, Element>;
  mainHeaderVizualizer: Virtualizer<HTMLDivElement, Element>;
  hours: Date[];
  month: Date[];
  mode: ScheduleMode;
  holidays: Array<Holiday>;
  datesRangeStart: number;
  datesRangeEnd: number;
  enableWeekFilters?: boolean;
};

const HourlyScheduleHeader = ({
  days,
  mainHeaderVizualizer,
  subHeaderVizualizer,
  hours,
  month,
  mode,
  holidays,
  datesRangeStart,
  datesRangeEnd,
  enableWeekFilters,
}: Props) => {
  const { formatter, localizeWeekDay } = useDateLocalizer();
  const bgColor = useColorModeValue("#EFEFEF", "#6c757d");
  const fontColor = useColorModeValue("#3d6fae", "white");
  const virtualItems = subHeaderVizualizer.getVirtualItems();

  const modeDataFormat = {
    DEFAULT: {
      mainHeaderDataFormat: (index: number) =>
        formatter(days[index], "EEEE, MMMM dd, y"),
      subHeaderDataFormat: (index: number) => formatter(hours[index], "HH"),
    },
    MONTH: {
      mainHeaderDataFormat: (index: number) =>
        formatter(month[index], "LLLL, uuuu"),
      subHeaderDataFormat: (index: number) => formatter(days[index], "dd"),
    },
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

  const weeks = useMemo(() => {
    return eachWeekOfInterval({
      start:
        mode === "MONTH"
          ? startOfYear(datesRangeStart)
          : startOfMonth(datesRangeStart),
      end:
        mode === "MONTH" ? endOfYear(datesRangeEnd) : endOfMonth(datesRangeEnd),
    });
  }, [datesRangeStart, datesRangeEnd, mode]);

  const memoizedItems = useMemo(() => {
    return virtualItems.map((virtualColumn) => {
      const day = days[virtualColumn.index];
      const backgroundColor = getBackgroundColor(
        day,
        filteredHolidays,
        colors,
        mode
      );
      const dayBgColor = getDayBgColor(day, mode);
      const dayColor = getDayColor(day, fontColor, mode);
      const weekDay = localizeWeekDay(getDay(day), {
        width: "short",
        context: "",
      });

      return {
        ...virtualColumn,
        day,
        backgroundColor,
        dayBgColor,
        dayColor,
        weekDay,
      };
    });
  }, [virtualItems, days, filteredHolidays, mode, fontColor, localizeWeekDay]);

  return (
    <Flex
      position="sticky"
      bgColor="#7EA9D7"
      top={0}
      zIndex={2}
      h={mode === "MONTH" ? "150px" : "120px"}
      width={`${mainHeaderVizualizer.getTotalSize()}px`}
    >
      <Flex
        flexDirection="column"
        position="relative"
        width={`${mainHeaderVizualizer.getTotalSize()}px`}
      >
        <Box h="40px" w={"100%"}>
          {mainHeaderVizualizer.getVirtualItems().map((virtualColumn) => {
            return (
              <Box
                key={virtualColumn.key}
                position="absolute"
                height="40px"
                border="1px solid #bbb"
                backgroundColor={"#003554"}
                borderRight="none"
                textAlign="center"
                lineHeight="39px"
                color="white"
                style={{
                  width: `${virtualColumn.size}px`,
                  transform: `translateX(${virtualColumn.start}px)`,
                }}
              >
                {modeDataFormat[mode].mainHeaderDataFormat(virtualColumn.index)}
              </Box>
            );
          })}
        </Box>
        <Flex height={"40px"} gap={0}>
          {weeks.map((week, index) => {
            const daysInWeek = daysInCurrentWeek(
              week,
              datesRangeStart,
              datesRangeEnd,
              mode
            );
            const weekWidth = daysInWeek * pixelsPerDay;
            return (
              <HeaderWeeks
                key={`w_${index}`}
                week={week}
                width={weekWidth}
                enableWeekFilters={enableWeekFilters}
              />
            );
          })}
        </Flex>
        <Box
          h={mode === "MONTH" ? "70px" : "40px"}
          bgColor={bgColor}
          borderBottom="1px solid #bbb"
        >
          {memoizedItems.map(
            ({
              dayBgColor,
              backgroundColor,
              key,
              start,
              weekDay,
              dayColor,
              index,
            }) => {
              return (
                <Flex
                  key={key}
                  flexDir="column"
                  position="absolute"
                  height={mode === "MONTH" ? "70px" : "39px"}
                  width={`${pixelsPerHour}px`}
                  borderLeft="1px solid #bbb"
                  backgroundColor={backgroundColor}
                  textAlign="center"
                  lineHeight="30px"
                  style={{
                    left: `${start}px`,
                  }}
                  top="80px"
                  color={fontColor}
                  fontWeight="700"
                  alignItems="center"
                >
                  {mode === "MONTH" && <Box fontWeight="500">{weekDay}</Box>}
                  <Box
                    bgColor={dayBgColor}
                    color={dayColor}
                    borderRadius={"50%"}
                    width="30px"
                  >
                    {modeDataFormat[mode].subHeaderDataFormat(index)}
                  </Box>
                </Flex>
              );
            }
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default HourlyScheduleHeader;
