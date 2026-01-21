import React from "react";
import { COMPONENT_REGISTRY } from "../../registry/componentRegistry";
import type { AnalysesRecord, DataRecord, DataSaveHandler } from "../../types/appData";
import { CenterTab } from "../../types/app";
import ZoneWorkspace from "./ZoneWorkspace";

interface CenterZoneProps {
  tabs: CenterTab[];
  activeId: string | null;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  closeTab: (id: string) => void;
  data: DataRecord;
  analyses: AnalysesRecord;
  onDataSave: DataSaveHandler;
  onFinish: (type: string, valuesObj: unknown, id?: string) => Promise<void>;
}

export default function CenterZoneComponents({
                                               tabs,
                                               activeId,
                                               setActiveId,
                                               closeTab,
                                               data,
                                               analyses,
                                               onDataSave,
                                               onFinish,
                                             }: CenterZoneProps) {
  return (
    <ZoneWorkspace
      tabs={tabs}
      activeId={activeId}
      setActiveId={setActiveId}
      closeTab={closeTab}
      resolveEntry={(kind) => COMPONENT_REGISTRY[kind]}
      buildExtraProps={(tab) => ({
        type: tab.kind,
        id: tab.id,
        data,
        analyses,
        onRemove: () => closeTab(tab.id),
        onDataSave,
        onFinish,
      })}
    />
  );
}
