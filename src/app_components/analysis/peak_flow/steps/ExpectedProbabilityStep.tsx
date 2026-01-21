import React from "react";
import { Stack, Radio } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import type { WizardStep } from "../../_shared/WizardRunner";

const EXP_PROB = {
  doNotComp: TextStore.interface("PeakFlowFreqWizard_DoNotCompExpProb"),
  comp: TextStore.interface("PeakFlowFreqWizard_CompExpProb"),
};

export default function makeExpectedProbabilityStep(): WizardStep {
  return {
    label: TextStore.interface("PeakFlowFreqWizard_StepExpProb"),
    render: ({ bag, setBag }: any) => (
      <Stack gap="xs">
        <Radio.Group
          value={(bag.exProbChoice as string) || ""}
          onChange={(val) => setBag((prev: any) => ({ ...prev, exProbChoice: val }))}
          name="step3Radio"
        >
          <Radio label={EXP_PROB.doNotComp} value="option1" />
          <Radio label={EXP_PROB.comp} value="option2" />
        </Radio.Group>
      </Stack>
    ),
  };
}
