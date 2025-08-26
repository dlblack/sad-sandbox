import React from "react";
import GenericWizard from "./GenericWizard.jsx";

export default function PeaksOverThresholdAnalysisWizard(props) {
  const buildResult = (ctx) => ({
    name: ctx.name,
    description: ctx.description,
    selectedDataset: ctx.selectedDataset,
  });

  return (
    <GenericWizard
      {...props}
      includeGeneralInfo
      steps={[]}
      buildResult={buildResult}
      defaultDatasetKey="Discharge"
    />
  );
}
