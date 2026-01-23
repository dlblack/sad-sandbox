import React from "react";
import { CloseButton, Tabs } from "@mantine/core";
import { TextStore } from "../../utils/TextStore";
import { CenterTab } from "../../types/app";
import { getComponentRegistryEntry } from "../../registry/componentRegistry";

interface ZoneTabsProps {
  tabs: CenterTab[];
  activeId: string | null;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  closeTab: (id: string) => void;
}

export default function ZoneTabs({
                                   tabs,
                                   activeId,
                                   setActiveId,
                                   closeTab,
                                 }: ZoneTabsProps) {
  return (
    <Tabs
      value={activeId}
      onChange={(v) => v && setActiveId(v)}
      keepMounted={false}
      variant="outline"
      radius="sm"
    >
      <Tabs.List>
        {tabs.map((t) => {
          const entry = getComponentRegistryEntry(t.kind);
          const categoryClass = entry?.componentType || "";
          const isActive = t.id === activeId;

          return (
            <Tabs.Tab
              key={t.id}
              value={t.id}
              className={categoryClass}
              rightSection={
                <CloseButton
                  component="div"
                  size="xs"
                  aria-label="Close tab"
                  title={TextStore.interface("CANCEL")}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    closeTab(t.id);
                  }}
                />
              }
            >
              <span className="tab-label">{t.title}</span>
              {isActive ? <span className="tab-active-accent" /> : null}
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
    </Tabs>
  );
}
