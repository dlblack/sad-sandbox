import React, { useEffect } from "react";
import {
  Card,
  Table,
  NumberInput,
  Select,
  Text,
  ScrollArea,
} from "@mantine/core";
import TextStore from "../../../utils/TextStore";

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
      <Card withBorder radius="md" padding="xs" className={"editor-card"}>
        <ScrollArea
            className="editor-scroll"
            type="always"
            scrollbars="y"
            offsetScrollbars
            scrollbarSize={12}
        >
          <Table
              withRowBorders
              verticalSpacing="xs"
              horizontalSpacing="sm"
              striped={false}
              layout="fixed"
              className="manual-entry-table"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 80 }}>
                  {TextStore.interface("ManualDataEntryEditor_PairedDataTable_Ordinate")}
                </Table.Th>
                <Table.Th style={{ width: 130 }}>{xLabel || "X"}</Table.Th>
                <Table.Th style={{ width: 130 }}>{yLabel || "Y"}</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {/* Row 0: Units */}
              <Table.Tr>
                <Table.Td>
                  <Text ta="center" size="xs">
                    {TextStore.interface("ManualDataEntryEditor_PairedDataTable_Units")}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text ta="center" size="xs">
                    {xUnits ?? ""}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text ta="center" size="xs">
                    {yUnits ?? ""}
                  </Text>
                </Table.Td>
              </Table.Tr>

              {/* Row 1: Type (X axis only) */}
              <Table.Tr>
                <Table.Td>
                  <Text ta="center" size="xs">
                    {TextStore.interface("ManualDataEntryEditor_PairedDataTable_Type")}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Select
                      size="xs"
                      value={rows[1]?.x || "Linear"}
                      onChange={(v) => handleCellChange(1, "x", v ?? "Linear")}
                      data={[
                        { label: "Linear", value: "Linear" },
                        { label: "Log", value: "Log" },
                      ]}
                      comboboxProps={{ withinPortal: true }}
                  />
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {/* intentionally blank */}&nbsp;
                  </Text>
                </Table.Td>
              </Table.Tr>

              {/* Data rows start at index 2 */}
              {rows.slice(2).map((row, idx) => {
                const absoluteIndex = 2 + idx;
                return (
                    <Table.Tr key={`row-${absoluteIndex}`}>
                      <Table.Td>
                        <Text ta="center" size="xs">
                          {ordinals[idx] || String(idx + 1)}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <NumberInput
                            size="xs"
                            hideControls
                            value={row.x === "" ? "" : Number(row.x)}
                            onChange={(v) =>
                                handleCellChange(
                                    absoluteIndex,
                                    "x",
                                    v === "" || v == null ? "" : String(v)
                                )
                            }
                            // presentation
                            styles={{
                              input: {
                                textAlign: "right",
                              },
                            }}
                        />
                      </Table.Td>

                      <Table.Td>
                        <NumberInput
                            size="xs"
                            hideControls
                            value={row.y === "" ? "" : Number(row.y)}
                            onChange={(v) =>
                                handleCellChange(
                                    absoluteIndex,
                                    "y",
                                    v === "" || v == null ? "" : String(v)
                                )
                            }
                            styles={{
                              input: {
                                textAlign: "right",
                              },
                            }}
                        />
                      </Table.Td>
                    </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
  );
}
