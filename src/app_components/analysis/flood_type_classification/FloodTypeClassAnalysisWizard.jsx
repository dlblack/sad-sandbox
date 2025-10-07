import React from "react";
import WizardRunner from "../components/WizardRunner.jsx";
import {
  makeFlowDataSourceStep,
  makeFloodTypeStep,
  makeDataSourcesStep,
  makeLookbackStep,
  makeThresholdsStep,
  makeReviewInputsStep,
  makeResultsStep,
} from "../components/steps/FloodTypeClassSteps.jsx";
import {
  makeWizardGeneralInfoStep,
  GeneralInfoSummary,
} from "../components/steps/WizardGeneralInfo.jsx";
import { TextStore } from "../../../utils/TextStore.js";

export default function FloodTypeClassAnalysisWizard(props) {
  const {
    timeSeriesOptions = [],
    precipOptions = [],
    sweOptions = [],
  } = props;

  const steps = [
    makeWizardGeneralInfoStep(),
    makeFlowDataSourceStep({ timeSeriesOptions }),
    makeFloodTypeStep(),
    makeDataSourcesStep({ precipOptions, sweOptions }),
    makeLookbackStep(),
    makeThresholdsStep(),
    makeReviewInputsStep({ GeneralInfoSummary }),
    makeResultsStep(),
  ];

  const validateNext = (ctx, stepIndex) => {
    switch (stepIndex) {
      default:
        return true;
    }
  };

  const buildResult = (ctx) => {
    const b = ctx.bag;

    return {
      name: ctx.name,
      description: ctx.description,
      selectedDataset: ctx.selectedDataset || "",
      datasetRef: ctx.selectedDataset || "",
      flow: {
        timeSeries: b.flowTimeSeries || "",
        start: {
          date: b.classStartDate || "",
          time: b.classStartTime || "",
        },
        end: {
          date: b.classEndDate || "",
          time: b.classEndTime || "",
        },
      },
      classificationPreset: b.floodTypePreset || "",
      dataSources: {
        precipTimeSeries: b.precipTimeSeries || "",
        sweTimeSeries: b.sweTimeSeries || "",
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
    <WizardRunner
      {...props}
      steps={steps}
      validateNext={validateNext}
      buildResult={buildResult}
      defaultDatasetKey="Discharge"
      title={TextStore.interface(
        "FloodTypeClass_Wizard_Title"
      )}
    />
  );
}
