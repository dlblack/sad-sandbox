import React, { useMemo } from "react";
import PeakFlowFreqWizard from "../analysis/peak_flow/PeakFlowFreqWizard";
import Bulletin17AnalysisWizard from "../analysis/bulletin17/Bulletin17AnalysisWizard";
import FloodTypeClassAnalysisWizard from "../analysis/flood_type_classification/FloodTypeClassAnalysisWizard";
import ManualDataEntryEditor from "../data/ManualDataEntryEditor/ManualDataEntryEditor";
import DemoPlots from "../plots/DemoPlots";
import DemoPlotsRecharts from "../plots/DemoPlotsRecharts";
import TimeSeriesPlot from "../plots/TimeSeriesPlot";
import PairedDataPlot from "../plots/PairedDataPlot";
import ComponentMap from "../ComponentMap";
import ZoneTabs from "./ZoneTabs";
import { CenterTab, Registry } from "../../types/app";
import { TextStore } from "../../utils/TextStore";

const REGISTRY: Registry = {
    Bulletin17AnalysisWizard: {
        title: () => TextStore.interface("ComponentMetadata_Wizard_Bulletin17AnalysisWizard"),
        typeClass: "tab--wizard",
        Component: Bulletin17AnalysisWizard,
    },
    FloodTypeClassAnalysisWizard: {
        title: () => TextStore.interface("ComponentMetadata_Wizard_FloodTypeClassAnalysisWizard"),
        typeClass: "tab--wizard",
        Component: FloodTypeClassAnalysisWizard,
    },
    PeakFlowFreqWizard: {
        title: () => TextStore.interface("ComponentMetadata_Wizard_PeakFlowFreqWizard"),
        typeClass: "tab--wizard",
        Component: PeakFlowFreqWizard,
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
    },
};

export function centerTitle(kind: string, props?: unknown): string {
    const reg = REGISTRY[kind];
    if (!reg) return kind;
    const t = reg.title;
    return typeof t === "function" ? t(props) : t || kind;
}

interface CenterZoneProps {
    tabs: CenterTab[];
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
    closeTab: (id: string) => void;
    data: unknown;
    analyses: unknown;
    onDataSave: (category: string, valuesObj: unknown) => Promise<void>;
    onFinish: (type: string, valuesObj: unknown, id?: string) => Promise<void>;
}

export default function CenterZoneComponents({
                                                 tabs,
                                                 activeId,
                                                 setActiveId,
                                                 closeTab,
                                                 data,
                                                 analyses,
                                                 onDataSave,
                                                 onFinish,
                                             }: CenterZoneProps) {
    const activeTab = useMemo(
        () => tabs.find((t) => t.id === activeId) || null,
        [tabs, activeId]
    );

    return (
        <div className="wizard-workspace" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <ZoneTabs
                tabs={tabs}
                activeId={activeId}
                setActiveId={setActiveId}
                closeTab={closeTab}
                registry={REGISTRY}
            />
            <div className="wizard-tab-body" style={{ flex: 1, minHeight: 0 }}>
                {activeTab ? (
                    <ActivePane
                        tab={activeTab}
                        closeTab={closeTab}
                        data={data}
                        analyses={analyses}
                        onDataSave={onDataSave}
                        onFinish={onFinish}
                    />
                ) : null}
            </div>
        </div>
    );
}

function ActivePane({
                        tab,
                        closeTab,
                        data,
                        analyses,
                        onDataSave,
                        onFinish,
                    }: {
    tab: CenterTab;
    closeTab: (id: string) => void;
    data: unknown;
    analyses: unknown;
    onDataSave: (category: string, valuesObj: unknown) => Promise<void>;
    onFinish: (type: string, valuesObj: unknown, id?: string) => Promise<void>;
}) {
    const reg = REGISTRY[tab.kind];
    if (!reg) return null;
    const Cmp = reg.Component;
    const onRemove = () => closeTab(tab.id);
    const extraProps = (tab.props ?? {}) as Record<string, unknown>;
    return (
        <Cmp
            {...extraProps}
            type={tab.kind}
            id={tab.id}
            data={data}
            analyses={analyses}
            onRemove={onRemove}
            onDataSave={onDataSave}
            onFinish={onFinish}
        />
    );
}
