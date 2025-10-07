import React from "react";
import WizardRunner from "./components/WizardRunner";

type WizardContext = {
  name?: string;
  description?: string;
  selectedDataset?: unknown;
  [key: string]: unknown;
};

export interface CopulaAnalysisWizardProps {
  [key: string]: unknown;
}

export default function CopulaAnalysisWizard(
    props: CopulaAnalysisWizardProps
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
