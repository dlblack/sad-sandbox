import React, { useMemo } from "react";
import { TextStore } from "../../utils/TextStore";
import ComponentInterfaceOptions from "../ComponentInterfaceOptions.jsx";
import ZoneTabs from "./ZoneTabs.jsx";

const REGISTRY = {
  ComponentInterfaceOptions: {
    title: () => TextStore.interface("ComponentMetadata_ComponentInterfaceOptions"),
    typeClass: "tab--panel",
    Component: ComponentInterfaceOptions
  },
};

export function eastTitle(kind, props) {
  const reg = REGISTRY[kind];
  if (!reg) return kind;
  const t = reg.title;
  return typeof t === "function" ? t(props) : t || kind;
}

export default function EastZoneComponents({
                                             tabs = [],
                                             activeId,
                                             setActiveId,
                                             closeTab
                                            }) {
  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeId) || null,
    [tabs, activeId]
  );
  return (
    <div className="wizard-workspace" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <ZoneTabs tabs={tabs} activeId={activeId} setActiveId={setActiveId} closeTab={closeTab} registry={REGISTRY} />
      <div className="wizard-tab-body" style={{ flex: 1, minHeight: 0 }}>
        {activeTab ? <ActivePane tab={activeTab} /> : null}
      </div>
    </div>
  );
}

function ActivePane({ tab }) {
  const reg = REGISTRY[tab.kind];
  if (!reg) return null;
  const Cmp = reg.Component;
  return <Cmp {...tab.props} />;
}
