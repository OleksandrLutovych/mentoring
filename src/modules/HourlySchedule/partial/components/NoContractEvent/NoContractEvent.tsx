import { MouseEventHandler } from "react";

import { useTranslation } from "react-i18next";

import { Box, Flex, Text } from "@chakra-ui/react";

type Props = {
  id: number | string;
  left: number;
  width: number;
  isHovered: boolean;
  handleEventVisibility: MouseEventHandler<HTMLDivElement>;
};

const NoContractEvent = ({
  left,
  width,
  isHovered,
  handleEventVisibility,
}: Props) => {
  const { t } = useTranslation();
  return (
    <Flex
      position="absolute"
      left={`${left}px`}
      zIndex={isHovered ? 1 : 2}
      h="34px"
      bgColor={isHovered ? "gray.400" : "red.400"}
      opacity={isHovered ? 0.8 : 1}
      width={`${width}px`}
      flexDir="column"
      overflow="hidden"
      pt={2.5}
      px={2}
      fontWeight={700}
      fontSize={10}
      justifyContent={"space-between"}
      flexDirection={"row"}
      fontStyle={"italic"}
      cursor={"pointer"}
      onClick={handleEventVisibility}
    >
      {Array.from({ length: width / 300 }, (_, i) => (
        <Box key={i + 1} h="2px">
          {!isHovered && <Text>{t("schedule:events.noContract")}</Text>}
        </Box>
      ))}
    </Flex>
  );
};

export default NoContractEvent;
