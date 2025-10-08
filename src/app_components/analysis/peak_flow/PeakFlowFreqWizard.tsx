import React from "react";
import WizardRunner from "../components/WizardRunner";
import { makeWizardGeneralInfoStep, GeneralInfoSummary } from "../components/steps/WizardGeneralInfo";
import { makeSkewStep, SkewSummary } from "../components/steps/WizardSkew";
import { TextStore } from "../../../utils/TextStore";
import { Stack, Text, NumberInput, Radio } from "@mantine/core";

const EXP_PROB = {
  doNotComp: TextStore.interface("PeakFlowFreqWizard_DoNotCompExpProb"),
  comp: TextStore.interface("PeakFlowFreqWizard_CompExpProb"),
};

type Bag = Record<string, unknown>;

interface WizardCtx {
  name?: string;
  description?: string;
  selectedDataset?: string;
  bag: Bag;
}

export interface PeakFlowFreqWizardProps {
  [key: string]: unknown;
}

export default function PeakFlowFreqWizard(props: PeakFlowFreqWizardProps) {
  const steps = [
    makeWizardGeneralInfoStep(),

    makeSkewStep({ allowStation: true, allowWeighted: true, compact: true }),

    {
      label: TextStore.interface("PeakFlowFreqWizard_StepExpProb"),
      render: ({ bag, setBag }: { bag: Bag; setBag: (fn: (prev: Bag) => Bag) => void }) => (
          <Stack gap="xs">
            <Radio.Group
                value={(bag.exProbChoice as string) || ""}
                onChange={(val) => setBag((prev) => ({ ...prev, exProbChoice: val }))}
                name="step3Radio"
            >
              <Radio label={EXP_PROB.doNotComp} value="option1" />
              <Radio label={EXP_PROB.comp} value="option2" />
            </Radio.Group>
          </Stack>
      ),
    },

    {
      label: TextStore.interface("PeakFlowFreqWizard_StepOutFreqOrd"),
      render: ({ bag, setBag }: { bag: Bag; setBag: (fn: (prev: Bag) => Bag) => void }) => {
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
          setBag((prev) => ({ ...prev, step4Rows: next }));
        };

        return (
            <Stack gap="sm">
              <Text size="sm">
                {TextStore.interface("PeakFlowFreqWizard_EditOutputFreqOrd")}
              </Text>

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
    },

    {
      label: TextStore.interface("PeakFlowFreqWizard_StepComplete"),
      render: ({ name, description, selectedDataset, bag }: WizardCtx) => {
        const freqList = ((bag.step4Rows as string[] | undefined) || []).filter((v) => v !== "");
        return (
            <Stack gap="sm">
              <Text size="sm" fw={600}>
                {TextStore.interface("Wizard_Summary_Title")}
              </Text>

              <GeneralInfoSummary
                  name={name}
                  description={description}
                  selectedDataset={selectedDataset}
              />

              <SkewSummary
                  choice={bag.skewChoice as string}
                  regionalSkew={bag.regionalSkew as number | string | undefined}
                  regionalSkewMSE={bag.regionalSkewMSE as number | string | undefined}
              />

              <div>
                <Text fw={600}>
                  {TextStore.interface("PeakFlowFreqWizard_SummaryExpectedProbability")}
                </Text>
                <Text size="sm">
                  <strong>
                    {TextStore.interface("PeakFlowFreqWizard_SummaryComputation")}
                  </strong>{" "}
                  {bag.exProbChoice === "option1"
                      ? EXP_PROB.doNotComp
                      : bag.exProbChoice === "option2"
                          ? EXP_PROB.comp
                          : null}
                </Text>
              </div>

              <div>
                <Text fw={600}>
                  {TextStore.interface("PeakFlowFreqWizard_SummaryFrequencies")}
                </Text>
                {freqList.length > 0 ? (
                    <Stack gap={2}>
                      {freqList.map((v, idx) => (
                          <Text key={`freqsum${idx}`} size="xs">
                            • {v}
                          </Text>
                      ))}
                    </Stack>
                ) : (
                    <Text size="xs" fs="italic">
                      {TextStore.interface("PeakFlowFreqWizard_SummaryFrequencies_None")}
                    </Text>
                )}
              </div>
            </Stack>
        );
      },
    },
  ];

  const buildResult = (ctx: WizardCtx) => ({
    name: ctx.name,
    description: ctx.description,
    selectedDataset: ctx.selectedDataset,
    skewChoiceValue:
        (ctx.bag.skewChoice === "option1" &&
            TextStore.interface("AnalysisWizard_Skew_UseStationSkew")) ||
        (ctx.bag.skewChoice === "option2" &&
            TextStore.interface("AnalysisWizard_Skew_UseWeightedSkew")) ||
        (ctx.bag.skewChoice === "option3" &&
            TextStore.interface("AnalysisWizard_Skew_UseRegionalSkew")) ||
        "",
    regionalSkew: ctx.bag.regionalSkew,
    regionalSkewMSE: ctx.bag.regionalSkewMSE,
    exProbChoice:
        (ctx.bag.exProbChoice === "option1" && EXP_PROB.doNotComp) ||
        (ctx.bag.exProbChoice === "option2" && EXP_PROB.comp) ||
        "",
    frequencies: ((ctx.bag.step4Rows as string[] | undefined) || []).filter((v) => v !== ""),
  });

  return (
      <WizardRunner
          {...props}
          steps={steps}
          buildResult={buildResult}
          defaultDatasetKey="Discharge"
      />
  );
}
