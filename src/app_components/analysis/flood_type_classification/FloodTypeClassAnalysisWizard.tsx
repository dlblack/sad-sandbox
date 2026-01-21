import React from "react";
import WizardRunner, { WizardBag, WizardCtx, WizardStep } from "../_shared/WizardRunner";
import { makeWizardGeneralInfoStep, GeneralInfoSummary } from "../_shared/steps/WizardGeneralInfo";
import {
  makeFlowDataSourceStep,
  makeFloodTypeStep,
  makeDataSourcesStep,
  makeLookbackStep,
  makeThresholdsStep,
  makeReviewInputsStep,
  makeResultsStep,
} from "./steps";

type FloodTypeResult = {
  name?: string;
  description?: string;
  selectedDataset?: string;
  thresholds: {
    precipAccumIn: number;
    sweAccumIn: number;
    snowmeltFrac: number;
    rainFrac: number;
  };
  lookbackDays: number | null;
  results: unknown;
};

export interface FloodTypeClassAnalysisWizardProps {
  [key: string]: unknown;
}

export default function FloodTypeClassAnalysisWizard(props: FloodTypeClassAnalysisWizardProps) {
  const steps: WizardStep[] = [
    makeWizardGeneralInfoStep({ includeDataset: false }),
    makeFlowDataSourceStep(),
    makeFloodTypeStep(),
    makeDataSourcesStep(),
    makeLookbackStep(),
    makeThresholdsStep(),
    makeReviewInputsStep({
      GeneralInfoSummary: (p: { name?: string; description?: string; selectedDataset?: string }) => (
        <GeneralInfoSummary {...p} showDataset={false} />
      ),
    }),
    makeResultsStep(),
  ];

  const validateNext = (_ctx: WizardCtx, _stepIndex: number) => true;

  const buildResult = (ctx: WizardCtx<WizardBag>): FloodTypeResult => {
    const b = ctx.bag as Record<string, unknown>;
    const flowDays = b.flowLookbackDays;
    const lookbackDays =
      flowDays === "" || flowDays == null ? null : Number(flowDays);

    return {
      name: ctx.name,
      description: ctx.description,
      selectedDataset: "",
      thresholds: {
        precipAccumIn: Number(b.thrPrecipAccumIn ?? 0),
        sweAccumIn: Number(b.thrSWEDepletionIn ?? 0),
        snowmeltFrac: Number(b.thrSnowmeltFrac ?? 0),
        rainFrac: Number(b.thrRainFrac ?? 0),
      },
      lookbackDays,
      results: null,
    };
  };

  return (
    <WizardRunner<WizardBag, FloodTypeResult>
      {...props}
      steps={steps}
      validateNext={validateNext}
      buildResult={buildResult}
      disableDataset
    />
  );
}
