import React from "react";
import WizardRunner from "../_shared/WizardRunner";
import { makeWizardGeneralInfoStep } from "../_shared/steps";
import {
  makeScenariosStep,
  makeMarginalDistributionsStep,
  makeContourProbabilitiesStep,
  makeCopulaSelectionStep,
  makeDesignEventsStep,
  makeConditionalSimulationsStep,
} from "./steps";

export interface CopulaAnalysisWizardProps {
  [key: string]: unknown;
}

export default function CopulaAnalysisWizard(props: CopulaAnalysisWizardProps) {
  const steps = [
    makeWizardGeneralInfoStep({ includeDataset: false }),
    makeScenariosStep(),
    makeMarginalDistributionsStep(),
    makeContourProbabilitiesStep(),
    makeCopulaSelectionStep(),
    makeDesignEventsStep(),
    makeConditionalSimulationsStep(),
  ];

  const buildResult = (ctx: any) => ({
    name: ctx.name,
    description: ctx.description,
  });

  return <WizardRunner {...props} steps={steps} buildResult={buildResult} disableDataset />;
}
