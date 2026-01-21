import React, { useMemo } from "react";
import ZoneTabs from "./ZoneTabs";
import { CenterTab } from "../../types/app";
import { Registry } from "../../types/app";

type Props = {
  tabs?: CenterTab[];
  activeId: string | null;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  closeTab: (id: string) => void;
  registry?: Registry;
  resolveEntry?: (kind: string) => { Component: React.ComponentType<any> } | undefined;
  buildExtraProps?: (tab: CenterTab) => Record<string, unknown>;
};

export default function ZoneWorkspace({
                                        tabs = [],
                                        activeId,
                                        setActiveId,
                                        closeTab,
                                        registry,
                                        resolveEntry,
                                        buildExtraProps,
                                      }: Props) {
  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeId) || null,
    [tabs, activeId]
  );

  const resolve = useMemo(() => {
    if (resolveEntry) return resolveEntry;
    const reg = registry ?? ({} as Registry);
    return (kind: string) => (reg as any)[kind] as { Component: React.ComponentType<any> } | undefined;
  }, [resolveEntry, registry]);

  return (
    <div className="wizard-workspace">
      <ZoneTabs
        tabs={tabs}
        activeId={activeId}
        setActiveId={setActiveId}
        closeTab={closeTab}
      />
      <div className="wizard-tab-body">
        {activeTab ? (
          <ActivePane tab={activeTab} resolveEntry={resolve} buildExtraProps={buildExtraProps} />
        ) : null}
      </div>
    </div>
  );
}

function ActivePane({
                      tab,
                      resolveEntry,
                      buildExtraProps,
                    }: {
  tab: CenterTab;
  resolveEntry: (kind: string) => { Component: React.ComponentType<any> } | undefined;
  buildExtraProps?: (tab: CenterTab) => Record<string, unknown>;
}) {
  const reg = resolveEntry(tab.kind);
  if (!reg) return null;

  const Cmp = reg.Component;
  const baseProps = (tab.props ?? {}) as Record<string, unknown>;
  const extraProps = buildExtraProps ? buildExtraProps(tab) : {};
  const props = { ...baseProps, ...extraProps };

  return <Cmp {...props} />;
}
