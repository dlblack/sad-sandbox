import React, { useEffect, useMemo, useState } from "react";
import { normalizeTimeInput } from "../../utils/timeUtils";
import { ActionIcon, Popover, TextInput, ScrollArea, Group, Text, rem } from "@mantine/core";
import type { TextInputProps } from "@mantine/core";

export type TimeValue = string;

// NOTE: Use Mantine's TextInputProps, not native input props.
// Omit the props we control ourselves.
export interface TimeFieldProps
    extends Omit<TextInputProps, "value" | "defaultValue" | "onChange" | "rightSection"> {
    value?: TimeValue;
    defaultValue?: TimeValue;
    onValueChange?: (value: TimeValue) => void;
    minuteStep?: number;
}

/** Inline, scalable clock icon (uses 1em so it follows font-size/UI scale) */
function ClockIcon({ stroke = 1.75 }: { stroke?: number }) {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="8" cy="8" r="6.25" />
            <path d="M8 4.5v3l2 1.25" />
        </svg>
    );
}

export default function TimeField({
                                      value,
                                      defaultValue = "",
                                      onValueChange,
                                      minuteStep = 1,
                                      placeholder = "HH:MM",
                                      id,
                                      name,
                                      disabled,
                                      required,
                                      ...rest
                                  }: TimeFieldProps) {
    const isControlled = value != null;
    const [raw, setRaw] = useState<string>(value ?? defaultValue ?? "");
    const [opened, setOpened] = useState(false);

    useEffect(() => {
        if (isControlled) setRaw(value as string);
    }, [isControlled, value]);

    const commit = (v: string) => {
        const norm = normalizeTimeInput(v);
        if (!isControlled) setRaw(norm);
        onValueChange?.(norm);
    };

    const curH = Math.max(0, Math.min(23, parseInt(raw.slice(0, 2), 10) || 0));
    const curM = Math.max(0, Math.min(59, parseInt(raw.slice(3, 5), 10) || 0));

    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")), []);
    const minutes = useMemo(
        () => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => String(i * minuteStep).padStart(2, "0")),
        [minuteStep]
    );

    const pickHour = (hr: string) => {
        const next = `${hr}:${String(curM).padStart(2, "0")}`;
        setRaw(next);                 // keep input in sync
        onValueChange?.(next);
    };

    const pickMinute = (mn: string) => {
        const next = `${String(curH).padStart(2, "0")}:${mn}`;
        setRaw(next);                 // keep input in sync
        onValueChange?.(next);
        setOpened(false);
    };

    return (
        <Popover opened={opened} onChange={setOpened} withArrow position="bottom-end" trapFocus={false}>
            <Popover.Target>
                <TextInput
                    id={id}
                    name={name}
                    disabled={disabled}
                    required={required}
                    value={raw}
                    placeholder={placeholder}
                    inputMode="numeric"
                    pattern="([01]\\d|2[0-3]):[0-5]\\d"
                    rightSectionWidth={36}
                    rightSectionPointerEvents="auto"
                    rightSection={
                        <ActionIcon
                            variant="transparent"
                            color="gray"
                            size="sm"
                            radius="sm"
                            aria-label="Pick time"
                            onClick={() => setOpened(v => !v)}
                            disabled={disabled}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ClockIcon stroke={2} />
                        </ActionIcon>
                    }
                    onChange={(e) => setRaw(e.currentTarget.value)}
                    onBlur={(e) => commit(e.currentTarget.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            commit((e.target as HTMLInputElement).value);
                            setOpened(false);
                        } else if (e.key === "Escape") {
                            setOpened(false);
                        }
                    }}
                    {...rest}
                />
            </Popover.Target>

            <Popover.Dropdown p="xs" style={{ minWidth: rem(220) }}>
                <Group gap="sm" align="start" wrap="nowrap">
                    <div style={{ width: rem(96) }}>
                        <Text size="xs" c="dimmed" ta="center" mb={4}>Hours</Text>
                        <ScrollArea.Autosize mah={180} type="auto">
                            {/* ✅ one column */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6, padding: 2 }}>
                                {hours.map((hr) => {
                                    const active = hr === String(curH).padStart(2, "0");
                                    return (
                                        <button
                                            key={hr}
                                            type="button"
                                            onClick={() => pickHour(hr)}
                                            className={`tf-item${active ? " is-active" : ""}`}
                                            style={itemStyle}
                                        >
                                            {hr}
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea.Autosize>
                    </div>

                    <div style={{ width: rem(96) }}>
                        <Text size="xs" c="dimmed" ta="center" mb={4}>Minutes</Text>
                        <ScrollArea.Autosize mah={180} type="auto">
                            {/* ✅ one column */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6, padding: 2 }}>
                                {minutes.map((mn) => {
                                    const active = mn === String(curM).padStart(2, "0");
                                    return (
                                        <button
                                            key={mn}
                                            type="button"
                                            onClick={() => pickMinute(mn)}
                                            className={`tf-item${active ? " is-active" : ""}`}
                                            style={itemStyle}
                                        >
                                            {mn}
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea.Autosize>
                    </div>
                </Group>

                <style>{`
          .tf-item {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;               /* better in single-column layout */
            height: 1.9rem;
            border-radius: 6px;
            border: 1px solid transparent;
            background: transparent;
            cursor: pointer;
            font: inherit;
            color: inherit;
          }
          .tf-item:hover { border-color: var(--mantine-color-primary-6, #5c7cfa); }
          .tf-item.is-active {
            background: var(--mantine-color-primary-6, #5c7cfa);
            color: var(--mantine-color-white, #fff);
          }
        `}</style>
            </Popover.Dropdown>
        </Popover>
    );
}

const itemStyle: React.CSSProperties = {
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
};
