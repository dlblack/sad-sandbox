import React from "react";
import { Stack, Text, NumberInput } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import type { WizardStep } from "../../_shared/WizardRunner";

export default function makeOutputFrequenciesStep(): WizardStep {
  return {
    label: TextStore.interface("PeakFlowFreqWizard_StepOutFreqOrd"),
    render: ({ bag, setBag }: any) => {
      const MIN_ROWS = 5;

      function normalizeRows(arr: unknown): string[] {
        const filled = (Array.isArray(arr) ? arr : []).filter((v) => v !== "");
        const out = filled.map(String);
        out.push("");
        while (out.length < MIN_ROWS) out.push("");
        return out;
      }

      const rows = normalizeRows(bag.step4Rows);

      const onChangeRow = (idx: number, val: unknown) => {
        const valueStr = val == null || val === "" ? "" : String(val);
        const updated = rows.slice();
        updated[idx] = valueStr;
        const next = normalizeRows(updated);
        setBag((prev: any) => ({ ...prev, step4Rows: next }));
      };

      return (
        <Stack gap="sm">
          <Text size="sm">{TextStore.interface("PeakFlowFreqWizard_EditOutputFreqOrd")}</Text>

          <Stack gap="xs">
            {rows.map((value, idx) => (
              <NumberInput
                key={`${idx}`}
                label={idx === 0 ? TextStore.interface("PeakFlowFreqWizard_FreqInPercent") : undefined}
                hideControls
                value={value === "" ? "" : Number(value)}
                onChange={(v) => onChangeRow(idx, v as number | string)}
                min={0}
                max={100}
                step={1}
              />
            ))}
          </Stack>
        </Stack>
      );
    },
  };
}
