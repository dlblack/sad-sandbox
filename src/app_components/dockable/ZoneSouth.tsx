import React from "react";
import { Box, Paper } from "@mantine/core";

type Props = { children: React.ReactNode; height: number };
export default function ZoneSouth({ children, height }: Props) {
    return (
        <Box className="dock-zone dock-zone-south" style={{ height }}>
            <Paper className="dock-zone-surface" radius="md" withBorder>{children}</Paper>
        </Box>
    );
}