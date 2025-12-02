import React, { useMemo } from "react";
import { COMPONENT_REGISTRY } from "../../registry/componentRegistry";
import type { DataRecord, AnalysesRecord, DataSaveHandler,} from "../../types/appData";

import ZoneTabs from "./ZoneTabs";
import { CenterTab } from "../../types/app";

interface CenterZoneProps {
    tabs: CenterTab[];
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
    closeTab: (id: string) => void;
    data: DataRecord;
    analyses: AnalysesRecord;
    onDataSave: DataSaveHandler;
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
        <div className="wizard-workspace">
            <ZoneTabs
                tabs={tabs}
                activeId={activeId}
                setActiveId={setActiveId}
                closeTab={closeTab}
                registry={COMPONENT_REGISTRY}
            />
            <div className="wizard-tab-body">
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
    data: DataRecord;
    analyses: AnalysesRecord;
    onDataSave: DataSaveHandler;
    onFinish: (type: string, valuesObj: unknown, id?: string) => Promise<void>;
}) {
    const reg = COMPONENT_REGISTRY[tab.kind];
    if (!reg) {
        return null;
    }

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
