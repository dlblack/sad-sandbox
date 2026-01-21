import React from "react";
import { Button, NumberInput, ScrollArea, Table, TextInput } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import { useUnits } from "../../../../context/UnitsContext";
import type { ThresholdRow } from "./flowRangesUtils";

type Shade = { fill: string; rect: string; line: string };

type Props = {
  totalStartYear: number;
  totalEndYear: number;

  totalLow: string;
  setTotalLow: (v: string) => void;

  totalHigh: string;
  setTotalHigh: (v: string) => void;

  totalComment: string;
  setTotalComment: (v: string) => void;

  newThrStartYear: number;
  setNewThrStartYear: (v: number) => void;

  newThrEndYear: number;
  setNewThrEndYear: (v: number) => void;

  addThreshold: () => void;

  thresholdRows: ThresholdRow[];
  thrShades: Shade[];

  setThresholdCell: (idx: number, patch: Partial<ThresholdRow>) => void;
  removeThreshold: (idx: number) => void;

  clampInt: (v: unknown, fallback: number) => number;

  tableStyles: any;
  greenCell: React.CSSProperties;
  textInputStyles: any;
  numberInputStyles: any;
};

const staticCellText: React.CSSProperties = {
  fontSize: "var(--mantine-font-size-xs)",
  lineHeight: "var(--mantine-line-height-xs)",
  paddingLeft: 9,
  paddingRight: 6,
  paddingTop: 4,
  paddingBottom: 4,
  whiteSpace: "nowrap",
};

export function PerceptionThresholdsTable({
                                            totalStartYear,
                                            totalEndYear,

                                            totalLow,
                                            setTotalLow,

                                            totalHigh,
                                            setTotalHigh,

                                            totalComment,
                                            setTotalComment,

                                            newThrStartYear,
                                            setNewThrStartYear,

                                            newThrEndYear,
                                            setNewThrEndYear,

                                            addThreshold,

                                            thresholdRows,
                                            thrShades,

                                            setThresholdCell,
                                            removeThreshold,

                                            clampInt,

                                            tableStyles,
                                            greenCell,
                                            textInputStyles,
                                            numberInputStyles,
                                          }: Props) {
  const units = useUnits();

  const Td = Table.Td;

  return (
    <div className="perception-thresholds-root">
      <div className="perception-thresholds-header">
        <NumberInput
          label={TextStore.interface("Bulletin17_Wizard_TimeWindow_StartYear")}
          value={newThrStartYear || ""}
          onChange={(v) => setNewThrStartYear(v === "" || v == null ? 0 : Number(v))}
          hideControls
          size="xs"
          w={140}
        />
        <NumberInput
          label={TextStore.interface("Bulletin17_Wizard_TimeWindow_EndYear")}
          value={newThrEndYear || ""}
          onChange={(v) => setNewThrEndYear(v === "" || v == null ? 0 : Number(v))}
          hideControls
          size="xs"
          w={140}
        />
        <Button size="xs" variant="light" onClick={addThreshold}>
          {TextStore.interface("Bulletin17_Wizard_Thresholds_Add")}
        </Button>
      </div>

      <ScrollArea className="perception-thresholds-scroll" type="auto">
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
              <Table.Th>{TextStore.interface("Bulletin17_Wizard_Thresholds_Col_StartYear")}</Table.Th>
              <Table.Th>{TextStore.interface("Bulletin17_Wizard_Thresholds_Col_EndYear")}</Table.Th>
              <Table.Th>{units.label(TextStore.interface("Bulletin17_Wizard_Thresholds_Col_Low"), "flow")}</Table.Th>
              <Table.Th>{units.label(TextStore.interface("Bulletin17_Wizard_Thresholds_Col_High"), "flow")}</Table.Th>
              <Table.Th>{TextStore.interface("Bulletin17_Wizard_Thresholds_Col_Comments")}</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            <Table.Tr>
              <Td style={greenCell}>
                  <div style={staticCellText}>{totalStartYear}</div>
              </Td>
              <Td style={greenCell}>
                  <div style={staticCellText}>{totalEndYear}</div>
              </Td>
              <Td style={greenCell}>
                <TextInput
                    value={totalLow}
                    onChange={(e) => setTotalLow(e.currentTarget.value)}
                    size="xs"
                    styles={textInputStyles}
                />
              </Td>
              <Td style={greenCell}>
                <TextInput
                    value={totalHigh}
                    onChange={(e) => setTotalHigh(e.currentTarget.value)}
                    size="xs"
                    styles={textInputStyles}
                />
              </Td>
              <Td style={greenCell}>
                <TextInput
                    value={totalComment}
                    onChange={(e) => setTotalComment(e.currentTarget.value)}
                    size="xs"
                    styles={textInputStyles}
                />
              </Td>
              <Td style={greenCell} />
            </Table.Tr>

              {thresholdRows.map((t, idx) => {
                const cellStyle: React.CSSProperties = {
                  background: thrShades[idx]?.fill ?? "rgba(255,170,170,0.2)",
                };

                return (
                  <Table.Tr key={t.id}>
                    <Td style={cellStyle}>
                      <NumberInput
                        value={t.startYear}
                        onChange={(v) => setThresholdCell(idx, { startYear: clampInt(v, t.startYear) })}
                        hideControls
                        size="xs"
                        styles={numberInputStyles}
                      />
                    </Td>
                    <Td style={cellStyle}>
                      <NumberInput
                        value={t.endYear}
                        onChange={(v) => setThresholdCell(idx, { endYear: clampInt(v, t.endYear) })}
                        hideControls
                        size="xs"
                        styles={numberInputStyles}
                      />
                    </Td>
                    <Td style={cellStyle}>
                      <TextInput
                        value={t.low}
                        onChange={(e) => setThresholdCell(idx, { low: e.currentTarget.value })}
                        size="xs"
                        styles={textInputStyles}
                      />
                    </Td>
                    <Td style={cellStyle}>
                      <TextInput
                        value={t.high}
                        onChange={(e) => setThresholdCell(idx, { high: e.currentTarget.value })}
                        size="xs"
                        styles={textInputStyles}
                      />
                    </Td>
                    <Td style={cellStyle}>
                      <TextInput
                        value={t.comment}
                        onChange={(e) => setThresholdCell(idx, { comment: e.currentTarget.value })}
                        size="xs"
                        styles={textInputStyles}
                      />
                    </Td>
                    <Td style={cellStyle}>
                      <Button size="xs" variant="subtle" color="red" onClick={() => removeThreshold(idx)}>
                        {TextStore.interface("Bulletin17_Wizard_Thresholds_Remove")}
                      </Button>
                    </Td>
                  </Table.Tr>
                );
              })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </div>
  );
}
