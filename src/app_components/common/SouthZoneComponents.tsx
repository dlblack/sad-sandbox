import React, { useMemo } from "react";
import ZoneTabs from "./ZoneTabs";
import { Registry } from "../../types/app";
import { COMPONENT_REGISTRY } from "../../registry/componentRegistry";

export interface SouthTab {
    id: string;
    kind: string;
    title: string;
    props?: any;
}

interface SouthZoneProps {
    tabs?: SouthTab[];
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
    closeTab: (id: string) => void;
}

export default function SouthZoneComponents({
                                                tabs = [],
                                                activeId,
                                                setActiveId,
                                                closeTab,
                                            }: SouthZoneProps) {
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
                registry={COMPONENT_REGISTRY as Registry}
            />
            <div className="wizard-tab-body">
                {activeTab ? <ActivePane tab={activeTab} /> : null}
            </div>
        </div>
    );
}

function ActivePane({ tab }: { tab: SouthTab }) {
    const reg = (COMPONENT_REGISTRY as Registry)[tab.kind];
    if (!reg) {
        return null;
    }

    const Cmp = reg.Component;
    return <Cmp {...tab.props} />;
}
