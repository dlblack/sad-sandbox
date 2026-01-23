import React from "react";
import ZoneWorkspace from "./ZoneWorkspace";
import { CenterTab } from "../../types/app";
import { getComponentRegistryEntry } from "../../registry/componentRegistry";

interface SouthZoneProps {
  tabs?: CenterTab[];
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
  return (
    <ZoneWorkspace
      tabs={tabs}
      activeId={activeId}
      setActiveId={setActiveId}
      closeTab={closeTab}
      resolveEntry={getComponentRegistryEntry}
    />
  );
}
