import { MouseEventHandler, useEffect, useState } from "react";

import { endOfWeek, format, startOfWeek } from "date-fns";
import { MdOutlineArrowDropDown as SelectWeekIcon } from "react-icons/md";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";

import { useHourlySchedule } from "components/schedules/HourlySchedule/utils/useHourlySchedule";

type Props = {
  week: Date;
  width: number;
  enableWeekFilters?: boolean;
};

const HeaderWeeks = ({ week, width, enableWeekFilters }: Props) => {
  const { setWeekFilter } = useHourlySchedule();
  const { isOpen, onToggle } = useDisclosure();
  const [checkedItems, setCheckedItems] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  useEffect(() => {
    const filterTypes = ["??", "L4", "resign", "u", "ub", "x", "(Blanks)"];

    setWeekFilter((prevFilters) => {
      const newFilters = filterTypes.reduce((acc, filter, index) => {
        if (checkedItems[index]) {
          acc.push({
            startDate: startOfWeek(week),
            endDate: endOfWeek(week),
            filter: filter,
          });
        }
        return acc;
      }, [] as { startDate: Date | ""; endDate: Date | ""; filter: string }[]);

      const weekStart = startOfWeek(week);
      const weekEnd = endOfWeek(week);

      return [
        ...prevFilters.filter(
          (filter) => filter.startDate < weekStart || filter.endDate > weekEnd
        ),
        ...newFilters,
      ];
    });
  }, [checkedItems, week, setWeekFilter]);

  const handlePointerDown: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
  };

  return (
    <Flex
      height={"40px"}
      width={`${width}px`}
      border="1px solid #bbb"
      backgroundColor="#3d6fae"
      textAlign="center"
      boxSizing="border-box"
      borderRight="none"
      color="white"
      py={1}
      justifyContent={"space-between"}
      position={"relative"}
    >
      <Box flex={"1 0 0"}>{format(week, "ww")}</Box>
      {enableWeekFilters && (
        <Button
          size={"xs"}
          variant={"ghost"}
          _hover={{ opacity: 0.5 }}
          onClick={onToggle}
          onPointerDown={handlePointerDown}
        >
          <SelectWeekIcon size={20} color="white" />
          {checkedItems.some((item) => item) && "✓"}
        </Button>
      )}
      {isOpen && (
        <Flex
          position={"absolute"}
          bgColor={"white"}
          right={0}
          top={39}
          zIndex={100}
          color={"black"}
          flexDir={"column"}
          gap={1}
          p={2}
          border={"1px solid #bbb"}
        >
          <Stack pl={6} mt={1} spacing={1}>
            {["??", "L4", "resign", "u", "ub", "x", "(Blanks)"].map(
              (label, index) => (
                <Checkbox
                  key={label}
                  isChecked={checkedItems[index]}
                  onChange={(e) =>
                    setCheckedItems((prev) => {
                      const newCheckedItems = [...prev];
                      newCheckedItems[index] = e.target.checked;
                      return newCheckedItems;
                    })
                  }
                >
                  {label}
                </Checkbox>
              )
            )}
          </Stack>
        </Flex>
      )}
    </Flex>
  );
};

export default HeaderWeeks;
