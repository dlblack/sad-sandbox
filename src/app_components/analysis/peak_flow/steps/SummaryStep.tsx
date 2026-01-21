import React from "react";
import { Stack, Text } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import type { WizardStep } from "../../_shared/WizardRunner";
import { GeneralInfoSummary } from "../../_shared/steps/WizardGeneralInfo";
import { SkewSummary } from "../../_shared/steps/WizardSkew";

const EXP_PROB = {
  doNotComp: TextStore.interface("PeakFlowFreqWizard_DoNotCompExpProb"),
  comp: TextStore.interface("PeakFlowFreqWizard_CompExpProb"),
};

export default function makePeakFlowSummaryStep(): WizardStep {
  return {
    label: TextStore.interface("PeakFlowFreqWizard_StepComplete"),
    render: ({ name, description, selectedDataset, bag }: any) => {
      const freqList = ((bag.step4Rows as string[] | undefined) || []).filter((v) => v !== "");
      const exp =
        (bag.exProbChoice === "option1" && EXP_PROB.doNotComp) ||
        (bag.exProbChoice === "option2" && EXP_PROB.comp) ||
        "";

      return (
        <Stack gap="sm">
          <Text size="sm" fw={600}>
            {TextStore.interface("Wizard_Summary_Title")}
          </Text>

          <GeneralInfoSummary name={name} description={description} selectedDataset={selectedDataset} />

          <SkewSummary
            choice={bag.skewChoice as string}
            regionalSkew={bag.regionalSkew as number | string | undefined}
            regionalSkewMSE={bag.regionalSkewMSE as number | string | undefined}
          />

          <div>
            <Text fw={600}>{TextStore.interface("PeakFlowFreqWizard_SummaryExpectedProbability")}</Text>
            <Text size="sm">
              <strong>{TextStore.interface("PeakFlowFreqWizard_SummaryComputation")}</strong> {exp}
            </Text>
          </div>

          <div>
            <Text fw={600}>{TextStore.interface("PeakFlowFreqWizard_SummaryFrequencies")}</Text>
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
  };
}
