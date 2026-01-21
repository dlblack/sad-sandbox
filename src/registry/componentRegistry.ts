import ComponentProject from "../app_components/ComponentProject";
import Bulletin17AnalysisWizard from "../app_components/analysis/bulletin17/Bulletin17AnalysisWizard";
import CopulaAnalysisWizard from "../app_components/analysis/copula/CopulaAnalysisWizard";
import FloodTypeClassAnalysisWizard from "../app_components/analysis/flood_type_classification/FloodTypeClassAnalysisWizard";
import PeakFlowFreqWizard from "../app_components/analysis/peak_flow/PeakFlowFreqWizard";
import ManualDataEntryEditor from "../app_components/data/ManualDataEntryEditor/ManualDataEntryEditor";
import UsgsDataImporter from "../app_components/data/UsgsDataImporter/UsgsDataImporter";
import DemoPlots from "../app_components/plots/DemoPlots";
import DemoPlotsRecharts from "../app_components/plots/DemoPlotsRecharts";
import TimeSeriesPlot from "../app_components/plots/TimeSeriesPlot";
import PairedDataPlot from "../app_components/plots/PairedDataPlot";
import ComponentMap from "../app_components/ComponentMap";
import { Registry, RegistryEntry } from "../types/app";
import { TextStore } from "../utils/TextStore";
import ComponentInterfaceOptions from "../app_components/ComponentInterfaceOptions";
import ComponentPlotStyle from "../app_components/ComponentPlotStyle";
import ComponentMessage from "../app_components/ComponentMessage";

export const COMPONENT_REGISTRY: Registry = {
  ComponentProject: {
    label: () => TextStore.interface("Navbar_Tools_Project"),
    menuGroup: "toolMenu",
    Component: ComponentProject,
    centerTab: false,
    componentType: "panel",
    singleton: true,
  },
  ComponentMessage: {
    label: () => TextStore.interface("Navbar_Tools_Messages"),
    menuGroup: "toolMenu",
    Component: ComponentMessage,
    centerTab: false,
    componentType: "panel",
    singleton: true,
  },
  ComponentInterfaceOptions: {
    label: () => TextStore.interface("Navbar_Tools_View_InterfaceSize"),
    menuGroup: "toolMenu",
    Component: ComponentInterfaceOptions,
    centerTab: false,
    componentType: "panel",
    singleton: true,
  },
  ComponentPlotStyle: {
    label: () => TextStore.interface("Navbar_Tools_View_PlotStyle"),
    menuGroup: "toolMenu",
    Component: ComponentPlotStyle,
    centerTab: false,
    componentType: "panel",
    singleton: true,
  },

  // Analysis wizards
  Bulletin17AnalysisWizard: {
    label: () =>
      TextStore.interface("ComponentRegistry_Wizard_Bulletin17AnalysisWizard"),
    menuGroup: "analysisMenu",
    Component: Bulletin17AnalysisWizard,
    centerTab: true,
    componentType: "wizard",
    singleton: true,
  },
  CopulaAnalysisWizard: {
    label: () =>
      TextStore.interface("ComponentRegistry_Wizard_CopulaAnalysisWizard"),
    menuGroup: "analysisMenu",
    Component: CopulaAnalysisWizard,
    centerTab: true,
    componentType: "wizard",
    singleton: true,
  },
  FloodTypeClassAnalysisWizard: {
    label: () =>
      TextStore.interface(
        "ComponentRegistry_Wizard_FloodTypeClassAnalysisWizard"
      ),
    menuGroup: "analysisMenu",
    Component: FloodTypeClassAnalysisWizard,
    centerTab: true,
    componentType: "wizard",
    singleton: true,
  },
  PeakFlowFreqWizard: {
    label: () =>
      TextStore.interface("ComponentRegistry_Wizard_PeakFlowFreqWizard"),
    menuGroup: "analysisMenu",
    Component: PeakFlowFreqWizard,
    centerTab: true,
    componentType: "wizard",
    singleton: true,
  },

  // Data editor
  ManualDataEntryEditor: {
    label: () => TextStore.interface("ComponentRegistry_ManualDataEntryEditor"),
    menuGroup: "tab--editor",
    Component: ManualDataEntryEditor,
    centerTab: true,
    componentType: "data editor",
    singleton: true,
  },
  UsgsDataImporter: {
    label: () => TextStore.interface("ComponentRegistry_UsgsDataImporter"),
    menuGroup: "tab--editor",
    Component: UsgsDataImporter,
    centerTab: true,
    componentType: "data editor",
    singleton: true,
  },

  // Help / demo plots
  DemoPlots: {
    label: () => "Demo Plots (Plotly)",
    menuGroup: "helpMenu",
    Component: DemoPlots,
    centerTab: true,
    componentType: "panel",
    singleton: true,
  },
  DemoPlotsRecharts: {
    label: () => "Demo Plots (Recharts)",
    menuGroup: "helpMenu",
    Component: DemoPlotsRecharts,
    centerTab: true,
    componentType: "panel",
    singleton: true,
  },

  // General plots
  TimeSeriesPlot: {
    label: () => "Time Series Plot",
    menuGroup: "tab--plot",
    Component: TimeSeriesPlot,
    centerTab: true,
    componentType: "panel",
    singleton: false,
  },
  PairedDataPlot: {
    label: () => "Paired Data Plot",
    menuGroup: "tab--plot",
    Component: PairedDataPlot,
    centerTab: true,
    componentType: "panel",
    singleton: false,
  },

  // Map
  ComponentMap: {
    label: () => TextStore.interface("ComponentRegistry_ComponentMap"),
    menuGroup: "tab--panel",
    Component: ComponentMap,
    centerTab: true,
    componentType: "panel",
    singleton: true,
  },
};

export function getComponentRegistryEntry(
  type: string
): RegistryEntry | undefined {
  const map = COMPONENT_REGISTRY as Record<string, RegistryEntry>;
  return map[type];
}

export function getComponentLabel(
  type: string,
  props?: Record<string, unknown>
): string {
  const entry = getComponentRegistryEntry(type);
  if (!entry) return type;
  const label = entry.label;
  return typeof label === "function" ? label(props) : label;
}

export function getToolDefs(): { key: string; entry: RegistryEntry }[] {
  const list: { key: string; entry: RegistryEntry }[] = [];
  const map = COMPONENT_REGISTRY as Record<string, RegistryEntry>;
  Object.keys(map).forEach((key) => {
    const entry = map[key];
    if (entry.menuGroup === "toolMenu") {
      list.push({ key, entry });
    }
  });
  return list;
}

export function getHelpDefs(): { key: string; entry: RegistryEntry }[] {
  const list: { key: string; entry: RegistryEntry }[] = [];
  const map = COMPONENT_REGISTRY as Record<string, RegistryEntry>;
  Object.keys(map).forEach((key) => {
    const entry = map[key];
    if (entry.menuGroup === "helpMenu") {
      list.push({ key, entry });
    }
  });
  return list;
}

export function getAnalysisWizardDefs(): {
  key: string;
  entry: RegistryEntry;
}[] {
  const list: { key: string; entry: RegistryEntry }[] = [];
  const map = COMPONENT_REGISTRY as Record<string, RegistryEntry>;
  Object.keys(map).forEach((key: string) => {
    const entry = map[key];
    if (entry.menuGroup === "analysisMenu") {
      list.push({ key, entry });
    }
  });
  return list;
}

/** Get a safe viewport size even during SSR */
function getViewport(): { w: number; h: number } {
  if (typeof window === "undefined") {
    return { w: 1280, h: 800 };
  }
  return {
    w: Math.max(window.innerWidth, 320),
    h: Math.max(window.innerHeight, 240),
  };
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

/** Default panel size used when a component doesn't specify one */
export const DEFAULT_COMPONENT_SIZE = {
  width: vw(0.2),
  height: vh(0.2),
};
