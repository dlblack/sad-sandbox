function dataEditor(entityName) {
  return {
    entityName,
    width: 750,
    height: 850
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
  Map: { width: 500, height: 500 },
  // Set the Messages window default width to 40% and default height to 10%
  Messages: { width: Math.round(window.innerWidth * 0.4), height: Math.round(window.innerHeight * 0.1) },

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
