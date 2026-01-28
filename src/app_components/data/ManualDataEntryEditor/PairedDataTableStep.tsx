import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Table,
  NumberInput,
  Select,
  Text,
  ScrollArea,
} from "@mantine/core";
import TextStore from "../../../utils/TextStore";
import TableFillOptionsDialog from "../../../dialogs/TableFillOptionsDialog";
import { getSelectedIndices, parseClipboard } from "../../table/tableSectionUtils";
import { applyTableFill, TableFillMode } from "../../../utils/tableFillUtils";
import TableContextMenu from "../../table/TableContextMenu";
import { useGlobalMouseUp } from "../../table/useGlobalMouseUp";
import { logSilentError } from "../../../utils/logSilentError";

type Row = { x: string; y: string };

export interface PairedDataTableStepProps {
  rows: Row[];
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  yLabel?: string;
  yUnits?: string;
  xLabel?: string;
  xUnits?: string;
}

function ensureMinRows(rows: Row[], minLength = 8): Row[] {
  const next = [...rows];
  while (next.length < minLength) next.push({ x: "", y: "" });
  return next;
}

type SelectedField = keyof Row | null;

interface SelectionState {
  startIdx: number | null;
  endIdx: number | null;
  field: SelectedField;
}

export default function PairedDataTableStep({
                                              rows,
                                              setRows,
                                              yLabel,
                                              yUnits,
                                              xLabel,
                                              xUnits,
                                            }: PairedDataTableStepProps) {
  useEffect(() => {
    if (rows.length < 8) setRows((r) => ensureMinRows(r, 8));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCellChange(idx: number, field: keyof Row, value: string) {
    setRows((prev) => {
      const updated = [...prev];
      if (!updated[idx]) updated[idx] = { x: "", y: "" };
      updated[idx][field] = value;

      // If user typed in the last visible row, grow by one
      if (
        idx === prev.length - 1 &&
        idx >= 3 &&
        (updated[idx].x !== "" || updated[idx].y !== "")
      ) {
        return ensureMinRows(updated, prev.length + 1);
      }
      return updated;
    });
  }

  const ordinals = Array.from({ length: 50 }, (_, i) => String(i + 1));

  // ---------- selection + context menu state ----------
  const [selection, setSelection] = useState<SelectionState>({
    startIdx: null,
    endIdx: null,
    field: null,
  });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [fillDialogOpen, setFillDialogOpen] = useState(false);
  const [activeField, setActiveField] = useState<keyof Row>("x");

  const handleGlobalMouseUpDone = useCallback(() => {
    setIsMouseDown(false);
    setSelection((prev) => ({
      ...prev,
      endIdx: prev.endIdx ?? prev.startIdx,
    }));
  }, []);

  useGlobalMouseUp(isMouseDown, handleGlobalMouseUpDone);

  function isCellSelectedForField(idx: number, field: keyof Row): boolean {
    const { startIdx, endIdx, field: selField } = selection;
    if (selField !== field) return false;
    if (startIdx == null || endIdx == null) return false;
    const from = Math.min(startIdx, endIdx);
    const to = Math.max(startIdx, endIdx);
    return idx >= from && idx <= to;
  }

  function handleMouseDownCell(
      idx: number,
      field: keyof Row,
      event: React.MouseEvent
  ) {
    if (event.button !== 0) return;
    setIsMouseDown(true);

    if (event.shiftKey && selection.startIdx !== null && selection.field === field) {
      const endIdx = idx;
      setSelection((prev) => ({
        ...prev,
        endIdx,
      }));
    } else {
      setSelection({
        startIdx: idx,
        endIdx: idx,
        field,
      });
    }
  }

  function handleMouseEnterCell(idx: number, field: keyof Row) {
    if (!isMouseDown) return;
    if (selection.field !== field) return;
    setSelection((prev) => ({
      ...prev,
      endIdx: idx,
    }));
  }

  function handlePasteIntoRows(text: string, startIdx: number, field: keyof Row) {
    const lines = parseClipboard(text);

    lines.forEach((line, lineIndex) => {
      const targetRowIndex = startIdx + lineIndex;
      // Data rows only (index >= 2)
      if (targetRowIndex < 2) return;
      if (!rows[targetRowIndex]) return;

      const firstCell = line.split(/\t/)[0].trim();
      if (firstCell.length === 0) return;

      handleCellChange(targetRowIndex, field, firstCell);
    });
  }

  function handlePaste(
    event: React.ClipboardEvent,
    startIdx: number,
    field: keyof Row
  ) {
    event.preventDefault();
    const clipboardText = event.clipboardData.getData("text");
    handlePasteIntoRows(clipboardText, startIdx, field);
  }

  function handleClearValues() {
    setRows((prev) => {
      const next = [...prev];
      for (let i = 2; i < next.length; i++) {
        next[i] = { x: "", y: "" };
      }
      return next;
    });
  }

  // ---------- context menu actions ----------
  function openContextMenu(
    idx: number,
    field: keyof Row,
    e: React.MouseEvent
  ) {
    e.preventDefault();

    if (!isCellSelectedForField(idx, field)) {
      setSelection({ startIdx: idx, endIdx: idx, field });
    }

    setActiveField(field);
    setMenuPos({ x: e.clientX, y: e.clientY });
  }

  function closeContextMenu() {
    setMenuPos(null);
  }

  function getActiveDataIndices(): number[] {
    if (selection.field !== activeField) return [];
    const all = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    return all.filter((i) => i >= 2);
  }

  async function handleCut() {
    const indices = getActiveDataIndices();
    if (!indices.length) return;

    const lines = indices.map((i) => rows[i]?.[activeField] ?? "");
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch (err) {
      logSilentError(err, "Failed to write clipboard");
    }

    indices.forEach((i) => handleCellChange(i, activeField, ""));
    closeContextMenu();
  }

  async function handleCopy() {
    const indices = getActiveDataIndices();
    if (!indices.length) return;

    const lines = indices.map((i) => rows[i]?.[activeField] ?? "");
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch (err) {
      logSilentError(err, "Failed to copy clipboard");
    }
    closeContextMenu();
  }

  async function handlePasteFromMenu() {
    const indices = getActiveDataIndices();
    const startIdx = indices.length ? indices[0] : 2;

    try {
      const text = await navigator.clipboard.readText();
      handlePasteIntoRows(text, startIdx, activeField);
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
    if (rows.length <= 2) return;
    setSelection({
      startIdx: 2,
      endIdx: rows.length - 1,
      field: activeField,
    });
    closeContextMenu();
  }

  function handleInsert() {
    const indices = getActiveDataIndices();
    if (!indices.length) return;

    setRows((prev) => {
      const result = [...prev];
      const sortedIndices = [...indices].sort((a, b) => b - a);

      sortedIndices.forEach((idx) => {
        result.splice(idx, 0, { x: "", y: "" });
      });

      return result;
    });

    closeContextMenu();
  }

  function handleDeleteRows() {
    // Delete rows for the selected range, regardless of column
    const all = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    const indices = all.filter((i) => i >= 2);
    if (!indices.length) return;

    setRows((prev) => {
      const next = prev.filter((_, idx) => idx < 2 || !indices.includes(idx));
      return ensureMinRows(next, 8);
    });

    closeContextMenu();
  }

  function openFillDialog() {
    setFillDialogOpen(true);
    closeContextMenu();
  }

  function handleApplyFill(mode: TableFillMode, constant?: number) {
    const indices = getActiveDataIndices();
    if (!indices.length) {
      setFillDialogOpen(false);
      return;
    }

    const currentValues = rows.map((r) => r?.[activeField] ?? "");
    const nextValues = applyTableFill(currentValues, indices, {
      mode,
      constant,
    });

    indices.forEach((i) => {
      if (nextValues[i] !== currentValues[i]) {
        handleCellChange(i, activeField, nextValues[i]);
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
                {TextStore.interface("ManualDataEntryEditor_PairedDataTable_Ordinate")}
              </Table.Th>
              <Table.Th className="manual-entry-th">{xLabel}</Table.Th>
              <Table.Th className="manual-entry-th">{yLabel}</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {/* Row 0: Units */}
            <Table.Tr>
              <Table.Td className="manual-entry-cell">
                <Text ta="center" size="xs">
                  {TextStore.interface("ManualDataEntryEditor_PairedDataTable_Units")}
                </Text>
              </Table.Td>
              <Table.Td className="manual-entry-cell">
                <Text ta="center" size="xs">
                  {xUnits ?? ""}
                </Text>
              </Table.Td>
              <Table.Td className="manual-entry-cell">
                <Text ta="center" size="xs">
                  {yUnits ?? ""}
                </Text>
              </Table.Td>
            </Table.Tr>

            {/* Row 1: Type (X axis only) */}
            <Table.Tr>
              <Table.Td className="manual-entry-cell">
                <Text ta="center" size="xs">
                  {TextStore.interface("ManualDataEntryEditor_PairedDataTable_Type")}
                </Text>
              </Table.Td>
              <Table.Td className="manual-entry-cell">
                <Select
                    size="xs"
                    value={rows[1]?.x}
                    onChange={(v) => handleCellChange(1, "x", v ?? "Linear")}
                    data={[
                      { label: "Linear", value: "Linear" },
                      { label: "Log", value: "Log" },
                    ]}
                    comboboxProps={{ withinPortal: true }}
                />
              </Table.Td>
              <Table.Td className="manual-entry-cell">
                <Text size="xs" c="dimmed">
                  {/* intentionally blank */}&nbsp;
                </Text>
              </Table.Td>
            </Table.Tr>

            {/* Data rows start at index 2 */}
            {rows.map((row, idx) => {
              if (idx < 2) return null;
              const ordinalIndex = idx - 2;
              const xSelected = isCellSelectedForField(idx, "x");
              const ySelected = isCellSelectedForField(idx, "y");

              return (
                <Table.Tr key={`row-${idx}`}>
                  <Table.Td className="manual-entry-cell">
                    <Text ta="center" size="xs">
                      {ordinals[ordinalIndex] || String(ordinalIndex + 1)}
                    </Text>
                  </Table.Td>

                  {/* X column */}
                  <Table.Td
                    className="manual-entry-cell"
                    onMouseDown={(e) => handleMouseDownCell(idx, "x", e)}
                    onMouseEnter={() => handleMouseEnterCell(idx, "x")}
                    onContextMenu={(e) => openContextMenu(idx, "x", e)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: xSelected ? "#444" : "transparent",
                    }}
                  >
                    <NumberInput
                      size="xs"
                      hideControls
                      value={row.x === "" ? "" : Number(row.x)}
                      onChange={(v) =>
                        handleCellChange(
                          idx,
                          "x",
                          v === "" || v == null ? "" : String(v)
                        )
                      }
                      onPaste={(event) => handlePaste(event, idx, "x")}
                      className={`manual-entry-input ${
                          xSelected ? "selected" : ""
                      }`}
                    />
                  </Table.Td>

                  {/* Y column */}
                  <Table.Td
                    className="manual-entry-cell"
                    onMouseDown={(e) => handleMouseDownCell(idx, "y", e)}
                    onMouseEnter={() => handleMouseEnterCell(idx, "y")}
                    onContextMenu={(e) => openContextMenu(idx, "y", e)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: ySelected ? "#444" : "transparent",
                    }}
                  >
                    <NumberInput
                      size="xs"
                      hideControls
                      value={row.y === "" ? "" : Number(row.y)}
                      onChange={(v) =>
                        handleCellChange(
                          idx,
                          "y",
                          v === "" || v == null ? "" : String(v)
                        )
                      }
                      onPaste={(event) => handlePaste(event, idx, "y")}
                      className={`manual-entry-input ${
                        ySelected ? "selected" : ""
                      }`}
                    />
                  </Table.Td>
                </Table.Tr>
              );
            })}
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
