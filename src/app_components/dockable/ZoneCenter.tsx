import React from "react";
import { Box, Paper } from "@mantine/core";

type Props = { children: React.ReactNode };
export default function ZoneCenter({ children }: Props) {
    return (
        <Box className="dock-zone dock-zone-center">
            <Paper className="dock-zone-surface" radius="md" withBorder>{children}</Paper>
        </Box>
    );
}