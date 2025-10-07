import React from "react";
import WizardRunner from "../components/WizardRunner.jsx";
import { makeWizardGeneralInfoStep, GeneralInfoSummary } from "../components/steps/WizardGeneralInfo.jsx";
import { makeSkewStep, SkewSummary } from "../components/steps/WizardSkew.jsx";
import { TextStore } from "../../../utils/TextStore.js";
import { Stack, Text, NumberInput, Radio } from "@mantine/core";

const EXP_PROB = {
  doNotComp: TextStore.interface("PeakFlowFreqWizard_DoNotCompExpProb"),
  comp: TextStore.interface("PeakFlowFreqWizard_CompExpProb"),
};

export default function PeakFlowFreqWizard(props) {
  const steps = [
    makeWizardGeneralInfoStep(),

    makeSkewStep({ allowStation: true, allowWeighted: true, compact: true }),

    {
      label: TextStore.interface("PeakFlowFreqWizard_StepExpProb"),
      render: ({ bag, setBag }) => (
        <Stack gap="xs">
          <Radio
            label={EXP_PROB.doNotComp}
            name="step3Radio"
            value="option1"
            checked={(bag.exProbChoice || "") === "option1"}
            onChange={(e) =>
              setBag((prev) => ({ ...prev, exProbChoice: e.currentTarget.value }))
            }
          />
          <Radio
            label={EXP_PROB.comp}
            name="step3Radio"
            value="option2"
            checked={(bag.exProbChoice || "") === "option2"}
            onChange={(e) =>
              setBag((prev) => ({ ...prev, exProbChoice: e.currentTarget.value }))
            }
          />
        </Stack>
      ),
    },

    {
      label: TextStore.interface("PeakFlowFreqWizard_StepOutFreqOrd"),
      render: ({ bag, setBag }) => {
        const rows = Array.isArray(bag.step4Rows) ? bag.step4Rows : ["", "", "", "", ""];
        const onChangeRow = (idx, val) => {
          const updated = [...rows];
          const valueStr = val === null || typeof val === "undefined" ? "" : String(val);
          updated[idx] = valueStr;
          if (idx === rows.length - 1 && valueStr !== "") {
            updated.push("");
          }
          setBag((prev) => ({ ...prev, step4Rows: updated }));
        };

        return (
          <Stack gap="sm">
            <Text size="sm">
              {TextStore.interface("PeakFlowFreqWizard_EditOutputFreqOrd")}
            </Text>

            <Stack gap="xs">
              {rows.map((value, idx) => (
                <NumberInput
                  key={`freq-${idx}`}
                  label={
                    idx === 0
                      ? TextStore.interface("PeakFlowFreqWizard_FreqInPercent")
                      : undefined
                  }
                  hideControls
                  value={value === "" ? "" : Number(value)}
                  onChange={(v) => onChangeRow(idx, v)}
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
      render: ({ name, description, selectedDataset, bag }) => {
        const freqList = (bag.step4Rows || []).filter((v) => v !== "");
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
              choice={bag.skewChoice}
              regionalSkew={bag.regionalSkew}
              regionalSkewMSE={bag.regionalSkewMSE}
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
                    <Text key={`freq-sum-${idx}`} size="xs">
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

  const buildResult = (ctx) => ({
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
    frequencies: (ctx.bag.step4Rows || []).filter((v) => v !== ""),
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
