import { useTranslation } from "react-i18next";

import { Box, Flex, useColorModeValue } from "@chakra-ui/react";

import { genericMemo } from "utils/methods";

import { Event, ExtractRowLabelFn, ScheduleMode, WithId } from "../../types";
import { eventHeight } from "../../utils/constants";
import { mapEvents } from "../../utils/methods";
import { useHourlySchedule } from "../../utils/useHourlySchedule";
import { ZoomButtonGroup } from "../components";

type Props<T extends WithId, E extends Event> = {
  summaryHeaders?: { type: string; subType: string | null }[];
  extractLabel: ExtractRowLabelFn<T>;
  handleZoomIn?: () => void;
  handleZoomOut?: () => void;
  disableZoom?: boolean;
  mode: ScheduleMode;
};

const HourlyScheduleAside = <T extends WithId, E extends Event>({
  summaryHeaders,
  extractLabel,
  handleZoomIn,
  handleZoomOut,
  mode,
  disableZoom = false,
}: Props<T, E>) => {
  const { t } = useTranslation();
  const bgColor = useColorModeValue("#e9ecf0", "gray.600");
  const summaryBgColor = useColorModeValue("orange.100", "yellow.600");

  const { data } = useHourlySchedule<T, E>();
  return (
    <Flex
      key={JSON.stringify(data)}
      flexDir="column"
      borderLeft="1px solid #bbb"
      borderRight="1px solid #bbb"
      position="sticky"
      left={0}
      bgColor={bgColor}
      zIndex={10}
      flexGrow={0}
      flexShrink={0}
      flexBasis="fit-content"
    >
      <Box height={mode === "MONTH" ? "150px" : "120px"} minWidth="75px">
        {!disableZoom && handleZoomIn && handleZoomOut && (
          <ZoomButtonGroup
            handleZoomIn={handleZoomIn}
            handleZoomOut={handleZoomOut}
          />
        )}
      </Box>
      {data.map(({ header, events }) => {
        const parsedEvents = mapEvents(events);
        const height = parsedEvents.length;

        return (
          <Box
            key={header.id}
            borderBottom="1px solid #bbb"
            h={`${height * eventHeight}px`}
            p="0 4px"
            position="relative"
            display="flex"
            alignItems="center"
            fontWeight="600"
            fontSize={14}
            px={2}
          >
            {extractLabel(header)}
          </Box>
        );
      })}
      {mode === "MONTH" && (
        <Box
          position="sticky"
          bottom="0"
          height={eventHeight * (summaryHeaders?.length ?? 0)}
        >
          {summaryHeaders?.map(({ type, subType }) => (
            <Box
              key={`${type}_${subType ?? ""}`}
              borderBottom="1px solid #bbb"
              px={2}
              fontSize={14}
              fontWeight="700"
              height={eventHeight}
              bgColor={summaryBgColor}
              display="flex"
              alignItems="center"
            >
              {subType
                ? t(`custom:vacationTypes.${subType}`)
                : t(
                    type === "WORK"
                      ? `schedule:reports.summary.present`
                      : `schedule:type.${type}`
                  )}
            </Box>
          ))}
        </Box>
      )}
    </Flex>
  );
};

export default genericMemo(HourlyScheduleAside, (prevProps, nextProps) => {
  return prevProps.mode === nextProps.mode;
});
