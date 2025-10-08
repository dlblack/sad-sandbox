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
} from "../components/steps/FloodTypeClassSteps";
import {
  makeWizardGeneralInfoStep,
  GeneralInfoSummary,
} from "../components/steps/WizardGeneralInfo";

export interface FloodTypeClassAnalysisWizardProps {
  [key: string]: unknown;
}

// Result type of this wizard
interface FloodTypeResult {
  name?: string;
  description?: string;
  selectedDataset: string;
  datasetRef: string;
  flow: {
    timeSeries: string;
    start: { date: string; time: string };
    end: { date: string; time: string };
  };
  classificationPreset: string;
  dataSources: {
    precipTimeSeries: string;
    sweTimeSeries: string;
  };
  thresholds: {
    precipAccumIn: number;
    sweDepletionIn: number;
    snowmeltFrac: number;
    rainFrac: number;
  };
  lookbackDays: number | null;
  results: unknown;
}

export default function FloodTypeClassAnalysisWizard(
    props: FloodTypeClassAnalysisWizardProps
) {
  // IMPORTANT: ensure every step factory returns WizardStep<WizardBag>
  // (see note below for FloodTypeClassSteps typing).
  const steps: WizardStep<WizardBag>[] = [
    makeWizardGeneralInfoStep(),      // general-info as first step
    makeFlowDataSourceStep(),
    makeFloodTypeStep(),
    makeDataSourcesStep(),
    makeLookbackStep(),
    makeThresholdsStep(),
    makeReviewInputsStep({ GeneralInfoSummary }),
    makeResultsStep(),
  ];

  const validateNext = (_ctx: WizardCtx<WizardBag>, _stepIndex: number) => {
    // Add real validation as needed
    return true;
  };

  const buildResult = (ctx: WizardCtx<WizardBag>): FloodTypeResult => {
    const b = ctx.bag as Record<string, unknown>;
    return {
      name: ctx.name,
      description: ctx.description,
      selectedDataset: ctx.selectedDataset || "",
      datasetRef: ctx.selectedDataset || "",
      flow: {
        timeSeries: String(b.flowTimeSeries ?? ""),
        start: {
          date: String(b.classStartDate ?? ""),
          time: String(b.classStartTime ?? ""),
        },
        end: {
          date: String(b.classEndDate ?? ""),
          time: String(b.classEndTime ?? ""),
        },
      },
      classificationPreset: String(b.floodTypePreset ?? ""),
      dataSources: {
        precipTimeSeries: String(b.precipTimeSeries ?? ""),
        sweTimeSeries: String(b.sweTimeSeries ?? ""),
      },
      thresholds: {
        precipAccumIn: Number(b.thrPrecipAccumIn ?? 0),
        sweDepletionIn: Number(b.thrSWEDepletionIn ?? 0),
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
          defaultDatasetKey="Discharge"
      />
  );
}
