import React, { useMemo } from "react";
import { TextStore } from "../../utils/TextStore";
import ComponentInterfaceOptions from "../ComponentInterfaceOptions";
import ZoneTabs from "./ZoneTabs";
import { Registry } from "../../types/app";

export interface EastTab {
    id: string;
    kind: string;
    title: string;
    props?: any;
}
const REGISTRY: Registry = {
    ComponentInterfaceOptions: {
        title: () => TextStore.interface("ComponentMetadata_ComponentInterfaceOptions"),
        typeClass: "tab--panel",
        Component: ComponentInterfaceOptions,
    },
};

export function eastTitle(kind: string, props?: any): string {
    const reg = REGISTRY[kind];
    if (!reg) return kind;
    const t = reg.title;
    return typeof t === "function" ? t(props) : t || kind;
}

interface EastZoneProps {
    tabs?: EastTab[];
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
    closeTab: (id: string) => void;
}

export default function EastZoneComponents({
                                               tabs = [],
                                               activeId,
                                               setActiveId,
                                               closeTab,
                                           }: EastZoneProps) {
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
                {activeTab ? <ActivePane tab={activeTab} /> : null}
            </div>
        </div>
    );
}

function ActivePane({ tab }: { tab: EastTab }) {
    const reg = REGISTRY[tab.kind];
    if (!reg) return null;
    const Cmp = reg.Component;
    return <Cmp {...tab.props} />;
}
