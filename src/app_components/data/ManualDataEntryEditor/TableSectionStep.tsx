import React, { useMemo } from "react";
import { Card, TextInput, NumberInput, ScrollArea, Table } from "@mantine/core";
import { generateDateTimeRows } from "../../../utils/timeUtils";

export type IntervalUnit = "minute" | "hour" | "day" | "week" | "month" | "year";

export type IntervalOption = {
    value: string;
    label?: string;
    amount: number;
    unit: IntervalUnit;
    [key: string]: unknown;
};

export interface TableSectionStepProps {
    dataRows: { dateTime: string; value: string }[];
    handleRowChange: (idx: number, field: "dateTime" | "value", value: string) => void;
    handleValueChange: (idx: number, value: string) => void;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    intervalOpt?: IntervalOption;
}

export default function TableSectionStep({
                                             dataRows,
                                             handleRowChange,
                                             handleValueChange,
                                             startDate,
                                             startTime,
                                             endDate,
                                             endTime,
                                             intervalOpt,
                                         }: TableSectionStepProps) {
    const autoDateTimes = useMemo(() => {
        if (startDate && startTime && endDate && endTime && intervalOpt) {
            return generateDateTimeRows(startDate, startTime, endDate, endTime, {
                amount: intervalOpt.amount,
                unit: intervalOpt.unit,
            });
        }
        return [];
    }, [startDate, startTime, endDate, endTime, intervalOpt?.amount, intervalOpt?.unit]);

    const rows =
        autoDateTimes.length > 0
            ? autoDateTimes.map((dt, i) => ({
                dateTime: dt,
                value: dataRows[i]?.value ?? "",
            }))
            : dataRows;

    const readOnlyDates = autoDateTimes.length > 0;

    return (
        <Card withBorder radius="md" padding="xs" className={"editor-card"}>
            <ScrollArea
                className="editor-scroll"
                type="always"
                scrollbars="y"
                offsetScrollbars
                scrollbarSize={12}
            >
            <Table
                layout="fixed"
                withRowBorders
                verticalSpacing="xs"
                horizontalSpacing="sm"
                className="manual-entry-table"
            >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th className="manual-entry-th">Date Time</Table.Th>
                        <Table.Th className="manual-entry-th">Value</Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {rows.map((row, idx) => (
                        <Table.Tr key={idx}>
                            <Table.Td>
                                <TextInput
                                    size="xs"
                                    value={row.dateTime}
                                    onChange={(e) => handleRowChange(idx, "dateTime", e.currentTarget.value)}
                                    pattern="\\d{2}[A-Za-z]{3}\\d{4} \\d{2}:\\d{2}"
                                    autoComplete="off"
                                    readOnly={readOnlyDates}
                                    tabIndex={readOnlyDates ? -1 : 0}
                                    className="manual-entry-input"
                                />
                            </Table.Td>
                            <Table.Td>
                                <NumberInput
                                    size="xs"
                                    hideControls
                                    inputMode="decimal"
                                    value={row.value === "" ? "" : Number(row.value)}
                                    onChange={(v) => handleValueChange(idx, v === "" || v == null ? "" : String(v))}
                                    className="manual-entry-input"
                                />
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            </ScrollArea>
        </Card>
    );
}
