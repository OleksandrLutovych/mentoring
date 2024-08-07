import { MouseEvent } from "react";

import { Box, Tooltip } from "@chakra-ui/react";

import { genericMemo } from "utils/methods";

import {
  Event,
  ExtractEventLabelFn,
  ExtractEventLookFn,
  ExtractEventTooltipLabelFn,
  FilteredEvent,
  ScheduleMode,
} from "../../../types";
import { eventHeight } from "../../../utils/constants";

type Props<E extends Event> = {
  event: E;
  extractLabel: ExtractEventLabelFn<E>;
  extractLook: ExtractEventLookFn<E>;
  extractTooltipLabel: ExtractEventTooltipLabelFn<E>;
  rowIndex: number;
  left: number;
  width: number;
  onEventClick?: (e: MouseEvent) => void;
  mode: ScheduleMode;
};

const EventBox = <E extends FilteredEvent>({
  extractLabel,
  extractLook,
  extractTooltipLabel,
  onEventClick,
  left,
  rowIndex,
  width,
  event,
}: Props<E>) => {
  const label = extractLabel(event);
  const look = extractLook(event);
  const tooltipLabel = extractTooltipLabel(event) ?? "";

  return (
    <Box zIndex={2}>
      <Tooltip label={tooltipLabel} hasArrow>
        <Box
          position="absolute"
          top={rowIndex * eventHeight}
          left={`${left}px`}
          h="35px"
          bgColor="#CCC"
          width={`${width}px`}
          border="1px solid #bbb"
          borderRadius={4}
          cursor="pointer"
          flexDir="column"
          textAlign="center"
          overflow="hidden"
          onClick={onEventClick}
          mixBlendMode={"overlay"}
          {...look}
        >
          {label}
        </Box>
      </Tooltip>
    </Box>
  );
};

export default genericMemo(EventBox, (prevProps, nextProps) => {
  return (
    prevProps.mode === nextProps.mode &&
    prevProps.extractTooltipLabel === nextProps.extractTooltipLabel
  );
});
