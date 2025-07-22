import React, { useContext } from "react";
import { StyleContext } from "./styles/StyleContext";
import isElectron from "./utils/isElectron";
import Navbar from "./app_components/navbar";
import DockableFrame from "./app_components/dockable/DockableFrame";
import useAppData from "./hooks/useAppData";
import useDockableContainers from "./hooks/useDockableContainers";
import useElectronMenus from "./hooks/useElectronMenus";

function App() {
  const { appBackgroundStyle } = useContext(StyleContext);

  // App data (analyses, data, maps, data handlers)
  const {
    maps, setMaps, data, setData, analyses, setAnalyses,
    handleSaveAsNode, handleRenameNode, handleDeleteNode,
    handleWizardFinish, handleDataSave
  } = useAppData();

  // Dockable container state and handlers
  const {
    containers, setContainers, messages, setMessages, messageType, setMessageType,
    addComponent, removeComponent, onDragStart
  } = useDockableContainers();

  // Electron menu handlers
  useElectronMenus(addComponent);

  const handleOpenComponent = (type, props = {}) => {
    addComponent(type, { dockZone: "CENTER", ...props });
  }

  return (
    <div className={`app-container ${appBackgroundStyle}`} style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {!isElectron() && <Navbar addComponent={addComponent} />}
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
          onDeleteNode={handleDeleteNode}
          maps={maps}
          data={data}
          analyses={analyses}
          handleOpenComponent={handleOpenComponent}
          onWizardFinish={handleWizardFinish}
          onDataSave={handleDataSave}

        />
      </div>
    </div>
  );
}

export default App;
