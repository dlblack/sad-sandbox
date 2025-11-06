import React from "react";
import { Box, Paper } from "@mantine/core";

type Props = { children: React.ReactNode; width: number };
export default function ZoneWest({ children, width }: Props) {
  return (
    <Box className="dock-zone dock-zone-west" style={{ width }}>
      <Paper className="dock-zone-surface" radius="md" withBorder>{children}</Paper>
    </Box>
  );
}
