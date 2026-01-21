import React, { useEffect, useMemo } from "react";
import { Stack, NumberInput, Table } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import type { WizardStep, WizardBag, WizardCtx } from "../../_shared/WizardRunner";

type Bag = WizardBag;

const DEFAULT_PROB_ROWS = [
  "0.5",
  "1.0",
  "2.0",
  "5.0",
  "10.0",
  "20.0",
  "25.0",
  "50.0",
  "80.0",
  "90.0",
  "95.0",
  "99.0",
];

function asStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x ?? ""));
  return [];
}

function normalizeProbRows(rows: string[], minRows: number): string[] {
  const out = rows.slice();
  out.push("");
  while (out.length < minRows) out.push("");
  return out;
}

function firstProbabilityOrDefault(rows: string[], fallback: number): number {
  const first = rows
    .map((s) => Number(s))
    .find((n) => Number.isFinite(n) && n > 0);
  return first != null ? first / 100 : fallback;
}

function ProbabilitiesStepView({ bag, setBag }: Pick<WizardCtx<Bag>, "bag" | "setBag">) {
  useEffect(() => {
    setBag((prev) => {
      const prevRows = asStringArray(prev.probabilities);
      if (prevRows.length > 0) return prev;

      return {
        ...prev,
        probabilities: DEFAULT_PROB_ROWS.slice(),
        probability: firstProbabilityOrDefault(DEFAULT_PROB_ROWS, 0.01),
      };
    });
  }, [setBag]);

  const probRows = useMemo(
    () => normalizeProbRows(asStringArray(bag.probabilities), 12),
    [bag.probabilities]
  );

  const setProbAt = (idx: number, value: number | "" | null) => {
    setBag((prev) => {
      const prevRows = normalizeProbRows(asStringArray(prev.probabilities), 12);
      const nextRows = prevRows.slice();
      nextRows[idx] = value == null || value === "" ? "" : String(value);

      const cleaned = nextRows.map((s) => String(s ?? ""));

      const probs = cleaned
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n) && n > 0);

      const probability = probs.length ? probs[0] / 100 : Number(prev.probability ?? 0.01);

      return { ...prev, probabilities: cleaned, probability };
    });
  };

  return (
    <Stack gap="xs">
      <Table withTableBorder withColumnBorders={false} striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{TextStore.interface("Bulletin17_Wizard_Prob_Field")}</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {probRows.map((val, i) => (
            <Table.Tr key={i}>
              <Table.Td style={{ padding: 0 }}>
                <NumberInput
                  size="xs"
                  step={0.1}
                  min={0}
                  max={100}
                  decimalScale={1}
                  fixedDecimalScale
                  value={val.trim() === "" ? "" : val}
                  onChange={(v) => setProbAt(i, v as any)}
                  styles={{
                    root: { margin: 0 },
                    input: { margin: 0 },
                  }}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

export default function makeProbabilitiesStep(): WizardStep<Bag> {
  return {
    label: TextStore.interface("Bulletin17_Wizard_Prob_Label"),
    render: (ctx) => <ProbabilitiesStepView bag={ctx.bag} setBag={ctx.setBag} />,
  };
}
