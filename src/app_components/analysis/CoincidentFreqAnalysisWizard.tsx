import React from "react";
import WizardRunner from "./components/WizardRunner";

type WizardContext = {
  name?: string;
  description?: string;
  selectedDataset?: unknown;
  [key: string]: unknown;
};

export interface CoincidentFrequencyAnalysisWizardProps {
  [key: string]: unknown;
}

export default function CoincidentFrequencyAnalysisWizard(
    props: CoincidentFrequencyAnalysisWizardProps
) {
  const buildResult = (ctx: WizardContext) => ({
    name: ctx.name,
    description: ctx.description,
    selectedDataset: ctx.selectedDataset,
  });

  return (
      <WizardRunner
          {...props}
          steps={[]}
          buildResult={buildResult}
          defaultDatasetKey="Discharge"
      />
  );
}
