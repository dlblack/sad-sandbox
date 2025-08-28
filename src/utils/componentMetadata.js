import { TextStore } from "./TextStore.js";

function dataEditor(entityName) {
  return {
    entityName,
    category: "data editor",
    width: 550,
    height: 550
  };
}

function wizard(entityName) {
  return {
    entityName,
    category: "wizard",
    width: 600,
    height: 600
  };
}

export const componentMetadata = {
  ComponentContent: {
    entityName: "Contents",
    category: "panel",
    width: Math.round(window.innerWidth * 0.15),
    height: Math.round(window.innerHeight * 0.2)
  },
  ComponentMap: {
    entityName: "Map",
    category: "panel",
    width: Math.round(window.innerWidth * 0.3),
    height: Math.round(window.innerHeight * 0.3)
  },
  ComponentMessage: {
    entityName: "Messages",
    category: "panel",
    width: Math.round(window.innerWidth * 0.4),
    height: Math.round(window.innerHeight * 0.2)
  },
  ComponentStyleSelector: {
    entityName: "Style Selector",
    category: "panel",
    width: Math.round(window.innerWidth * 0.2),
    height: Math.round(window.innerHeight * 0.25)
  },
  PairedDataPlot: {
    entityName: "Paired Data Plot",
    width: Math.round(window.innerWidth * 0.5),
    height: Math.round(window.innerHeight * 0.4)
  },
  TimeSeriesPlot: {
    entityName: "Time Series Plot",
    width: Math.round(window.innerWidth * 0.5),
    height: Math.round(window.innerHeight * 0.4)
  },

  // Data editors
  ManualDataEntryEditor: dataEditor(TextStore.interface("ComponentMetadata_ManualDataEntryEditor")),

  // Analysis Wizards
  Bulletin17AnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_Bulletin17AnalysisWizard")),
  PeakFlowFreqWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_PeakFlowFreqWizard")),
  GeneralFreqAnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_GeneralFreqAnalysisWizard")),
  VolumeFreqAnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_VolumeFreqAnalysisWizard")),
  CoincidentFreqAnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_CoincidentFreqAnalysisWizard")),
  CurveCombinationAnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_CurveCombinationAnalysisWizard")),
  BalancedHydrographAnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_BalancedHydrographAnalysisWizard")),
  DistributionFittingAnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_DistributionFittingAnalysisWizard")),
  MixedPopulationAnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_MixedPopulationAnalysisWizard")),
  CorrelationAnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_CorrelationAnalysisWizard")),
  RecordExtensionAnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_RecordExtensionAnalysisWizard")),
  PeaksOverThresholdAnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_PeaksOverThresholdAnalysisWizard")),
  LinearRegressionWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_LinearRegressionWizard")),
  QuantileMappingWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_QuantileMappingWizard")),
  CopulaAnalysisWizard: wizard(TextStore.interface("ComponentMetadata_Wizard_CopulaAnalysisWizard")),

  // Demo Plots
  DemoPlots: { entityName: "Demo Plots (Plotly)", category: "demo", width: 1000, height: 800 },

};

export const DEFAULT_COMPONENT_SIZE = {
  width: Math.round(window.innerWidth * 0.2),
  height: Math.round(window.innerHeight * 0.2)
};
