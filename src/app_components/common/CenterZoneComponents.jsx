import React, { useMemo } from "react";
import PeakFlowFreqWizard from "../analysis/peak_flow/PeakFlowFreqWizard.jsx";
import Bulletin17AnalysisWizard from "../analysis/bulletin17/Bulletin17AnalysisWizard.jsx";
import ManualDataEntryEditor from "../data/ManualDataEntryEditor/ManualDataEntryEditor.jsx";
import DemoPlots from "../DemoPlots.jsx";
import TimeSeriesPlot from "../TimeSeriesPlot.jsx";
import PairedDataPlot from "../PairedDataPlot.jsx";
import { TextStore } from "../../utils/TextStore.js";
import ComponentMap from "../ComponentMap.jsx";

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
    <div className="wizard-workspace">
      <div className="wizard-tabs-bar">
        {tabs.map((t) => {
          const reg = REGISTRY[t.kind];
          const typeClass = reg?.typeClass || "";
          const isActive = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              className={`wizard-tab ${typeClass}${isActive ? " is-active" : ""}`}
              onClick={() => setActiveId(t.id)}
              title={t.title}
            >
              <span className="wizard-tab-title">{t.title}</span>
              <span
                className="wizard-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(t.id);
                }}
                title={TextStore.interface("CANCEL")}
                aria-label={TextStore.interface("CANCEL")}
              >
                ×
              </span>
            </button>
          );
        })}
      </div>

      <div className="wizard-tab-body">
        {activeTab ? (
          <ActivePane
            tab={activeTab}
            closeTab={closeTab}
            data={data}
            analyses={analyses}
          />
        ) : null}
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
