import { Virtualizer } from "@tanstack/react-virtual";

import { Box } from "@chakra-ui/react";

type Props = {
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
  height: number;
};

const Columns = ({ columnVirtualizer, height }: Props) => {
  return (
    <Box className="columns" width={`${columnVirtualizer.getTotalSize()}px`}>
      {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
        <Box
          key={virtualColumn.key}
          position={"absolute"}
          top={0}
          left={`${virtualColumn.start}px`}
          width={`${virtualColumn.size}px`}
          height={`${height}px`}
          borderLeft={"1px solid #bbb"}
          borderBottom={"1px solid #bbb"}
          zIndex={1}
          opacity={0.5}
        />
      ))}
    </Box>
  );
};

export default Columns;
