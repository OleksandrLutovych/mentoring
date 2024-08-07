import { VscSettings } from "react-icons/vsc";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";

import { SearchBox } from "components/data-table/header";
import { useHourlySchedule } from "components/schedules/HourlySchedule/utils/useHourlySchedule";

const Filters = () => {
  const { onSearch, searchPhrase, isNoContractShow, toggleNoContractVisible } =
    useHourlySchedule();

  return (
    <Flex my={3} justifyContent={"space-between"}>
      <SearchBox
        label={"Imię, nazwisko"}
        searchPhrase={searchPhrase}
        onSearch={onSearch}
        focus={false}
      />

      <Box>
        <Popover placement="bottom-start">
          <PopoverTrigger>
            <Button leftIcon={<VscSettings />} variant={"outline"}>
              Filtry
            </Button>
          </PopoverTrigger>

          <PopoverContent>
            <PopoverArrow />

            <PopoverCloseButton />

            <PopoverBody my={5}>
              <Flex
                alignContent="space-between"
                justifyContent={"space-between"}
                flexDir={"column"}
                gap={5}
              >
                <Checkbox
                  checked={isNoContractShow}
                  onChange={toggleNoContractVisible}
                >
                  Wyświetl brak umow
                </Checkbox>
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    </Flex>
  );
};

export default Filters;
