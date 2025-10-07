import React from "react";
import { Tabs } from "@mantine/core";
import TabCloseButton from "../../ui/TabCloseButton";
import { TextStore } from "../../utils/TextStore";

export interface CenterTab {
    id: string;
    kind: string;
    title: string;
    props?: any;
}

type TitleGetter = ((props?: any) => string) | string;

interface RegistryEntry {
    title: TitleGetter;
    typeClass: string;
    Component: React.ComponentType<any>;
}

interface ZoneTabsProps {
    tabs: CenterTab[];
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
    closeTab: (id: string) => void;
    registry: Record<string, RegistryEntry>;
}

export default function ZoneTabs({
                                     tabs,
                                     activeId,
                                     setActiveId,
                                     closeTab,
                                     registry,
                                 }: ZoneTabsProps) {
    return (
        <>
            <Tabs
                value={activeId}
                onChange={(v) => v && setActiveId(v)}
                keepMounted={false}
                variant="outline"
                radius="sm"
            >
                <Tabs.List>
                    {tabs.map((t) => {
                        const typeClass = registry?.[t.kind]?.typeClass || "";
                        const isActive = t.id === activeId;
                        return (
                            <Tabs.Tab key={t.id} value={t.id} className={typeClass}>
                                <span className="tab-label">{t.title}</span>
                                <TabCloseButton
                                    title={TextStore.interface("CANCEL")}
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        closeTab(t.id);
                                    }}
                                    style={{ marginLeft: 6 }}
                                />
                                {isActive ? <span className="tab-active-accent" /> : null}
                            </Tabs.Tab>
                        );
                    })}
                </Tabs.List>
            </Tabs>

            <style>{`
        .mantine-Tabs-tab{display:inline-flex;align-items:center;gap:8px}
        .tab-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:22ch}
        .tab-active-accent{position:absolute;left:8px;right:8px;bottom:-1px;height:3px;border-radius:3px 3px 0 0;background:#3a82f7}
        .tab--editor .tab-active-accent{background:#f7c23a}
        .tab--plot .tab-active-accent{background:#8bc34a}
        .tab--panel .tab-active-accent{background:#9c27b0}
      `}</style>
        </>
    );
}
