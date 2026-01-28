import React from "react";
import { Table, NumberInput, ScrollArea } from "@mantine/core";
import { useEditableTable, TableColumn } from "./useEditableTable";
import TableContextMenu from "./TableContextMenu";
import TableFillOptionsDialog from "../../dialogs/TableFillOptionsDialog";

export interface EditableTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onChange: (data: T[]) => void;
  minRows?: number;
  skipRows?: number;
  enableContextMenu?: boolean;
  renderCell?: (row: T, column: TableColumn<T>, rowIndex: number) => React.ReactNode;
  className?: string;
}

export default function EditableTable<T extends Record<string, any>>({
                                                                       data,
                                                                       columns,
                                                                       onChange,
                                                                       minRows = 0,
                                                                       skipRows = 0,
                                                                       enableContextMenu = true,
                                                                       renderCell,
                                                                       className = "",
                                                                     }: EditableTableProps<T>) {
  const editor = useEditableTable({
    data,
    onChange,
    columns,
    minRows,
    skipRows,
    enableContextMenu,
  });

  const handleCellChange = (rowIdx: number, field: string, value: any) => {
    const updated = [...data];
    updated[rowIdx] = { ...updated[rowIdx], [field]: value };
    onChange(updated);
  };

  const defaultRenderCell = (row: T, column: TableColumn<T>, rowIndex: number) => {
    const value = row[column.key];
    editor.isCellSelected(rowIndex, column.key);
    const isReadOnly = column.readOnly || rowIndex < skipRows;

    if (isReadOnly) {
      return (
        <div style={{ padding: "8px" }}>
          {column.format ? column.format(value) : String(value ?? "")}
        </div>
      );
    }

    return (
      <NumberInput
        size="xs"
        hideControls
        value={value === "" ? "" : value}
        onChange={(v) => handleCellChange(rowIndex, column.key, v === "" || v == null ? "" : v)}
        onPaste={(event) => {
          event.preventDefault();
          const text = event.clipboardData.getData("text");
          editor.handlePaste(text, rowIndex, column.key);
        }}
        styles={{
          root: { margin: 0 },
          input: { margin: 0, border: "none" },
        }}
      />
    );
  };

  return (
    <>
      <ScrollArea type="auto" style={{ maxHeight: "60vh" }}>
        <Table
          withTableBorder
          withColumnBorders={false}
          striped
          verticalSpacing="xs"
          horizontalSpacing="sm"
          className={className}
        >
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.key}>{col.label}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row, rowIdx) => (
              <Table.Tr key={rowIdx}>
                {columns.map((col) => (
                  <Table.Td
                    key={`${rowIdx}-${col.key}`}
                    style={{
                      padding: 0,
                      cursor: col.readOnly ? "default" : "pointer",
                      backgroundColor: editor.isCellSelected(rowIdx, col.key)
                        ? "var(--mantine-color-blue-filled)"
                        : "transparent",
                    }}
                    onMouseDown={(e) => !col.readOnly && editor.handleMouseDown(rowIdx, col.key, e)}
                    onMouseEnter={() => !col.readOnly && editor.handleMouseEnter(rowIdx, col.key)}
                    onContextMenu={(e) => !col.readOnly && editor.openContextMenu(rowIdx, col.key, e)}
                  >
                    {renderCell
                      ? renderCell(row, col, rowIdx)
                      : defaultRenderCell(row, col, rowIdx)}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {enableContextMenu && (
        <>
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
        </>
      )}
    </>
  );
}
