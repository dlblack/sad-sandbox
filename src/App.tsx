import React from "react";
import isElectron from "./utils/isElectron";
import Navbar from "./app_components/Navbar";
import DockableFrame from "./app_components/dockable/DockableFrame";
import { useAppData } from "./hooks/useAppData";
import useDockableContainers from "./hooks/useDockableContainers";
import { useDockZoneTabs } from "./hooks/useDockZoneTabs";
import useElectronMenus from "./hooks/useElectronMenus";
import { useSouthZoneTabs } from "./hooks/useSouthZoneTabs";
import { useZoneTabs } from "./hooks/useZoneTabs";
import { useCenterTabs } from "./hooks/useCenterTabs";
import { openWizard } from "./utils/wizardBus";
import CenterZoneComponents from "./app_components/common/CenterZoneComponents";
import EastZoneComponents from "./app_components/common/EastZoneComponents";
import SouthZoneComponents from "./app_components/common/SouthZoneComponents";
import WestZoneComponents from "./app_components/common/WestZoneComponents";
import { getComponentRegistryEntry } from "./registry/componentRegistry";
import GlobalFileModals from "./app_components/GlobalFileModals";
import { DeleteArgs, SectionKey } from "./types/appData";

function App() {
  const {
    maps,
    data,
    analyses,
    handleSaveAsNode,
    handleRenameNode,
    handleDeleteNode,
    handleWizardFinish,
    handleDataSave,
  } = useAppData();

  const {
    containers,
    setContainers,
    messages,
    messageType,
    setMessageType,
    addComponent,
    removeComponent,
    onDragStart,
    handleWizardFinish: wizardFinishWithMessages,
    handleDeleteNode: deleteNodeWithMessages,
    logCenterOpened,
    logCenterClosed,
    logCenterAlreadyOpen,
  } = useDockableContainers({
    handleWizardFinish,
    handleDeleteNode: async (
      section: SectionKey,
      pathArr: [number] | [string, number],
      name?: string
    ) => {
      const resolved = await handleDeleteNode({ section, pathArr } as DeleteArgs);
      return resolved ?? name ?? null;
    },
  });

  const { tabs, activeId, setActiveId, closeTab } = useCenterTabs({
    logOpened: logCenterOpened,
    logClosed: logCenterClosed,
    logAlreadyOpen: logCenterAlreadyOpen,
  });

  const isCenterTab = (type: string) => {
    return getComponentRegistryEntry(type)?.centerTab === true;
  };

  const openComponent = (type: string, props: Record<string, unknown> = {}) => {
    if (isCenterTab(type)) {
      openWizard(type, props);
      return;
    }
    addComponent(type, { props });
  };

  useElectronMenus(openComponent);

  const westTabs = useDockZoneTabs(containers, "W");
  const { activeId: activeWestId, setActiveId: setActiveWestId, closeTab: closeWestTab } =
    useZoneTabs(westTabs, removeComponent);

  const eastTabs = useDockZoneTabs(containers, "E");
  const { activeId: activeEastId, setActiveId: setActiveEastId, closeTab: closeEastTab } =
    useZoneTabs(eastTabs, removeComponent);

  const southTabs = useSouthZoneTabs(containers, messages, removeComponent);
  const { activeId: activeSouthId, setActiveId: setActiveSouthId, closeTab: closeSouthTab } =
    useZoneTabs(southTabs, removeComponent);

  return (
    <div className="app-container">
      {!isElectron() && <Navbar addComponent={openComponent} />}

      <GlobalFileModals />

      <div style={{ flex: 1, minHeight: 0 }}>
        <DockableFrame
          containers={containers}
          setContainers={setContainers}
          removeComponent={removeComponent}
          onDragStart={onDragStart}
          messages={messages}
          messageType={messageType}
          setMessageType={setMessageType}
          onSaveAsNode={handleSaveAsNode}
          onRenameNode={handleRenameNode}
          onDeleteNode={deleteNodeWithMessages}
          maps={maps}
          data={data}
          analyses={analyses}
          handleOpenComponent={openComponent}
          onWizardFinish={wizardFinishWithMessages}
          onDataSave={handleDataSave}
          centerContent={
            <CenterZoneComponents
              tabs={tabs}
              activeId={activeId}
              setActiveId={setActiveId}
              closeTab={closeTab}
              data={data}
              analyses={analyses}
              onDataSave={handleDataSave}
              onFinish={wizardFinishWithMessages}
            />
          }
          westContent={
            <WestZoneComponents
              tabs={westTabs}
              activeId={activeWestId}
              setActiveId={setActiveWestId}
              closeTab={closeWestTab}
              maps={maps}
              data={data}
              analyses={analyses}
              handleOpenComponent={openComponent}
              onSaveAsNode={handleSaveAsNode}
              onRenameNode={handleRenameNode}
              onDeleteNode={deleteNodeWithMessages}
            />
          }
          southContent={
            <SouthZoneComponents
              tabs={southTabs}
              activeId={activeSouthId}
              setActiveId={setActiveSouthId}
              closeTab={closeSouthTab}
            />
          }
          eastContent={
            <EastZoneComponents
              tabs={eastTabs}
              activeId={activeEastId}
              setActiveId={setActiveEastId}
              closeTab={closeEastTab}
            />
          }
        />
      </div>
    </div>
  );
}

export default App;
