import React from "react";
import ZoneWorkspace from "./ZoneWorkspace";
import { CenterTab } from "../../types/app";
import { getComponentRegistryEntry } from "../../registry/componentRegistry";
import {
  MapItem,
  DataRecord,
  AnalysesRecord,
  SaveAsHandler,
  RenameHandler,
  DeleteHandler,
} from "../../types/appData";

interface WestZoneProps {
  tabs?: CenterTab[];
  activeId: string | null;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  closeTab: (id: string) => void;

  maps: MapItem[];
  data: DataRecord;
  analyses: AnalysesRecord;

  handleOpenComponent: (type: string, props?: Record<string, unknown>) => void;

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
  return (
    <ZoneWorkspace
      tabs={tabs}
      activeId={activeId}
      setActiveId={setActiveId}
      closeTab={closeTab}
      resolveEntry={getComponentRegistryEntry}
      buildExtraProps={(tab) => ({
        maps,
        data,
        analyses,
        handleOpenComponent,
        onSaveAsNode,
        onRenameNode,
        onDeleteNode,
        onRemove: () => closeTab(tab.id),
      })}
    />
  );
}
