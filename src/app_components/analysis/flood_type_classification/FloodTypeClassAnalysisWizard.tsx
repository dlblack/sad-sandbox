import React from "react";
import WizardRunner, {
  WizardBag,
  WizardCtx,
  WizardStep,
} from "../components/WizardRunner";
import {
  makeFlowDataSourceStep,
  makeFloodTypeStep,
  makeDataSourcesStep,
  makeLookbackStep,
  makeThresholdsStep,
  makeReviewInputsStep,
  makeResultsStep,
} from "./FloodTypeClassSteps";
import {
  makeWizardGeneralInfoStep,
  GeneralInfoSummary,
} from "../components/steps/WizardGeneralInfo";

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

export default function FloodTypeClassAnalysisWizard(
    props: FloodTypeClassAnalysisWizardProps
) {
  const steps: WizardStep[] = [
    makeWizardGeneralInfoStep({ includeDataset: false }),
    makeFlowDataSourceStep(),
    makeFloodTypeStep(),
    makeDataSourcesStep(),
    makeLookbackStep(),
    makeThresholdsStep(),
    makeReviewInputsStep({
      GeneralInfoSummary: (p: {
        name?: string;
        description?: string;
        selectedDataset?: string;
      }) => <GeneralInfoSummary {...p} showDataset={false} />,
    }),
    makeResultsStep(),
  ];

  const validateNext = (_ctx: WizardCtx, _stepIndex: number) => {
    return true;
  };

  const buildResult = (ctx: WizardCtx<WizardBag>): FloodTypeResult => {
    const b = ctx.bag as Record<string, unknown>;
    return {
      name: ctx.name,
      description: ctx.description,
      selectedDataset: "",
      thresholds: {
        precipAccumIn: Number(b.thrPrecipAccumIn ?? 0),
        sweAccumIn: Number(b.thrSweAccumIn ?? 0),
        snowmeltFrac: Number(b.thrSnowmeltFrac ?? 0),
        rainFrac: Number(b.thrRainFrac ?? 0),
      },
      lookbackDays:
          b.lookbackDays === "" || b.lookbackDays == null
              ? null
              : Number(b.lookbackDays),
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
