import React, { useMemo } from "react";
import PeakFlowFreqWizard from "../analysis/peak_flow/PeakFlowFreqWizard.jsx";
import Bulletin17AnalysisWizard from "../analysis/bulletin17/Bulletin17AnalysisWizard.jsx";
import ManualDataEntryEditor from "../data/ManualDataEntryEditor/ManualDataEntryEditor.jsx";
import DemoPlots from "../DemoPlots.jsx";
import DemoPlotsRecharts from "../DemoPlotsRecharts.jsx";
import TimeSeriesPlot from "../TimeSeriesPlot.jsx";
import PairedDataPlot from "../PairedDataPlot.jsx";
import ComponentMap from "../ComponentMap.jsx";
import ZoneTabs from "./ZoneTabs.jsx";
import { TextStore } from "../../utils/TextStore.js";

const REGISTRY = {
  PeakFlowFreqWizard: {
    title: () => TextStore.interface("ComponentMetadata_Wizard_PeakFlowFreqWizard"),
    typeClass: "tab--wizard",
    Component: PeakFlowFreqWizard,
  },
  Bulletin17AnalysisWizard: {
    title: () => TextStore.interface("ComponentMetadata_Wizard_Bulletin17AnalysisWizard"),
    typeClass: "tab--wizard",
    Component: Bulletin17AnalysisWizard,
  },
  ManualDataEntryEditor: {
    title: () => TextStore.interface("ComponentMetadata_ManualDataEntryEditor"),
    typeClass: "tab--editor",
    Component: ManualDataEntryEditor,
  },
  DemoPlots: {
    title: () => "Demo Plots (Plotly)",
    typeClass: "tab--plot",
    Component: DemoPlots,
  },
  DemoPlotsRecharts: {
    title: () => "Demo Plots (Recharts)",
    typeClass: "tab--plot",
    Component: DemoPlotsRecharts,
  },
  TimeSeriesPlot: {
    title: () => "Time Series Plot",
    typeClass: "tab--plot",
    Component: TimeSeriesPlot,
  },
  PairedDataPlot: {
    title: () => "Paired Data Plot",
    typeClass: "tab--plot",
    Component: PairedDataPlot,
  },
  ComponentMap: {
    title: () => TextStore.interface("ComponentMetadata_ComponentMap"),
    typeClass: "tab--panel",
    Component: ComponentMap,
  }
};

export function centerTitle(kind, props) {
  const reg = REGISTRY[kind];
  if (!reg) return kind;
  const t = reg.title;
  return typeof t === "function" ? t(props) : (t || kind);
}

export default function CenterZoneComponents({
                                       tabs,
                                       activeId,
                                       setActiveId,
                                       closeTab,
                                       data,
                                       analyses,
                                     }) {
  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeId) || null,
    [tabs, activeId]
  );

  return (
    <div className="wizard-workspace" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <ZoneTabs tabs={tabs} activeId={activeId} setActiveId={setActiveId} closeTab={closeTab} registry={REGISTRY} />
      <div className="wizard-tab-body" style={{ flex: 1, minHeight: 0 }}>
        {activeTab ? <ActivePane tab={activeTab} closeTab={closeTab} data={data} analyses={analyses} /> : null}
      </div>
    </div>
  );
}

function ActivePane({ tab, closeTab, data, analyses }) {
  const reg = REGISTRY[tab.kind];
  if (!reg) return null;
  const Cmp = reg.Component;
  const onRemove = () => closeTab(tab.id);
  return <Cmp {...tab.props} data={data} analyses={analyses} onRemove={onRemove} />;
}
