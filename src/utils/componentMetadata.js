import { TextStore } from "./TextStore.js";

function dataEditor(entityName) {
  return {
    entityName,
    category: "data editor",
    centerTab: true,
  };
}

function wizard(entityName) {
  return {
    entityName,
    category: "wizard",
    centerTab: true,
  };
}

export const componentMetadata = {
  ComponentProject: {
    entityName: "Project",
    category: "panel",
    centerTab: false,
  },
  ComponentInterfaceOptions: {
    entityName: "Interface Options",
    category: "panel",
    centerTab: false,
  },
  ComponentMap: {
    entityName: "Map",
    category: "panel",
    centerTab: true,
    width: Math.round(window.innerWidth * 0.3),
    height: Math.round(window.innerHeight * 0.3)
  },
  ComponentMessage: {
    entityName: "Messages",
    category: "panel",
    centerTab: false,
  },
  PairedDataPlot: {
    entityName: "Paired Data Plot",
    centerTab: true,
    width: Math.round(window.innerWidth * 0.5),
    height: Math.round(window.innerHeight * 0.4)
  },
  TimeSeriesPlot: {
    entityName: "Time Series Plot",
    centerTab: true,
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
  DemoPlots: {
    entityName: "Demo Plots (Plotly)",
    category: "demo",
    centerTab: true,
  },
  DemoPlotsRecharts: {
    entityName: "Demo Plots (Recharts)",
    category: "demo",
    centerTab: true,
  },
};

export const DEFAULT_COMPONENT_SIZE = {
  width: Math.round(window.innerWidth * 0.2),
  height: Math.round(window.innerHeight * 0.2)
};
