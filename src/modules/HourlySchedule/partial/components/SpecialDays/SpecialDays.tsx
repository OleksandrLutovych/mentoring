import { Box } from "@chakra-ui/react";

import { ScheduleMode } from "components/schedules/HourlySchedule/types";
import { pixelsPerHour } from "components/schedules/HourlySchedule/utils/constants";

type Props = {
  filteredSpecialDays: number[];
  left: number[];
  mode: ScheduleMode;
  height: number;
  color: string;
};

const SpecialDays = ({
  filteredSpecialDays,
  left,
  mode,
  height,
  color,
}: Props) => {
  return (
    <>
      {filteredSpecialDays.map((holiday) => {
        return (
          <Box
            key={holiday}
            left={left[holiday - 1]}
            position="absolute"
            bgColor={color}
            opacity="0.5"
            width={`${
              mode === ScheduleMode.DEFAULT ? pixelsPerHour * 24 : pixelsPerHour
            }px`}
            height={height}
          />
        );
      })}
    </>
  );
};

export default SpecialDays;
