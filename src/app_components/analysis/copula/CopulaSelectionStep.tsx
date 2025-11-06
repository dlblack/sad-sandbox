import React from "react";
import { Box, Text } from "@mantine/core";
import { TextStore } from "../../../utils/TextStore";
import { WizardStep, WizardCtx } from "../components/WizardRunner";

export default function makeCopulaSelectionStep(): WizardStep {
    return {
        label: TextStore.interface("Copula_Wizard_StepCopulaSelection"),
        render: (_ctx: WizardCtx) => (
            <Box p="sm">
                <Text size="sm">
                    {TextStore.interface("Copula_Wizard_StepCopulaSelection")}
                </Text>
            </Box>
        ),
    };
}
