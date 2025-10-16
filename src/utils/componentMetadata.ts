import { TextStore } from "./TextStore";

/** ---------- Types ---------- */
export type ComponentCategory =
    | "panel"
    | "wizard"
    | "data editor"
    | "demo";

export interface ComponentMeta {
  entityName: string;
  category: ComponentCategory;
  /** Should open in the center tab area */
  centerTab: boolean;
  /** Suggested default size for docked panels (optional) */
  width?: number;
  height?: number;
  /** Optional bucket if you later need it */
  // any other fields you already read elsewhere can live here as optional
}

/** Get a safe viewport size even during SSR */
function getViewport(): { w: number; h: number } {
  if (typeof window === "undefined") {
    // sensible defaults for SSR/build
    return { w: 1280, h: 800 };
  }
  return { w: Math.max(window.innerWidth, 320), h: Math.max(window.innerHeight, 240) };
}

/** Helpers to calculate sizes with guards */
function vw(pct: number): number {
  const { w } = getViewport();
  return Math.round(w * pct);
}
function vh(pct: number): number {
  const { h } = getViewport();
  return Math.round(h * pct);
}

/** ---------- Small helpers to define common kinds ---------- */
function dataEditor(entityName: string): ComponentMeta {
  return {
    entityName,
    category: "data editor",
    centerTab: true,
  };
}

function wizard(entityName: string): ComponentMeta {
  return {
    entityName,
    category: "wizard",
    centerTab: true,
  };
}

/** ---------- Registry ---------- */
export const componentMetadata: Record<string, ComponentMeta> = {
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
  },
  ComponentMessage: {
    entityName: "Messages",
    category: "panel",
    centerTab: false,
  },

  PairedDataPlot: {
    entityName: "Paired Data Plot",
    category: "panel",
    centerTab: true,
  },
  TimeSeriesPlot: {
    entityName: "Time Series Plot",
    category: "panel",
    centerTab: true,
  },

  // Data editors
  ManualDataEntryEditor: dataEditor(TextStore.interface("ComponentMetadata_ManualDataEntryEditor")),

  // Analysis Wizards
  Bulletin17AnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_Bulletin17AnalysisWizard")
  ),
  FloodTypeClassAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_FloodTypeClassAnalysisWizard")
  ),
  PeakFlowFreqWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_PeakFlowFreqWizard")
  ),
  GeneralFreqAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_GeneralFreqAnalysisWizard")
  ),
  VolumeFreqAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_VolumeFreqAnalysisWizard")
  ),
  CoincidentFreqAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_CoincidentFreqAnalysisWizard")
  ),
  CurveCombinationAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_CurveCombinationAnalysisWizard")
  ),
  BalancedHydrographAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_BalancedHydrographAnalysisWizard")
  ),
  DistributionFittingAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_DistributionFittingAnalysisWizard")
  ),
  MixedPopulationAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_MixedPopulationAnalysisWizard")
  ),
  CorrelationAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_CorrelationAnalysisWizard")
  ),
  RecordExtensionAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_RecordExtensionAnalysisWizard")
  ),
  PeaksOverThresholdAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_PeaksOverThresholdAnalysisWizard")
  ),
  LinearRegressionWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_LinearRegressionWizard")
  ),
  QuantileMappingWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_QuantileMappingWizard")
  ),
  CopulaAnalysisWizard: wizard(
      TextStore.interface("ComponentMetadata_Wizard_CopulaAnalysisWizard")
  ),

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

/** Default panel size used when a component doesn't specify one */
export const DEFAULT_COMPONENT_SIZE = {
  width: vw(0.20),
  height: vh(0.20),
};
