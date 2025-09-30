import React from "react";
import WizardRunner from "./components/WizardRunner.jsx";

export default function DistributionFittingAnalysisWizard(props) {
  const buildResult = (ctx) => ({
    name: ctx.name,
    description: ctx.description,
    selectedDataset: ctx.selectedDataset,
  });

  return (
    <WizardRunner
      {...props}
      includeGeneralInfo
      steps={[]}
      buildResult={buildResult}
      defaultDatasetKey="Discharge"
    />
  );
}
