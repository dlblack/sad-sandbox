import React from "react";
import { Stack, Button, ScrollArea, Divider, Text } from "@mantine/core";

/**
 * WizardLayoutSidebar (text-only)
 * props:
 * - steps:        [{ label: string }]
 * - active:       number (0-based)
 * - onStepClick?: (index: number) => void
 *
 * - footer?:      ReactNode
 * - children:     ReactNode
 */
export default function WizardLayoutSidebar({
                                              steps = [],
                                              active = 0,
                                              onStepClick,
                                              footer,
                                              children,
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
        <ScrollArea style={{height: "100%"}} type="auto">
          <Stack gap="xs">
            {steps.map((s, i) => {
              const state = i < active ? "done" : i === active ? "current" : "todo";
              const clickable = !!onStepClick && i <= active;
              return (
                <Button
                  key={i}
                  fullWidth
                  variant={state === "current" ? "filled" : "subtle"}
                  color={state === "done" ? "teal" : "blue"}
                  onClick={clickable ? () => onStepClick(i) : undefined}
                  disabled={!clickable}
                  aria-current={state === "current" ? "step" : undefined}
                  justify="flex-start"
                  styles={{
                    label: {whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"},
                  }}
                >
                  <Text size="sm" fw={state === "current" ? 600 : 500}>
                    {s.label}
                  </Text>
                </Button>
              );
            })}
          </Stack>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <section style={{display: "flex", flexDirection: "column", minWidth: 0}}>
        <div style={{flex: 1, minHeight: 0, padding: 12}}>{children}</div>
        {footer ? (
          <>
            <Divider/>
            <div style={{padding: 8}}>{footer}</div>
          </>
        ) : null}
      </section>
    </div>
  );
}
