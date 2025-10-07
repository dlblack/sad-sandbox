import React, { useMemo } from "react";
import { Card, TextInput, NumberInput } from "@mantine/core";
import { generateDateTimeRows } from "../../../utils/timeUtils";

export type IntervalUnit = "minute" | "hour" | "day" | "week" | "month" | "year";

export type IntervalOption = {
    value: string;
    label?: string;
    amount: number;
    unit: IntervalUnit;
    // allow extra fields
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

/**
 * TableSectionStep
 * If all start/end/interval are present, auto-fill left column.
 * If not, let user enter dates manually.
 */
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
    }, [
        startDate,
        startTime,
        endDate,
        endTime,
        intervalOpt?.amount,
        intervalOpt?.unit,
    ]);

    const rows =
        autoDateTimes.length > 0
            ? autoDateTimes.map((dt, i) => ({
                dateTime: dt,
                value: dataRows[i]?.value ?? "",
            }))
            : dataRows;

    return (
        <Card withBorder radius="md" padding="xs" className="manual-entry-table-panel">
            <table className="manual-entry-table table table-sm table-striped compact-table">
                <thead>
                <tr>
                    <th className="manual-entry-th">Date Time</th>
                    <th className="manual-entry-th">Value</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx}>
                        <td>
                            <TextInput
                                size="xs"
                                value={row.dateTime}
                                onChange={(e) => handleRowChange(idx, "dateTime", e.currentTarget.value)}
                                pattern="\\d{2}[A-Za-z]{3}\\d{4} \\d{2}:\\d{2}"
                                autoComplete="off"
                                readOnly={autoDateTimes.length > 0}
                                tabIndex={-1}
                                className="manual-entry-input"
                            />
                        </td>
                        <td>
                            <NumberInput
                                size="xs"
                                hideControls
                                inputMode="decimal"
                                value={row.value === "" ? "" : Number(row.value)}
                                onChange={(v) => handleValueChange(idx, v === "" || v == null ? "" : String(v))}
                                className="manual-entry-input"
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </Card>
    );
}
