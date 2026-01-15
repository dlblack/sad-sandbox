import React, { useEffect } from "react";
import WizardRunner from "../components/WizardRunner";
import { makeWizardGeneralInfoStep, GeneralInfoSummary } from "../components/steps/WizardGeneralInfo";
import { makeSkewStep, SkewSummary, skewChoiceToOptions } from "../components/steps/WizardSkew";
import WizardFlowRangesStep from "../components/steps/WizardFlowRangesStep";
import { TextStore } from "../../../utils/TextStore";
import { Stack, Text, NumberInput, Table } from "@mantine/core";

type Bag = Record<string, unknown>;
interface WizardCtx {
  name?: string;
  description?: string;
  selectedDataset?: string;
  bag: Bag;
}

export interface Bulletin17AnalysisWizardProps {
  [key: string]: unknown;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (x == null ? "" : String(x)));
}

function normalizeProbRows(probStrings: string[], minRows = 12): string[] {
  const out = probStrings.slice();
  while (out.length < minRows) out.push("");
  return out;
}

function firstProbabilityOrDefault(probStrings: string[], fallback = 0.01): number {
  for (const s of probStrings) {
    const n = Number(s);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

const DEFAULT_PROB_ROWS: string[] = [
  "0.2",
  "0.5",
  "1.0",
  "2.0",
  "5.0",
  "10.0",
  "20.0",
  "50.0",
  "80.0",
  "90.0",
  "95.0",
  "99.0",
];

function ProbabilityStep({
                           bag,
                           setBag,
                         }: {
  bag: Bag;
  setBag: (fn: (prev: Bag) => Bag) => void;
}) {
  useEffect(() => {
    setBag((prev) => {
      const existing = asStringArray(prev.probabilities);
      if (existing.length > 0) return prev;

      return {
        ...prev,
        probabilities: DEFAULT_PROB_ROWS.slice(),
        probability: firstProbabilityOrDefault(DEFAULT_PROB_ROWS, 0.01),
      };
    });
  }, [setBag]);

  const probRows = normalizeProbRows(asStringArray(bag.probabilities), 12);

  const setProbAt = (idx: number, value: number | "" | null) => {
    setBag((prev) => {
      const prevRows = normalizeProbRows(asStringArray(prev.probabilities), 12);
      const nextRows = prevRows.slice();

      nextRows[idx] = value == null || value === "" ? "" : Number(value).toFixed(1);

      const lastIdx = nextRows.length - 1;
      if (nextRows[lastIdx].trim() !== "") nextRows.push("");

      const firstProb = firstProbabilityOrDefault(nextRows, 0.01);

      return {
        ...prev,
        probabilities: nextRows,
        probability: firstProb,
      };
    });
  };

  return (
    <Stack gap="xs">
      <Text>{TextStore.interface("Bulletin17_Wizard_Prob_Field")}</Text>

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

export default function Bulletin17AnalysisWizard(props: Bulletin17AnalysisWizardProps) {
  const steps = [
    makeWizardGeneralInfoStep(),

    {
      label: TextStore.interface("Bulletin17_Wizard_TimeWindow_Label"),
      render: ({ bag, setBag }: { bag: Bag; setBag: (fn: (prev: Bag) => Bag) => void }) => (
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            {TextStore.interface("Bulletin17_Wizard_TimeWindow_Description")}
          </Text>
          <NumberInput
            label={TextStore.interface("Bulletin17_Wizard_TimeWindow_StartYear")}
            value={typeof bag.startYear === "number" ? (bag.startYear as number) : undefined}
            onChange={(v) => setBag((prev) => ({ ...prev, startYear: Number(v) || undefined }))}
            min={1800}
            max={2100}
            step={1}
            allowDecimal={false}
            hideControls={false}
          />
          <NumberInput
            label={TextStore.interface("Bulletin17_Wizard_TimeWindow_EndYear")}
            value={typeof bag.endYear === "number" ? (bag.endYear as number) : undefined}
            onChange={(v) => setBag((prev) => ({ ...prev, endYear: Number(v) || undefined }))}
            min={1800}
            max={2100}
            step={1}
            allowDecimal={false}
            hideControls={false}
          />
        </Stack>
      ),
    },

    {
      key: "flowRanges",
      label: TextStore.interface("Bulletin17_Wizard_FlowRanges_Label"),
      render: ({
                 bag,
                 setBag,
                 selectedDataset,
                 data,
               }: {
        bag: Bag;
        setBag: (fn: (prev: Bag) => Bag) => void;
        selectedDataset?: string;
        data: Record<string, unknown>;
      }) => (
        <WizardFlowRangesStep
          bag={bag}
          setBag={setBag}
          selectedDataset={selectedDataset}
          data={data}
        />
      ),
      validate: (_: { bag: Bag }) => true,
      summary: () => null,
    },

    makeSkewStep({ allowStation: false, allowWeighted: false, compact: true }),

    {
      label: TextStore.interface("Bulletin17_Wizard_Prob_Label"),
      render: ({ bag, setBag }: { bag: Bag; setBag: (fn: (prev: Bag) => Bag) => void }) => (
        <ProbabilityStep bag={bag} setBag={setBag} />
      ),
    },

    {
      label: TextStore.interface("Bulletin17_Wizard_Step_Summary"),
      render: ({ name, description, selectedDataset, bag }: WizardCtx) => {
        const probs = asStringArray(bag.probabilities)
          .map((s) => Number(s))
          .filter((n) => Number.isFinite(n));

        return (
          <Stack gap="sm">
            <Text fw={600}>{TextStore.interface("Wizard_Summary_Title")}</Text>

            <GeneralInfoSummary
              name={name}
              description={description}
              selectedDataset={selectedDataset}
            />

            <Stack gap={2}>
              <Text size="sm">
                <strong>Start Year:</strong> {bag.startYear as number}
              </Text>
              <Text size="sm">
                <strong>End Year:</strong> {bag.endYear as number}
              </Text>
              <Text size="sm">
                <strong>{TextStore.interface("Bulletin17_Wizard_Prob_Field")}</strong>{" "}
                {probs.length ? probs.map((p) => p.toFixed(1)).join(", ") : "—"}
              </Text>
            </Stack>

            <SkewSummary
              choice={bag.skewChoice as string}
              regionalSkew={bag.regionalSkew as number | string | undefined}
              regionalSkewMSE={bag.regionalSkewMSE as number | string | undefined}
            />
          </Stack>
        );
      },
    },
  ];

  const validateNext = (ctx: WizardCtx, stepIndex: number) => {
    if (stepIndex === 1) {
      const startYear = ctx.bag.startYear as number | undefined;
      const endYear = ctx.bag.endYear as number | undefined;
      if (!startYear || !endYear) return false;
      return startYear < endYear;
    }

    if (stepIndex === 4 && String(ctx.bag.skewChoice || "") === "option3") {
      return String(ctx.bag.regionalSkew ?? "") !== "" && String(ctx.bag.regionalSkewMSE ?? "") !== "";
    }

    return true;
  };

  interface B17Result {
    name?: string;
    description?: string;
    selectedDataset: string;
    startYear: number;
    endYear: number;
    flowRanges?: unknown;

    probability: number;
    probabilities: number[];

    datasetRef: string;
    options: unknown;
  }

  const buildResult = (ctx: WizardCtx): B17Result => {
    const opts = skewChoiceToOptions(
      String(ctx.bag.skewChoice || ""),
      ctx.bag.regionalSkew,
      ctx.bag.regionalSkewMSE
    );

    const probabilities = asStringArray(ctx.bag.probabilities)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));

    const probability = probabilities.length
      ? probabilities[0]
      : Number(ctx.bag.probability ?? 0.01);

    return {
      name: ctx.name,
      description: ctx.description,
      selectedDataset: ctx.selectedDataset || "",
      startYear: Number(ctx.bag.startYear),
      endYear: Number(ctx.bag.endYear),
      flowRanges: ctx.bag.flowRanges,

      probability,
      probabilities,

      datasetRef: ctx.selectedDataset || "",
      options: opts,
    };
  };

  return (
    <WizardRunner
      {...props}
      steps={steps}
      validateNext={validateNext}
      buildResult={buildResult}
      defaultDatasetKey="Discharge"
      datasetFilter={(d: any) => String(d?.seriesKind ?? "") === "AnnualPeak"}
    />
  );
}
