import React, { useEffect, useState, useCallback } from "react";
import { Box, Checkbox, ScrollArea, Table, Text, NumberInput } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import { WizardStep, WizardCtx } from "../../_shared/WizardRunner";
import TableFillOptionsDialog from "../../../../dialogs/TableFillOptionsDialog";
import TableContextMenu from "../../../table/TableContextMenu";
import { useGlobalMouseUp } from "../../../table/useGlobalMouseUp";
import { applyTableFill, TableFillMode } from "../../../../utils/tableFillUtils";
import { getSelectedIndices, isCellSelected, parseClipboard } from "../../../table/tableSectionUtils";
import { logSilentError } from "../../../../utils/logSilentError";

const BAG_KEY_PROBS = "copulaContourProbabilities";
const BAG_KEY_IS_CUM = "copulaContourIsCumulative";

const DEFAULT_AEP = ["0.5", "0.1", "0.05", "0.02", "0.01", "0.005", "0.002", "0.001"];
const DEFAULT_CUMULATIVE = ["0.5", "0.9", "0.95", "0.98", "0.99", "0.995", "0.998", "0.999"];

function ensureAtLeastN<T>(arr: T[], n: number, filler: T): T[] {
  if (arr.length >= n) return arr;
  const out = arr.slice();
  const need = n - out.length;
  for (let i = 0; i < need; i++) out.push(filler);
  return out;
}

type PanelProps = {
  initialRows: string[];
  initialIsCumulative: boolean;
  setBag: WizardCtx["setBag"];
};

function Panel({ initialRows, initialIsCumulative, setBag }: PanelProps) {
  const [rows, setRows] = useState<string[]>(
    ensureAtLeastN(initialRows ?? [], 8, "")
  );
  const [isCumulative, setIsCumulative] = useState<boolean>(
    initialIsCumulative
  );

  // Selection state
  const [selection, setSelection] = useState<{ startIdx: number | null; endIdx: number | null }>({
    startIdx: null,
    endIdx: null,
  });
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Context menu state
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [fillDialogOpen, setFillDialogOpen] = useState(false);

  useEffect(() => {
    setBag((prev) => ({
      ...(prev as Record<string, unknown>),
      [BAG_KEY_PROBS]: rows,
      [BAG_KEY_IS_CUM]: isCumulative,
    }));
  }, [rows, isCumulative, setBag]);

  const headerLabel = isCumulative
    ? TextStore.interface("Copula_Wizard_StepContProb_HeaderCum") ??
    "Cumulative Probabilities"
    : TextStore.interface("Copula_Wizard_StepContProb_HeaderAEP") ??
    "Annual Exceedance Probabilities";

  const handleCumulativeToggle = (checked: boolean) => {
    setIsCumulative(checked);
    const newDefaults = checked ? DEFAULT_CUMULATIVE : DEFAULT_AEP;
    setRows([...newDefaults, ""]);
  };

  const setProbAt = (idx: number, value: number | "" | null) => {
    setRows((prev) => {
      const next = prev.slice();
      next[idx] = value == null || value === "" ? "" : String(value);

      // if editing the last row and it now has a value, append a new empty row
      const lastIndex = prev.length - 1;
      const editingLast = idx === lastIndex;
      const hasValue = next[idx].trim() !== "";
      if (editingLast && hasValue) {
        return [...next, ""];
      }
      return next;
    });
  };

  // Mouse selection handlers
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
      setSelection((prev) => ({
        ...prev,
        endIdx: idx,
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

  // Context menu handlers
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
    const lines = indices.map((i) => rows[i] ?? "");
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch (err) {
      logSilentError(err, "Failed to write clipboard");
    }
    indices.forEach((i) => setProbAt(i, ""));
    closeContextMenu();
  }

  async function handleCopy() {
    const indices = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    if (!indices.length) return;
    const lines = indices.map((i) => rows[i] ?? "");
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch (err) {
      logSilentError(err, "Failed to copy clipboard");
    }
    closeContextMenu();
  }

  function handlePasteIntoRows(text: string, startIdx: number) {
    const lines = parseClipboard(text);

    lines.forEach((line, lineIndex) => {
      const targetRowIndex = startIdx + lineIndex;
      if (targetRowIndex >= rows.length) return;
      const firstCell = line.split(/\t/)[0].trim();
      if (firstCell.length === 0) {
        setProbAt(targetRowIndex, "");
        return;
      }
      // Parse the string to a number
      const numValue = Number(firstCell);
      setProbAt(targetRowIndex, Number.isFinite(numValue) ? numValue : "");
    });
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

  function handlePaste(event: React.ClipboardEvent, startIdx: number) {
    event.preventDefault();
    const clipboardText = event.clipboardData.getData("text");
    handlePasteIntoRows(clipboardText, startIdx);
  }

  function handleClearFromMenu() {
    const indices = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    if (!indices.length) return;
    indices.forEach((i) => setProbAt(i, ""));
    closeContextMenu();
  }

  function handleInsert() {
    const indices = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    if (!indices.length) return;

    setRows((prev) => {
      const result = [...prev];
      const sortedIndices = [...indices].sort((a, b) => b - a);

      sortedIndices.forEach((idx) => {
        result.splice(idx, 0, "");
      });

      return result;
    });

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

  function handleDeleteRows() {
    const indices = getSelectedIndices(selection.startIdx, selection.endIdx, rows.length);
    if (!indices.length) return;

    // Remove the selected rows
    setRows((prev) => {
      const next = prev.filter((_, i) => !indices.includes(i));
      // Ensure at least one empty row remains
      return next.length > 0 ? next : [""];
    });

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

    const currentValues = rows.slice();
    const nextValues = applyTableFill(currentValues, indices, {
      mode,
      constant,
    });

    setRows(nextValues);
    setFillDialogOpen(false);
  }

  return (
    <Box>
      <Text fw={600} mb="xs">
        {TextStore.interface("Copula_Wizard_StepContProb_Label")}
      </Text>

      <Checkbox
        checked={isCumulative}
        onChange={(e) => handleCumulativeToggle(e.currentTarget.checked)}
        label={TextStore.interface("Copula_Wizard_StepContProb_DispCumulativeProb")}
        mb="sm"
      />

      {/* inner scroll so the table never collides with the wizard footer */}
      <ScrollArea style={{ maxHeight: "48vh" }} type="auto">
        <Table
          withTableBorder
          withColumnBorders={false}
          striped
          verticalSpacing="xs"
          horizontalSpacing="sm"
          stickyHeader
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{headerLabel}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((val, i) => (
              <Table.Tr key={`prob-row-${i}`}>
                <Table.Td
                  style={{
                    padding: 0,
                    cursor: "pointer",
                    backgroundColor: isCellSelected(i, selection.startIdx, selection.endIdx)
                      ? "var(--mantine-color-blue-filled)"
                      : "transparent",
                  }}
                  onMouseDown={(e) => handleMouseDown(i, e)}
                  onMouseEnter={() => handleMouseEnter(i)}
                  onContextMenu={(e) => openContextMenu(i, e)}
                >
                  <NumberInput
                    size="xs"
                    step={0.001}
                    min={0}
                    max={1}
                    decimalScale={3}
                    aria-label={`prob-${i}`}
                    value={val.trim() === "" ? "" : val}
                    onChange={(v) => setProbAt(i, v as any)}
                    onPaste={(event) => handlePaste(event, i)}
                    styles={{
                      root: { margin: 0 },
                      input: { margin: 0, border: "none" },
                    }}
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
    </Box>
  );
}

export default function makeCopulaContourProbabilitiesStep(): WizardStep {
  return {
    label: TextStore.interface("Copula_Wizard_StepContProb"),
    render: (ctx: WizardCtx) => {
      const bag = (ctx.bag ?? {}) as Record<string, unknown>;

      const initialIsCumulative = (bag[BAG_KEY_IS_CUM] as boolean | undefined) ?? false;

      const bagRows = (bag[BAG_KEY_PROBS] as string[] | undefined) ?? [];
      const defaultRows = initialIsCumulative ? DEFAULT_CUMULATIVE : DEFAULT_AEP;
      const initialRows = bagRows.length > 0
        ? ensureAtLeastN(bagRows, 8, "")
        : [...defaultRows, ""];

      return (
        <Panel
          initialRows={initialRows}
          initialIsCumulative={initialIsCumulative}
          setBag={ctx.setBag}
        />
      );
    },
  };
}