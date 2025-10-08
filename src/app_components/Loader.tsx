import React from "react";
import { Center, Loader as MantineLoader, Stack, Text } from "@mantine/core";

export interface LoaderProps {
    message?: string;
    size?: number | "xs" | "sm" | "md" | "lg" | "xl";
    color?: string;
    fullHeight?: boolean;
}

export default function Loader({
                                   message = "Loading…",
                                   size = "sm",
                                   color,
                                   fullHeight = true,
                               }: LoaderProps) {
    return (
        <Center
            style={{
                width: "100%",
                height: fullHeight ? "100%" : "auto",
                padding: fullHeight ? undefined : 12,
                minHeight: fullHeight ? 120 : undefined,
            }}
        >
            <Stack gap="xs" align="center">
                <MantineLoader size={size} color={color} />
                {message ? (
                    <Text size="xs" c="dimmed">
                        {message}
                    </Text>
                ) : null}
            </Stack>
        </Center>
    );
}
