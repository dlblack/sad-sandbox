import React, { useMemo } from "react";
import { TextStore } from "../../utils/TextStore";
import ComponentProject from "../ComponentProject";
import ZoneTabs from "./ZoneTabs";
import { Registry } from "../../types/app";
import {
    SaveAsHandler,
    RenameHandler,
    DeleteHandler,
} from "../../types/treeActions";

export interface WestTab {
    id: string;
    kind: string;
    title: string;
    props?: any;
}

const REGISTRY: Registry = {
    ComponentProject: {
        title: () => TextStore.interface("ComponentMetadata_ComponentProject"),
        typeClass: "tab--panel",
        Component: ComponentProject,
    },
};

export function westTitle(kind: string, props?: any): string {
    const reg = REGISTRY[kind];
    if (!reg) return kind;
    const t = reg.title;
    return typeof t === "function" ? t(props) : t || kind;
}

interface WestZoneProps {
    tabs?: WestTab[];
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
    closeTab: (id: string) => void;
    maps: any;
    data: any;
    analyses: any;
    handleOpenComponent: (type: string, props?: any) => void;

    // Accept *either* object-style or positional handlers (union types)
    onSaveAsNode: SaveAsHandler;
    onRenameNode: RenameHandler;
    onDeleteNode: DeleteHandler;
}

export default function WestZoneComponents({
                                               tabs = [],
                                               activeId,
                                               setActiveId,
                                               closeTab,
                                               maps,
                                               data,
                                               analyses,
                                               handleOpenComponent,
                                               onSaveAsNode,
                                               onRenameNode,
                                               onDeleteNode,
                                           }: WestZoneProps) {
    const activeTab = useMemo(() => tabs.find((t) => t.id === activeId) || null, [tabs, activeId]);

    return (
        <div className="wizard-workspace" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <ZoneTabs tabs={tabs} activeId={activeId} setActiveId={setActiveId} closeTab={closeTab} registry={REGISTRY} />
            <div className="wizard-tab-body" style={{ flex: 1, minHeight: 0 }}>
                {activeTab ? (
                    <ActivePane
                        tab={activeTab}
                        maps={maps}
                        data={data}
                        analyses={analyses}
                        handleOpenComponent={handleOpenComponent}
                        onSaveAsNode={onSaveAsNode}
                        onRenameNode={onRenameNode}
                        onDeleteNode={onDeleteNode}
                    />
                ) : null}
            </div>
        </div>
    );
}

function ActivePane({
                        tab,
                        maps,
                        data,
                        analyses,
                        handleOpenComponent,
                        onSaveAsNode,
                        onRenameNode,
                        onDeleteNode,
                    }: {
    tab: WestTab;
    maps: any;
    data: any;
    analyses: any;
    handleOpenComponent: (type: string, props?: any) => void;

    // Keep union types to match parent props and downstream consumers
    onSaveAsNode: SaveAsHandler;
    onRenameNode: RenameHandler;
    onDeleteNode: DeleteHandler;
}) {
    const reg = REGISTRY[tab.kind];
    if (!reg) return null;
    const Cmp = reg.Component;
    return (
        <Cmp
            {...tab.props}
            maps={maps}
            data={data}
            analyses={analyses}
            handleOpenComponent={handleOpenComponent}
            onSaveAsNode={onSaveAsNode}
            onRenameNode={onRenameNode}
            onDeleteNode={onDeleteNode}
        />
    );
}
