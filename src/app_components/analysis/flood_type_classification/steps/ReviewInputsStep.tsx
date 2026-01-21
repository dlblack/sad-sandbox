import React from "react";
import type { WizardStep, WizardCtx } from "../../_shared/WizardRunner";
import { TextStore } from "../../../../utils/TextStore";

const L = (k: string) => TextStore.interface?.(k) ?? "";

export default function makeReviewInputsStep({
                                               GeneralInfoSummary,
                                             }: {
  GeneralInfoSummary: React.ComponentType<{
    name?: string;
    description?: string;
    selectedDataset?: string;
  }>;
}): WizardStep {
  return {
    label: L("FloodTypeClass_Wizard_StepReview") || "Review",
    render: ({ name, description, selectedDataset, bag }: WizardCtx) => (
      <div style={{ display: "grid", gap: 12, padding: 8 }}>
        <h6 style={{ marginBottom: 12 }}>{L("Wizard_Summary_Title")}</h6>

        <GeneralInfoSummary name={name} description={description} selectedDataset={selectedDataset} />

        <ul style={{ listStyle: "none", paddingLeft: 0, fontSize: 12 }}>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepFlowData_TimeSeries")}</strong>{" "}
            {(bag as any).flowTimeSeries as string}
          </li>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepFlowData_StartDate")}</strong>{" "}
            {(bag as any).classStartDate as string}
          </li>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepFlowData_StartTime")}</strong>{" "}
            {(bag as any).classStartTime as string}
          </li>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepFlowData_EndDate")}</strong>{" "}
            {(bag as any).classEndDate as string}
          </li>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepFlowData_EndTime")}</strong>{" "}
            {(bag as any).classEndTime as string}
          </li>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepFloodTypeClass")}</strong>{" "}
            {(bag as any).floodTypePreset as string}
          </li>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepDataSources_PrecipTS")}</strong>{" "}
            {(bag as any).precipTimeSeries as string}
          </li>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepDataSources_SweTS")}</strong>{" "}
            {(bag as any).sweTimeSeries as string}
          </li>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepThresholds_Precip")}</strong>{" "}
            {(bag as any).thrPrecipAccumIn as string}
          </li>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepThresholds_SWE")}</strong>{" "}
            {(bag as any).thrSWEDepletionIn as string}
          </li>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepThresholds_SnowmeltFrac")}</strong>{" "}
            {(bag as any).thrSnowmeltFrac as string}
          </li>
          <li>
            <strong>{L("FloodTypeClass_Wizard_StepThresholds_RainFrac")}</strong>{" "}
            {(bag as any).thrRainFrac as string}
          </li>
        </ul>
      </div>
    ),
  };
}
