import React, { useEffect } from "react";
import { Card, Select, Text, ScrollArea, Table, NumberInput } from "@mantine/core";
import TextStore from "../../../utils/TextStore";
import { useEditableTable } from "../../table/useEditableTable";
import TableContextMenu from "../../table/TableContextMenu";
import TableFillOptionsDialog from "../../../dialogs/TableFillOptionsDialog";

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

  const columns = [
    { key: "x", label: xLabel || "X" },
    { key: "y", label: yLabel || "Y" },
  ];

  const editor = useEditableTable({
    data: rows,
    onChange: setRows,
    columns,
    minRows: 8,
    skipRows: 2, // Units and Type rows
    enableContextMenu: true,
  });

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
              const xSelected = editor.isCellSelected(idx, "x");
              const ySelected = editor.isCellSelected(idx, "y");

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
                    onMouseDown={(e) => editor.handleMouseDown(idx, "x", e)}
                    onMouseEnter={() => editor.handleMouseEnter(idx, "x")}
                    onContextMenu={(e) => editor.openContextMenu(idx, "x", e)}
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
                      onPaste={(event) => {
                        event.preventDefault();
                        const text = event.clipboardData.getData("text");
                        editor.handlePaste(text, idx, "x");
                      }}
                      className={`manual-entry-input ${xSelected ? "selected" : ""}`}
                    />
                  </Table.Td>

                  {/* Y column */}
                  <Table.Td
                    className="manual-entry-cell"
                    onMouseDown={(e) => editor.handleMouseDown(idx, "y", e)}
                    onMouseEnter={() => editor.handleMouseEnter(idx, "y")}
                    onContextMenu={(e) => editor.openContextMenu(idx, "y", e)}
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
                      onPaste={(event) => {
                        event.preventDefault();
                        const text = event.clipboardData.getData("text");
                        editor.handlePaste(text, idx, "y");
                      }}
                      className={`manual-entry-input ${ySelected ? "selected" : ""}`}
                    />
                  </Table.Td>
                </Table.Tr>
              );
            })}
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
