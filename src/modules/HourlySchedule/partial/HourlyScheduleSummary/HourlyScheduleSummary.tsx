import React from "react";

import { format } from "date-fns";

import { Box, Flex, useColorModeValue } from "@chakra-ui/react";

import { genericMemo } from "utils/methods";

import { ScheduleMode, Summary } from "../../types";
import { eventHeight, pixelsPerHour } from "../../utils/constants";

type Props = {
  data?: Array<Summary>;
  columns: Date[];
  days: Date[];
  headers?: { type: string; subType: string | null }[];
  mode: ScheduleMode;
};

const HourlyScheduleSummary = ({
  data,
  columns,
  days,
  headers,
  mode,
}: Props) => {
  const bgColor = useColorModeValue("orange.100", "yellow.600");
  if (!data || mode !== ScheduleMode.MONTH) {
    return null;
  }

  return (
    <Flex
      position="sticky"
      bottom={0}
      left={0}
      className="summary"
      flexDir="row"
      zIndex={1}
    >
      <Box position="relative">
        {headers?.map(({ subType: headerSubtype, type: headerType }) => (
          <Box
            key={`${headerType}-${headerSubtype}`}
            borderBottom="1px solid #bbb"
            height="35px"
            width={columns?.length * pixelsPerHour}
            bgColor={bgColor}
            position="relative"
          >
            {columns.map((_, columnIndex) => {
              return (
                <Box
                  key={columnIndex}
                  position="absolute"
                  width={`${pixelsPerHour}px`}
                  transform={`translateX(${columnIndex * pixelsPerHour}px)`}
                  textAlign="center"
                  fontWeight="600"
                  height={eventHeight}
                  borderLeft="1px solid #bbb"
                >
                  {data.map(({ records }, index) => {
                    if (
                      format(days[columnIndex], "yyyy-MM-dd") ===
                      data[index].forDate
                    ) {
                      return (
                        <React.Fragment key={`event_${index}`}>
                          {
                            records.find(
                              ({ type, subType }) =>
                                type === headerType && subType === headerSubtype
                            )?.count
                          }
                        </React.Fragment>
                      );
                    }
                  })}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Flex>
  );
};

export default genericMemo(HourlyScheduleSummary, (prevProps, nextProps) => {
  return prevProps.mode === nextProps.mode;
});
