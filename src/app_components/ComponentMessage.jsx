import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Tabs, Text } from "@mantine/core";

const typeToColor = {
  info: "blue",
  success: "teal",
  warning: "yellow",
  error: "red",
};

export default function ComponentMessage({ messages = [], onRemove }) {
  const [tab, setTab] = useState("all");
  const bottomRef = useRef(null);

  const filtered = useMemo(() => {
    if (tab === "all") return messages;
    const t = tab.toLowerCase();
    return messages.filter((m) => (m.type || "info").toLowerCase() === t);
  }, [messages, tab]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filtered.length, tab]);

  return (
    <Card
      withBorder
      radius="md"
      padding={0}
      style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          borderBottom: "1px solid #333",
        }}
      >
        <Text size="sm" fw={600}>Messages</Text>

        <Tabs value={tab} onChange={setTab} keepMounted={false} variant="outline" radius="sm">
          <Tabs.List>
            <Tabs.Tab value="all">All</Tabs.Tab>
            <Tabs.Tab value="info">Info</Tabs.Tab>
            <Tabs.Tab value="success">Success</Tabs.Tab>
            <Tabs.Tab value="warning">Warning</Tabs.Tab>
            <Tabs.Tab value="error">Error</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <span
          role="button"
          tabIndex={0}
          onClick={onRemove}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onRemove?.();
            }
          }}
          title="Close"
          aria-label="Close"
          style={{
            marginLeft: "auto",
            background: "transparent",
            color: "#aaa",
            cursor: "pointer",
            width: 22,
            height: 22,
            lineHeight: 1,
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}
        >
          ×
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((msg, i) => {
            const color = typeToColor[msg.type || "info"] || "blue";
            return (
              <Card
                key={i}
                radius="sm"
                padding="xs"
                withBorder
                style={{
                  borderColor: `var(--mantine-color-${color}-6)`,
                  background: `var(--mantine-color-${color}-0)`,
                }}
              >
                <Text size="xs" style={{ color: `var(--mantine-color-${color}-9)` }}>
                  {msg.text}
                </Text>
              </Card>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </Card>
  );
}
