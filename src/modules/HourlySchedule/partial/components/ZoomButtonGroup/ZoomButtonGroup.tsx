import { useTranslation } from "react-i18next";
import { TiPlus as ZoomInIcon, TiMinus as ZoomOutIcon } from "react-icons/ti";

import { Box, Divider, Flex, IconButton, Tooltip } from "@chakra-ui/react";

type Props = {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
};

const ZoomButtonGroup = ({ handleZoomIn, handleZoomOut }: Props) => {
  const { t } = useTranslation();
  return (
    <Box position="absolute" zIndex={20} top={1} left={1.5}>
      <Tooltip label={t("schedule:additional.scale")} hasArrow>
        <Flex borderBottom="1px solid #bbb" pb={1}>
          <IconButton
            aria-label="Zoom in"
            icon={<ZoomInIcon color="white" />}
            _hover={{ bgColor: "blue.500" }}
            _active={{ bgColor: "blue.500" }}
            onClick={handleZoomIn}
            bgColor="#3d6fae"
            borderRadius={0}
            size="sm"
          />
          <Divider orientation="vertical" borderColor="#bbb" h={8} />
          <IconButton
            aria-label="Zoom out"
            icon={<ZoomOutIcon color="white" />}
            _hover={{ bgColor: "blue.500" }}
            _active={{ bgColor: "blue.500" }}
            bgColor="#3d6fae"
            onClick={handleZoomOut}
            borderRadius={0}
            size="sm"
          />
        </Flex>
      </Tooltip>
    </Box>
  );
};

export default ZoomButtonGroup;
