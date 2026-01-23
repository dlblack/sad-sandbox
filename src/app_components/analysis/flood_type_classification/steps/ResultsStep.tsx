import React from "react";
import type { WizardStep } from "../../_shared/WizardRunner";
import { TextStore } from "../../../../utils/TextStore";

const L = (k: string) => TextStore.interface?.(k) ?? "";

export default function makeResultsStep(): WizardStep {
  return {
    label: L("FloodTypeClass_Wizard_StepResults") || "Results",
    render: () => <div style={{ padding: 8 }}>{L("FloodTypeClass_Results_Placeholder")}</div>,
  };
}
