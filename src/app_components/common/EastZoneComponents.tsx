import React from "react";
import ZoneWorkspace from "./ZoneWorkspace";
import { CenterTab } from "../../types/app";
import { getComponentRegistryEntry } from "../../registry/componentRegistry";

interface EastZoneProps {
  tabs?: CenterTab[];
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
