function dataEditor(entityName) {
  return {
    entityName,
    width: Math.round(window.innerWidth * 0.38),
    height: Math.round(window.innerHeight * 0.7)
  };
}

function wizard(entityName) {
  return {
    entityName,
    width: 600,
    height: 650
  };
}

export const componentMetadata = {
  ComponentContent: { entityName: "Contents", width: `auto`, height: Math.round(window.innerHeight * 0.2) },
  ComponentMap: { entityName: "Map", width: Math.round(window.innerWidth * 0.3), height: Math.round(window.innerHeight * 0.3) },
  ComponentMessage: { entityName: "Messages", width: Math.round(window.innerWidth * 0.4), height: Math.round(window.innerHeight * 0.2) },
  ComponentStyleSelector: { entityName: "Style Selector", width: Math.round(window.innerWidth * 0.2), height: Math.round(window.innerHeight * 0.2) },

  // Data editors
  ManualDataEntryEditor: dataEditor("Manual Data Entry"),

  // Analysis Wizards
  Bulletin17AnalysisWizard: wizard("Bulletin 17 Analysis"),
  PeakFlowFreqWizard: wizard("Peak Flow Frequency"),
  GeneralFreqAnalysisWizard: wizard("General Frequency Analysis"),
  VolumeFreqAnalysisWizard: wizard("Volume Frequency Analysis"),
  CoincidentFreqAnalysisWizard: wizard("Coincident Frequency Analysis"),
  CurveCombinationAnalysisWizard: wizard("Curve Combination Analysis"),
  BalancedHydrographAnalysisWizard: wizard("Balanced Hydrograph Analysis"),
  DistributionFittingAnalysisWizard: wizard("Distribution Fitting Analysis"),
  MixedPopulationAnalysisWizard: wizard("Mixed Population Analysis"),
  CorrelationAnalysisWizard: wizard("Correlation Analysis Wizard"),
  RecordExtensionAnalysisWizard: wizard("Record Extension Analysis"),
  PeaksOverThresholdAnalysisWizard: wizard("Peaks Over Threshold"),
  LinearRegressionWizard: wizard("Linear Regression"),
  QuantileMappingWizard: wizard("Quantile Mapping"),
  CopulaAnalysisWizard: wizard("Copula Analysis"),
};

export const DEFAULT_COMPONENT_SIZE = { width: Math.round(window.innerWidth * 0.1), height: Math.round(window.innerHeight * 0.1) };
