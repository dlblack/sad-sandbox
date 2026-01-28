import React, { useMemo, useState, useCallback } from "react";
import { Card, TextInput, NumberInput, ScrollArea, Table } from "@mantine/core";
import { generateDateTimeRows } from "../../../utils/timeUtils";
import TextStore from "../../../utils/TextStore";
import TableFillOptionsDialog from "../../../dialogs/TableFillOptionsDialog";
import {
  getSelectedIndices,
  isCellSelected,
  parseClipboard
} from "../../table/tableSectionUtils";
import TableContextMenu from "../../table/TableContextMenu";
import { useGlobalMouseUp } from "../../table/useGlobalMouseUp";
import { applyTableFill, TableFillMode } from "../../../utils/tableFillUtils";
import {logSilentError} from "../../../utils/logSilentError";

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

  // optional, for true row insertion/deletion if the parent supports it
  onInsertRows?: (indices: number[]) => void;
  onDeleteRows?: (indices: number[]) => void;
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
                                           onInsertRows,
                                           onDeleteRows,
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

  const [selection, setSelection] = useState<{ startIdx: number | null; endIdx: number | null }>({
    startIdx: null,
    endIdx: null,
  });
  const [isMouseDown, setIsMouseDown] = useState(false);

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  const [fillDialogOpen, setFillDialogOpen] = useState(false);

  const handleGlobalMouseUpDone = useCallback(() => {
    setIsMouseDown(false);
    setSelection((prev) => ({
      ...prev,
      endIdx: prev.endIdx ?? prev.startIdx,
    }));
  }, []);

  useGlobalMouseUp(isMouseDown, handleGlobalMouseUpDone);

  function handleMouseDown(idx: number, event: React.MouseEvent) {
    if (event.button !== 0) return;
    setIsMouseDown(true);

    if (event.shiftKey && selection.startIdx !== null) {
      const endIdx = idx;
      setSelection((prev) => ({
        ...prev,
        endIdx,
      }));
    } else {
      setSelection({
        startIdx: idx,
        endIdx: idx,
      });
    }
  }

  function handleMouseEnter(idx: number) {
    if (!isMouseDown) return;
    setSelection((prev) => ({
      ...prev,
      endIdx: idx,
    }));
  }

  function handlePasteIntoRows(text: string, startIdx: number) {
    const lines = parseClipboard(text);

    lines.forEach((line, lineIndex) => {
      const targetRowIndex = startIdx + lineIndex;
      if (!rows[targetRowIndex]) return;
      const firstCell = line.split(/\t/)[0].trim();
      if (firstCell.length === 0) return;
      handleValueChange(targetRowIndex, firstCell);
    });
  }

  function handlePaste(event: React.ClipboardEvent, startIdx: number) {
    event.preventDefault();
    const clipboardText = event.clipboardData.getData("text");
    handlePasteIntoRows(clipboardText, startIdx);
  }

  function handleClearValues() {
    rows.forEach((_, idx) => {
      handleValueChange(idx, "");
    });
  }

  // ---------- context menu actions ----------
  function openContextMenu(idx: number, e: React.MouseEvent) {
    e.preventDefault();

    if (!isCellSelected(idx, selection.startIdx, selection.endIdx)) {
      setSelection({ startIdx: idx, endIdx: idx });
    }

    setMenuPos({ x: e.clientX, y: e.clientY });
  }

  function closeContextMenu() {
    setMenuPos(null);
  }

  async function handleCut() {
    const indices = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    if (!indices.length) return;
    const lines = indices.map((i) => rows[i].value ?? "");
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch (err) {
      logSilentError(err, "Failed to write clipboard");
    }
    indices.forEach((i) => handleValueChange(i, ""));
    closeContextMenu();
  }

  async function handleCopy() {
    const indices = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    if (!indices.length) return;
    const lines = indices.map((i) => rows[i].value ?? "");
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch (err) {
      logSilentError(err, "Failed to copy clipboard");
    }
    closeContextMenu();
  }

  async function handlePasteFromMenu() {
    const indices = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    const startIdx = indices.length ? indices[0] : 0;
    try {
      const text = await navigator.clipboard.readText();
      handlePasteIntoRows(text, startIdx);
    } catch (err) {
      logSilentError(err, "Failed to paste clipboard");
    }
    closeContextMenu();
  }

  function handleClearFromMenu() {
    handleClearValues();
    closeContextMenu();
  }

  function handleSelectAll() {
    if (!rows.length) return;
    setSelection({
      startIdx: 0,
      endIdx: rows.length - 1,
    });
    closeContextMenu();
  }

  function handleInsert() {
    const indices = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    if (!indices.length) return;

    const sortedIndices = [...indices].sort((a, b) => b - a);

    sortedIndices.forEach((idx) => {
      const newRows = dataRows.slice();
      newRows.splice(idx, 0, { dateTime: "", value: "" });

      newRows.forEach((row, i) => {
        if (i >= idx) {
          handleRowChange(i, "dateTime", row.dateTime);
          handleRowChange(i, "value", row.value);
        }
      });
    });

    closeContextMenu();
  }

  function handleDeleteRows() {
    const indices = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    if (!indices.length) return;

    if (onDeleteRows) {
      onDeleteRows(indices);
    } else {
      indices.forEach((i) => handleValueChange(i, ""));
    }

    closeContextMenu();
  }

  function openFillDialog() {
    setFillDialogOpen(true);
    closeContextMenu();
  }

  function handleApplyFill(mode: TableFillMode, constant?: number) {
    const indices = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    if (!indices.length) {
      setFillDialogOpen(false);
      return;
    }

    const currentValues = rows.map((r) => r.value);
    const nextValues = applyTableFill(currentValues, indices, {
      mode,
      constant,
    });

    nextValues.forEach((v, i) => {
      if (v !== currentValues[i]) {
        handleValueChange(i, v);
      }
    });

    setFillDialogOpen(false);
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
                    onChange={(e) =>
                      handleRowChange(idx, "dateTime", e.currentTarget.value)
                    }
                    pattern="\\d{2}[A-Za-z]{3}\\d{4} \\d{2}:\\d{2}"
                    autoComplete="off"
                    readOnly={readOnlyDates}
                    tabIndex={readOnlyDates ? -1 : 0}
                  />
                </Table.Td>

                <Table.Td
                  className="manual-entry-cell"
                  onMouseDown={(e) => handleMouseDown(idx, e)}
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onContextMenu={(e) => openContextMenu(idx, e)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: isCellSelected(idx, selection.startIdx, selection.endIdx)
                      ? "#444"
                      : "transparent",
                  }}
                >
                  <NumberInput
                    size="xs"
                    hideControls
                    inputMode="decimal"
                    value={row.value === "" ? "" : Number(row.value)}
                    onChange={(v) =>
                      handleValueChange(
                        idx,
                        v === "" || v == null ? "" : String(v)
                      )
                    }
                    onPaste={(event) => handlePaste(event, idx)}
                    className={`manual-entry-input ${
                      isCellSelected(idx, selection.startIdx, selection.endIdx) ? "selected" : ""
                    }`}
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <TableContextMenu
        menuPos={menuPos}
        onMouseLeave={closeContextMenu}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePasteFromMenu}
        onClear={handleClearFromMenu}
        onFill={openFillDialog}
        onSelectAll={handleSelectAll}
        onInsert={handleInsert}
        onDeleteRows={handleDeleteRows}
      />

      <TableFillOptionsDialog
        opened={fillDialogOpen}
        onClose={() => setFillDialogOpen(false)}
        onApply={handleApplyFill}
      />
    </Card>
  );
}
