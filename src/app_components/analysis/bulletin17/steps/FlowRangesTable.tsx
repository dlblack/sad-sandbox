import React from "react";
import { ScrollArea, Select, Table, TextInput } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import { useUnits } from "../../../../context/UnitsContext";
import type { FlowRow } from "./flowRangesUtils";

type Props = {
  rows: FlowRow[];
  DATA_TYPES: FlowRow["dataType"][];
  setCell: (idx: number, patch: Partial<FlowRow>) => void;
  applyPasteGrid: (startRow: number, startCol: 0 | 1 | 2, text: string) => void;
  tableStyles: any;
};

export function FlowRangesTable({ rows, DATA_TYPES, setCell, applyPasteGrid, tableStyles }: Props) {
  const units = useUnits();

  return (
    <ScrollArea className="scroll-area" type="auto">
      <Table
        withTableBorder
        withColumnBorders
        highlightOnHover
        verticalSpacing="xs"
        horizontalSpacing="xs"
        styles={tableStyles}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              {TextStore.interface("Bulletin17_Wizard_FlowRanges_Col_Year")}
            </Table.Th>
            <Table.Th>
              {units.label(TextStore.interface(
                "Bulletin17_Wizard_FlowRanges_Col_Peak"), "flow")
              }
            </Table.Th>
            <Table.Th>
              {units.label(TextStore.interface(
                "Bulletin17_Wizard_FlowRanges_Col_Low"), "flow")
              }
            </Table.Th>
            <Table.Th>
              {units.label(TextStore.interface(
                "Bulletin17_Wizard_FlowRanges_Col_High"), "flow")
              }
            </Table.Th>
            <Table.Th>
              {TextStore.interface("Bulletin17_Wizard_FlowRanges_Col_DataType")}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {rows.map((r, idx) => (
            <Table.Tr key={r.year}>
              <Table.Td>{r.year}</Table.Td>

              <Table.Td>
                <TextInput
                  value={r.peak}
                  onChange={(e) => setCell(idx, { peak: e.currentTarget.value })}
                  onPaste={(e) => {
                    e.preventDefault();
                    applyPasteGrid(idx, 0, e.clipboardData.getData("text"));
                  }}
                  size="xs"
                />
              </Table.Td>

              <Table.Td>
                <TextInput
                  value={r.low}
                  onChange={(e) => setCell(idx, { low: e.currentTarget.value })}
                  onPaste={(e) => {
                    e.preventDefault();
                    applyPasteGrid(idx, 1, e.clipboardData.getData("text"));
                  }}
                  size="xs"
                />
              </Table.Td>

              <Table.Td>
                <TextInput
                  value={r.high}
                  onChange={(e) => setCell(idx, { high: e.currentTarget.value })}
                  onPaste={(e) => {
                    e.preventDefault();
                    applyPasteGrid(idx, 2, e.clipboardData.getData("text"));
                  }}
                  size="xs"
                />
              </Table.Td>

              <Table.Td>
                <Select
                  value={r.dataType}
                  data={DATA_TYPES}
                  onChange={(v) => setCell(idx, { dataType: (v as FlowRow["dataType"]) ?? "Censored" })}
                  allowDeselect={false}
                  size="xs"
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
