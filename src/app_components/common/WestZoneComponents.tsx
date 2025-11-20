import React, { useMemo } from "react";
import ZoneTabs from "./ZoneTabs";
import { Registry } from "../../types/app";
import { COMPONENT_REGISTRY } from "../../registry/componentRegistry";
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

interface WestZoneProps {
    tabs?: WestTab[];
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
    closeTab: (id: string) => void;
    maps: any;
    data: any;
    analyses: any;
    handleOpenComponent: (type: string, props?: any) => void;

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
    onSaveAsNode: SaveAsHandler;
    onRenameNode: RenameHandler;
    onDeleteNode: DeleteHandler;
}) {
    const reg = (COMPONENT_REGISTRY as Registry)[tab.kind];
    if (!reg) {
        return null;
    }

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
