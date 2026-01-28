import React, { useMemo } from "react";
import { Card, TextInput, NumberInput, ScrollArea, Table } from "@mantine/core";
import { generateDateTimeRows } from "../../../utils/timeUtils";
import TextStore from "../../../utils/TextStore";
import { useEditableTable } from "../../table/useEditableTable";
import TableContextMenu from "../../table/TableContextMenu";
import TableFillOptionsDialog from "../../../dialogs/TableFillOptionsDialog";

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
  setDataRows: React.Dispatch<React.SetStateAction<{ dateTime: string; value: string }[]>>;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  intervalOpt?: IntervalOption;
}

export default function TableSectionStep({
                                           dataRows,
                                           setDataRows,
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

  const rows = useMemo(
    () =>
      autoDateTimes.length > 0
        ? autoDateTimes.map((dt, i) => ({
          dateTime: dt,
          value: dataRows[i]?.value ?? "",
        }))
        : dataRows,
    [autoDateTimes, dataRows]
  );

  const readOnlyDates = autoDateTimes.length > 0;

  const columns = [
    { key: "dateTime", label: TextStore.interface("ManualDataEntryEditor_DateTime"), readOnly: readOnlyDates },
    { key: "value", label: TextStore.interface("ManualDataEntryEditor_Value") },
  ];

  const editor = useEditableTable({
    data: rows,
    onChange: setDataRows,
    columns,
    minRows: 0,
    skipRows: 0,
    enableContextMenu: true,
  });

  function handleRowChange(idx: number, field: "dateTime" | "value", value: string): void {
    setDataRows((prev) => {
      const updated = [...prev];
      if (!updated[idx]) updated[idx] = { dateTime: "", value: "" };
      updated[idx][field] = value;
      return updated;
    });
  }

  function handleValueChange(idx: number, value: string): void {
    if (/^-?\d*\.?\d*$/.test(value)) {
      handleRowChange(idx, "value", value);
    }
  }

  return (
    <Card withBorder radius="md" padding="xs">
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
              <Table.Th className="manual-entry-th">
                {TextStore.interface("ManualDataEntryEditor_DateTime")}
              </Table.Th>
              <Table.Th className="manual-entry-th">
                {TextStore.interface("ManualDataEntryEditor_Value")}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {rows.map((row, idx) => (
              <Table.Tr key={idx}>
                <Table.Td className="manual-entry-cell">
                  <TextInput
                    size="xs"
                    value={row.dateTime}
                    onChange={(e) => handleRowChange(idx, "dateTime", e.currentTarget.value)}
                    pattern="\\d{2}[A-Za-z]{3}\\d{4} \\d{2}:\\d{2}"
                    autoComplete="off"
                    readOnly={readOnlyDates}
                    tabIndex={readOnlyDates ? -1 : 0}
                  />
                </Table.Td>

                <Table.Td
                  className="manual-entry-cell"
                  onMouseDown={(e) => editor.handleMouseDown(idx, "value", e)}
                  onMouseEnter={() => editor.handleMouseEnter(idx, "value")}
                  onContextMenu={(e) => editor.openContextMenu(idx, "value", e)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: editor.isCellSelected(idx, "value") ? "#444" : "transparent",
                  }}
                >
                  <NumberInput
                    size="xs"
                    hideControls
                    inputMode="decimal"
                    value={row.value === "" ? "" : Number(row.value)}
                    onChange={(v) => handleValueChange(idx, v === "" || v == null ? "" : String(v))}
                    onPaste={(event) => {
                      event.preventDefault();
                      const text = event.clipboardData.getData("text");
                      editor.handlePaste(text, idx, "value");
                    }}
                    className={`manual-entry-input ${
                      editor.isCellSelected(idx, "value") ? "selected" : ""
                    }`}
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <TableContextMenu
        menuPos={editor.menuPos}
        onMouseLeave={editor.closeContextMenu}
        onCut={editor.handleCut}
        onCopy={editor.handleCopy}
        onPaste={editor.handlePasteFromMenu}
        onClear={editor.handleClear}
        onInsert={editor.handleInsert}
        onFill={editor.openFillDialog}
        onSelectAll={editor.handleSelectAll}
        onDeleteRows={editor.handleDeleteRows}
      />

      <TableFillOptionsDialog
        opened={editor.fillDialogOpen}
        onClose={() => editor.setFillDialogOpen(false)}
        onApply={editor.handleApplyFill}
      />
    </Card>
  );
}
