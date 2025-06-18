function dataEditor(entityName) {
  return {
    entityName,
    openVerb: "Opened new",
    noun: "editor",
    createVerb: "Created",
    width: 600,
    height: 650
  };
}

function wizard(entityName) {
  return {
    entityName,
    openVerb: "Opened new",
    noun: "wizard",
    createVerb: "Created",
    width: 600,
    height: 650
  };
}

export const componentMetadata = {
  Map: { width: 500, height: 500 },

  // Data editors
  ManualDataEntryEditor: dataEditor("Manual Data Entry"),

  // Analysis Wizards (DRY, via wizard())
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

export const DEFAULT_COMPONENT_SIZE = { width: 300, height: 300 };
