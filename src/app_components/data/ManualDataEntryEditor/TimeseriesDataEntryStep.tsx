import React, { useEffect, useMemo } from "react";
import TableSectionStep, { IntervalOption } from "./TableSectionStep";
import { INTERVAL_OPTIONS } from "../../editor_components/combo_boxes/DataIntervalComboBox";
import { generateDateTimeRows, IntervalUnit } from "../../../utils/timeUtils";
import { TextStore } from "../../../utils/TextStore";
import { Text } from "@mantine/core";

type DataRow = { dateTime: string; value: string };

export interface TimeseriesDataEntryStepProps {
  dataRows: DataRow[];
  setDataRows: React.Dispatch<React.SetStateAction<DataRow[]>>;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  dataInterval?: string;
}

function updateDataRowsWithValues(autoDateTimes: string[], dataRows: DataRow[]): DataRow[] {
  return autoDateTimes.map((dt, i) => ({
    dateTime: dt,
    value: dataRows[i]?.value ?? "",
  }));
}

export default function TimeseriesDataEntryStep({
                                                  dataRows,
                                                  setDataRows,
                                                  startDate,
                                                  startTime,
                                                  endDate,
                                                  endTime,
                                                  dataInterval,
                                                }: TimeseriesDataEntryStepProps) {
  // Find the raw option from the shared INTERVAL_OPTIONS
  const rawInterval = useMemo(
    () => INTERVAL_OPTIONS.find((opt: any) => opt.value === dataInterval),
    [dataInterval]
  );

  // Adapt to TableSectionStep.IntervalOption type (only include properties that exist there)
  const intervalOpt: IntervalOption | undefined = useMemo(() => {
    if (!rawInterval) return undefined;
    const unit = (rawInterval.unit as string) as IntervalUnit;
    return {
      value: rawInterval.value,
      amount: rawInterval.amount,
      unit,
    };
  }, [rawInterval]);

  const autoDateTimes = useMemo<string[]>(() => {
    if (startDate && startTime && endDate && endTime && intervalOpt) {
      return generateDateTimeRows(startDate, startTime, endDate, endTime, intervalOpt);
    }
    return [];
  }, [startDate, startTime, endDate, endTime, intervalOpt]);

  useEffect(() => {
    if (autoDateTimes.length > 0) {
      setDataRows((rows) => updateDataRowsWithValues(autoDateTimes, rows));
    }
  }, [autoDateTimes, setDataRows]);

  function handleRowChange(idx: number, field: keyof DataRow, value: string): void {
    setDataRows((rows) => {
      const updated = [...rows];
      if (!updated[idx]) updated[idx] = { dateTime: "", value: "" };
      updated[idx][field] = value;
      return updated;
    });
  }

  function handleValueChange(idx: number, value: string): void {
    if (/^-?\d*\.?\d*$/.test(value)) {
      handleRowChange(idx, "value", value);
    }
    // else ignore non-numeric input to keep the cell clean
  }

  function handleInsertRows(indices: number[]): void {
    setDataRows((prev) => {
      const result = [...prev];
      const sortedIndices = [...indices].sort((a, b) => b - a);

      sortedIndices.forEach((idx) => {
        result.splice(idx, 0, { dateTime: "", value: "" });
      });

      return result;
    });
  }

  function handleDeleteRows(indices: number[]): void {
    setDataRows((prev) => {
      const result = prev.filter((_, idx) => !indices.includes(idx));
      return result.length > 0 ? result : [{ dateTime: "", value: "" }];
    });
  }

  return (
    <div className={"summary-root"}>
      <Text size="xs" c="dimmed" mb="xs">
        {autoDateTimes.length
          ? TextStore.interface("ManualDataEntryEditor_DateTimeAutoFilled")
          : TextStore.interface("ManualDataEntryEditor_DateTimeManual")}
      </Text>

      <TableSectionStep
        dataRows={dataRows}
        handleRowChange={handleRowChange}
        handleValueChange={handleValueChange}
        startDate={startDate}
        startTime={startTime}
        endDate={endDate}
        endTime={endTime}
        intervalOpt={intervalOpt}
        onInsertRows={handleInsertRows}
        onDeleteRows={handleDeleteRows}
      />
    </div>
  );
}
