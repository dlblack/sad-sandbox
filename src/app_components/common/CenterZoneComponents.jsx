import React, { useMemo, useRef, useState, useLayoutEffect, useEffect } from "react";
import PeakFlowFreqWizard from "../analysis/peak_flow/PeakFlowFreqWizard.jsx";
import Bulletin17AnalysisWizard from "../analysis/bulletin17/Bulletin17AnalysisWizard.jsx";
import ManualDataEntryEditor from "../data/ManualDataEntryEditor/ManualDataEntryEditor.jsx";
import DemoPlots from "../DemoPlots.jsx";
import DemoPlotsRecharts from "../DemoPlotsRecharts.jsx";
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
    <div className="wizard-workspace">
      <TabStrip
        tabs={tabs}
        activeId={activeId}
        setActiveId={setActiveId}
        closeTab={closeTab}
      />

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

/* ---------- single-row TabStrip with overflow dropdown ---------- */
function TabStrip({ tabs, activeId, setActiveId, closeTab }) {
  const barRef = useRef(null);
  const rowRef = useRef(null);
  const measureRef = useRef(null);

  const [visibleIds, setVisibleIds] = useState(tabs.map(t => t.id));
  const [overflowOpen, setOverflowOpen] = useState(false);

  useLayoutEffect(() => { computeVisible(); }, [tabs, activeId]);

  useEffect(() => {
    const bar = barRef.current;
    const row = rowRef.current;
    if (!bar || !row || typeof ResizeObserver === "undefined") return;

    let raf = null;
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { computeVisible(); raf = null; });
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(bar);
    ro.observe(row);

    return () => { if (raf) cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  function computeVisible() {
    const bar = barRef.current;
    const row = rowRef.current;
    const meas = measureRef.current;
    if (!bar || !row || !meas) return;

    // measure all tab widths from the hidden measurer
    const nodes = Array.from(meas.querySelectorAll("[data-tabid]"));
    const widths = nodes.map(n => ({ id: n.getAttribute("data-tabid"), w: n.offsetWidth }));

    // the actual width available for tabs (the row flexes to fill what's left)
    const containerW = Math.max(0, row.clientWidth);

    // row gap must match CSS
    const rcs = getComputedStyle(row);
    const gap = parseFloat(rcs.gap || rcs.columnGap || "0");

    let used = 0;
    const fit = [];
    widths.forEach(({ id, w }, idx) => {
      const need = w + (idx > 0 ? gap : 0);
      if (used + need <= containerW) { fit.push(id); used += need; }
    });

    // If everything fits, just ensure the active tab is visible if possible.
    if (fit.length === widths.length) {
      if (activeId && !fit.includes(activeId) && fit.length > 0) {
        fit[fit.length - 1] = activeId;
      }
      setVisibleIds(fit.length ? fit : (widths[0] ? [widths[0].id] : []));
      return;
    }

    // If not everything fits, try to keep the active one visible by swapping it in at the end.
    if (fit.length === 0 && widths[0]) fit.push(widths[0].id);
    if (activeId && !fit.includes(activeId)) {
      if (fit.length > 0) fit[fit.length - 1] = activeId;
      else fit.push(activeId);
    }

    setVisibleIds(fit);
  }

  const visibleTabs = tabs.filter(t => visibleIds.includes(t.id));
  const overflowTabs = tabs.filter(t => !visibleIds.includes(t.id));

  useEffect(() => {
    if (!overflowOpen) return;
    const onDoc = (e) => { if (!barRef.current?.contains(e.target)) setOverflowOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [overflowOpen]);

  return (
    <>
      {/* hidden measurer: same DOM for accurate widths */}
      <div className="tabs-measure" ref={measureRef} aria-hidden>
        <div className="tabs-row">
          {tabs.map((t) => {
            const reg = REGISTRY[t.kind]; const typeClass = reg?.typeClass || "";
            return (
              <button
                key={`m-${t.id}`}
                type="button"
                data-tabid={t.id}
                className={`wizard-tab ${typeClass}`}
                title={t.title}
              >
                <span className="wizard-tab-title">{t.title}</span>
                <span className="wizard-tab-close">×</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* real bar: flex row with the overflow control IN FLOW */}
      <div className="wizard-tabs-bar" ref={barRef}>
        <div className="tabs-row" ref={rowRef}>
          {visibleTabs.map((t) => {
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
                  onClick={(e) => { e.stopPropagation(); closeTab(t.id); }}
                  title={TextStore.interface("CANCEL")}
                  aria-label={TextStore.interface("CANCEL")}
                >
                  ×
                </span>
              </button>
            );
          })}
        </div>

        <div className="tabs-overflow">
          {overflowTabs.length > 0 && (
            <div className="tabs-overflow-wrap">
              <button
                type="button"
                className="tabs-overflow-btn"
                onClick={() => setOverflowOpen(v => !v)}
                aria-expanded={overflowOpen}
                aria-haspopup="menu"
                title={TextStore.interface("MORE") || "More"}
              >
                ☰
              </button>
              {overflowOpen && (
                <div className="tabs-overflow-menu" role="menu">
                  {overflowTabs.map((t) => (
                    <div key={t.id} className="tabs-overflow-item" role="menuitem">
                      <button
                        className="tabs-overflow-item-btn"
                        onClick={() => { setActiveId(t.id); setOverflowOpen(false); }}
                        title={t.title}
                      >
                        <span className="tabs-overflow-item-title">{t.title}</span>
                      </button>
                      <button
                        className="tabs-overflow-item-close"
                        onClick={() => closeTab(t.id)}
                        aria-label={TextStore.interface("CANCEL")}
                        title={TextStore.interface("CANCEL")}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
