import React from "react";
import { Box, Text } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import type { WizardStep, WizardCtx } from "../../_shared/WizardRunner";

export default function makeConditionalSimulationsStep(): WizardStep {
  return {
    label: TextStore.interface("Copula_Wizard_StepCondSims"),
    render: (_ctx: WizardCtx) => (
      <Box p="sm">
        <Text size="sm">{TextStore.interface("Copula_Wizard_StepCondSims")}</Text>
      </Box>
    ),
  };
}
