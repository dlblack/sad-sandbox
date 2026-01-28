import { useState, useCallback } from "react";
import { logSilentError } from "../../utils/logSilentError";
import { getSelectedIndices, parseClipboard } from "./tableSectionUtils";
import { applyTableFill, TableFillMode } from "../../utils/tableFillUtils";
import { useGlobalMouseUp } from "./useGlobalMouseUp";

export interface TableColumn<T = any> {
  key: string;
  label: string;
  readOnly?: boolean;
  format?: (value: any) => any;
  parse?: (value: string) => any;
}

export interface UseEditableTableOptions<T> {
  data: T[];
  onChange: (data: T[]) => void;
  columns: TableColumn<T>[];
  minRows?: number;
  skipRows?: number; // rows at the beginning that are not data rows (e.g., units, type)
  enableContextMenu?: boolean;
}

export interface SelectionState {
  startIdx: number | null;
  endIdx: number | null;
  field: string | null;
}

export function useEditableTable<T extends Record<string, any>>({
                                                                  data,
                                                                  onChange,
                                                                  columns,
                                                                  minRows = 0,
                                                                  skipRows = 0,
                                                                  enableContextMenu = true,
                                                                }: UseEditableTableOptions<T>) {
  const [selection, setSelection] = useState<SelectionState>({
    startIdx: null,
    endIdx: null,
    field: null,
  });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [fillDialogOpen, setFillDialogOpen] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleGlobalMouseUpDone = useCallback(() => {
    setIsMouseDown(false);
    setSelection((prev) => ({
      ...prev,
      endIdx: prev.endIdx ?? prev.startIdx,
    }));
  }, []);

  useGlobalMouseUp(isMouseDown, handleGlobalMouseUpDone);

  const createEmptyRow = useCallback((): T => {
    const emptyRow: any = {};
    columns.forEach((col) => {
      emptyRow[col.key] = "";
    });
    return emptyRow as T;
  }, [columns]);

  const isCellSelected = useCallback(
    (idx: number, field: string): boolean => {
      const { startIdx, endIdx, field: selField } = selection;
      if (selField !== field) return false;
      if (startIdx == null || endIdx == null) return false;
      const from = Math.min(startIdx, endIdx);
      const to = Math.max(startIdx, endIdx);
      return idx >= from && idx <= to;
    },
    [selection]
  );

  const handleMouseDown = useCallback(
    (idx: number, field: string, event: React.MouseEvent) => {
      if (event.button !== 0) return;
      setIsMouseDown(true);

      if (event.shiftKey && selection.startIdx !== null && selection.field === field) {
        setSelection((prev) => ({ ...prev, endIdx: idx }));
      } else {
        setSelection({ startIdx: idx, endIdx: idx, field });
      }
    },
    [selection.startIdx, selection.field]
  );

  const handleMouseEnter = useCallback(
    (idx: number, field: string) => {
      if (!isMouseDown || selection.field !== field) return;
      setSelection((prev) => ({ ...prev, endIdx: idx }));
    },
    [isMouseDown, selection.field]
  );

  const openContextMenu = useCallback(
    (idx: number, field: string, e: React.MouseEvent) => {
      if (!enableContextMenu) return;
      e.preventDefault();

      if (!isCellSelected(idx, field)) {
        setSelection({ startIdx: idx, endIdx: idx, field });
      }

      setActiveField(field);
      setMenuPos({ x: e.clientX, y: e.clientY });
    },
    [enableContextMenu, isCellSelected]
  );

  const closeContextMenu = useCallback(() => {
    setMenuPos(null);
  }, []);

  const getDataIndices = useCallback((): number[] => {
    if (selection.field !== activeField) return [];
    const all = getSelectedIndices(selection.startIdx, selection.endIdx, data.length);
    return all.filter((i) => i >= skipRows);
  }, [selection, activeField, data.length, skipRows]);

  const handleCut = useCallback(async () => {
    const indices = getDataIndices();
    if (!indices.length || !activeField) return;

    const lines = indices.map((i) => String(data[i]?.[activeField] ?? ""));
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch (err) {
      logSilentError(err, "Failed to write clipboard");
    }

    const updated = [...data];
    indices.forEach((i) => {
      updated[i] = { ...updated[i], [activeField]: "" };
    });
    onChange(updated);
    closeContextMenu();
  }, [getDataIndices, activeField, data, onChange, closeContextMenu]);

  const handleCopy = useCallback(async () => {
    const indices = getDataIndices();
    if (!indices.length || !activeField) return;

    const lines = indices.map((i) => String(data[i]?.[activeField] ?? ""));
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch (err) {
      logSilentError(err, "Failed to copy clipboard");
    }
    closeContextMenu();
  }, [getDataIndices, activeField, data, closeContextMenu]);

  const handlePaste = useCallback(
    async (text: string, startIdx: number, field: string) => {
      const lines = parseClipboard(text);
      const column = columns.find((c) => c.key === field);
      const parse = column?.parse || ((v: string) => v);

      const updated = [...data];
      lines.forEach((line, lineIndex) => {
        const targetRowIndex = startIdx + lineIndex;
        if (targetRowIndex < skipRows || targetRowIndex >= data.length) return;

        const firstCell = line.split(/\t/)[0].trim();
        if (firstCell.length === 0) return;

        updated[targetRowIndex] = {
          ...updated[targetRowIndex],
          [field]: parse(firstCell),
        };
      });

      onChange(updated);
    },
    [data, onChange, columns, skipRows]
  );

  const handlePasteFromMenu = useCallback(async () => {
    const indices = getDataIndices();
    if (!activeField) return;
    const startIdx = indices.length ? indices[0] : skipRows;

    try {
      const text = await navigator.clipboard.readText();
      await handlePaste(text, startIdx, activeField);
    } catch (err) {
      logSilentError(err, "Failed to paste clipboard");
    }
    closeContextMenu();
  }, [getDataIndices, activeField, skipRows, handlePaste, closeContextMenu]);

  const handleClear = useCallback(() => {
    const indices = getDataIndices();
    if (!indices.length || !activeField) return;

    const updated = [...data];
    indices.forEach((i) => {
      updated[i] = { ...updated[i], [activeField]: "" };
    });
    onChange(updated);
    closeContextMenu();
  }, [getDataIndices, activeField, data, onChange, closeContextMenu]);

  const handleInsert = useCallback(() => {
    const indices = getDataIndices();
    if (!indices.length) return;

    const updated = [...data];
    // Get the first selected index and the count of selected rows
    const firstIdx = Math.min(...indices);
    const count = indices.length;

    // Insert 'count' empty rows at the first selected index
    for (let i = 0; i < count; i++) {
      updated.splice(firstIdx, 0, createEmptyRow());
    }

    onChange(updated);
    closeContextMenu();
  }, [getDataIndices, data, createEmptyRow, onChange, closeContextMenu]);

  const handleDeleteRows = useCallback(() => {
    const indices = getDataIndices();
    if (!indices.length) return;

    const updated = data.filter((_, idx) => !indices.includes(idx));

    // Ensure minimum rows
    while (updated.length < minRows) {
      updated.push(createEmptyRow());
    }

    onChange(updated);
    closeContextMenu();
  }, [getDataIndices, data, minRows, createEmptyRow, onChange, closeContextMenu]);

  const handleSelectAll = useCallback(() => {
    if (data.length <= skipRows) return;
    setSelection({
      startIdx: skipRows,
      endIdx: data.length - 1,
      field: activeField,
    });
    closeContextMenu();
  }, [data.length, skipRows, activeField, closeContextMenu]);

  const openFillDialog = useCallback(() => {
    setFillDialogOpen(true);
    closeContextMenu();
  }, [closeContextMenu]);

  const handleApplyFill = useCallback(
    (mode: TableFillMode, constant?: number) => {
      const indices = getDataIndices();
      if (!indices.length || !activeField) {
        setFillDialogOpen(false);
        return;
      }

      const currentValues = data.map((row) => String(row[activeField] ?? ""));
      const nextValues = applyTableFill(currentValues, indices, { mode, constant });

      const updated = [...data];
      indices.forEach((i) => {
        if (nextValues[i] !== currentValues[i]) {
          updated[i] = { ...updated[i], [activeField]: nextValues[i] };
        }
      });

      onChange(updated);
      setFillDialogOpen(false);
    },
    [getDataIndices, activeField, data, onChange]
  );

  return {
    selection,
    isCellSelected,

    handleMouseDown,
    handleMouseEnter,

    menuPos,
    openContextMenu,
    closeContextMenu,

    handleCut,
    handleCopy,
    handlePaste,
    handlePasteFromMenu,

    handleClear,
    handleInsert,
    handleDeleteRows,
    handleSelectAll,

    fillDialogOpen,
    setFillDialogOpen,
    openFillDialog,
    handleApplyFill,
  };
}
