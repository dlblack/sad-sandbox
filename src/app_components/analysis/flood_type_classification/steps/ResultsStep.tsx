import React from "react";
import type { WizardStep } from "../../components/WizardRunner";
import { TextStore } from "../../../../utils/TextStore";

const L = (k: string) => TextStore.interface?.(k) ?? "";

export default function makeResultsStep(): WizardStep {
    return {
        label: L("FloodTypeClass_Wizard_StepResults"),
        render: () => <div style={{ padding: 8 }}>{L("FloodTypeClass_Results_Placeholder")}</div>,
    };
}
