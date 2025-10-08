import React from "react";
import { Stack, Button, ScrollArea, Divider, Text } from "@mantine/core";

export default function WizardLayoutSidebar({
                                                steps = [],
                                                active = 0,
                                                onStepClick,
                                                footer,
                                                children,
                                            }: {
    steps?: Array<{ label: string }>;
    active?: number;
    onStepClick?: (index: number) => void;
    footer?: React.ReactNode;
    children?: React.ReactNode;
}) {
    const railWidth = 240;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `${railWidth}px 1fr`,
                gap: 16,
                minHeight: 0,
                height: "100%",
            }}
        >
            {/* Sidebar rail */}
            <aside
                aria-label="Wizard steps"
                style={{
                    borderRight: "1px solid var(--mantine-color-default-border)",
                    padding: 12,
                    minWidth: railWidth,
                    overflow: "hidden",
                }}
            >
                <ScrollArea style={{ height: "100%" }} type="auto">
                    <Stack gap="xs">
                        {steps.map((s, i) => {
                            const state: "done" | "current" | "todo" =
                                i < active ? "done" : i === active ? "current" : "todo";
                            const clickable = Boolean(onStepClick) && i <= active;

                            return (
                                <Button
                                    key={i}
                                    fullWidth
                                    variant={state === "current" ? "filled" : "subtle"}
                                    color={state === "done" ? "teal" : "blue"}
                                    onClick={clickable ? () => onStepClick?.(i) : undefined}
                                    disabled={!clickable}
                                    aria-current={state === "current" ? "step" : undefined}
                                    justify="flex-start"
                                >
                                    <Text
                                        size="sm"
                                        fw={state === "current" ? 600 : 500}
                                        style={{
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            width: "100%",
                                            textAlign: "left",
                                        }}
                                    >
                                        {s.label}
                                    </Text>
                                </Button>
                            );
                        })}
                    </Stack>
                </ScrollArea>
            </aside>

            {/* Main content */}
            <section style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div style={{ flex: 1, minHeight: 0, padding: 12 }}>{children}</div>
                {footer ? (
                    <>
                        <Divider />
                        <div style={{ padding: 8 }}>{footer}</div>
                    </>
                ) : null}
            </section>
        </div>
    );
}
