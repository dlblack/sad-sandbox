import React from "react";
import WizardRunner from "../_shared/WizardRunner";
import { makeWizardGeneralInfoStep } from "../_shared/steps/WizardGeneralInfo";
import { makeSkewStep } from "../_shared/steps/WizardSkew";
import { TextStore } from "../../../utils/TextStore";
import {
  makeExpectedProbabilityStep,
  makeOutputFrequenciesStep,
  makePeakFlowSummaryStep,
} from "./steps";

export interface PeakFlowFreqWizardProps {
  [key: string]: unknown;
}

const EXP_PROB = {
  doNotComp: TextStore.interface("PeakFlowFreqWizard_DoNotCompExpProb"),
  comp: TextStore.interface("PeakFlowFreqWizard_CompExpProb"),
};

export default function PeakFlowFreqWizard(props: PeakFlowFreqWizardProps) {
  const steps = [
    makeWizardGeneralInfoStep(),
    makeSkewStep({ allowStation: true, allowWeighted: true, compact: true }),
    makeExpectedProbabilityStep(),
    makeOutputFrequenciesStep(),
    makePeakFlowSummaryStep(),
  ];

  const buildResult = (ctx: any) => ({
    name: ctx.name,
    description: ctx.description,
    selectedDataset: ctx.selectedDataset,
    skewChoiceValue:
      (ctx.bag.skewChoice === "option1" && TextStore.interface("AnalysisWizard_Skew_UseStationSkew")) ||
      (ctx.bag.skewChoice === "option2" && TextStore.interface("AnalysisWizard_Skew_UseWeightedSkew")) ||
      (ctx.bag.skewChoice === "option3" && TextStore.interface("AnalysisWizard_Skew_UseRegionalSkew")) ||
      "",
    regionalSkew: ctx.bag.regionalSkew,
    regionalSkewMSE: ctx.bag.regionalSkewMSE,
    exProbChoice:
      (ctx.bag.exProbChoice === "option1" && EXP_PROB.doNotComp) ||
      (ctx.bag.exProbChoice === "option2" && EXP_PROB.comp) ||
      "",
    frequencies: ((ctx.bag.step4Rows as string[] | undefined) || []).filter((v) => v !== ""),
  });

  return <WizardRunner {...props} steps={steps} buildResult={buildResult} defaultDatasetKey="Discharge" />;
}
