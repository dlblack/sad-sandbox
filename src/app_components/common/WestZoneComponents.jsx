import React, { useMemo } from "react";
import { TextStore } from "../../utils/TextStore";
import ComponentProject from "../ComponentProject.jsx";
import ZoneTabs from "./ZoneTabs.jsx";

const REGISTRY = {
  ComponentProject: {
    title: () => TextStore.interface("ComponentMetadata_ComponentProject"),
    typeClass: "tab--panel",
    Component: ComponentProject
  }
};

export function westTitle(kind, props) {
  const reg = REGISTRY[kind];
  if (!reg) return kind;
  const t = reg.title;
  return typeof t === "function" ? t(props) : t || kind;
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
                                             onDeleteNode
                                           }) {
  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeId) || null,
    [tabs, activeId]
  );
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
                      onDeleteNode
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
