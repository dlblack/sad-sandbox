import React, {useContext} from "react";
import {StyleContext} from "./styles/StyleContext";
import isElectron from "./utils/isElectron";
import Navbar from "./app_components/Navbar.jsx";
import DockableFrame from "./app_components/dockable/DockableFrame";
import useAppData from "./hooks/useAppData";
import useDockableContainers from "./hooks/useDockableContainers";
import useElectronMenus from "./hooks/useElectronMenus";

function App() {
  const {appBackgroundStyle} = useContext(StyleContext);

  // App data (maps, data, analyses)
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

  // Dockable containers + messages, pass appData handlers so they integrate
  const {
    containers, setContainers,
    messages,
    messageType, setMessageType,
    addComponent, removeComponent,
    onDragStart,
    handleWizardFinish: wizardFinishWithMessages,
    handleDeleteNode: deleteNodeWithMessages,
  } = useDockableContainers({
    handleWizardFinish,
    handleDeleteNode,
  });

  // Electron menu (opens components)
  useElectronMenus(addComponent);

  const handleOpenComponent = (type, props = {}) => {
    addComponent(type, {dockZone: "CENTER", ...props});
  };

  return (
    <div
      className={`app-container ${appBackgroundStyle}`}
      style={{height: "100vh", display: "flex", flexDirection: "column"}}
    >
      {!isElectron() && <Navbar addComponent={addComponent}/>}
      <div style={{flex: 1, minHeight: 0}}>
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
          handleOpenComponent={handleOpenComponent}
          onWizardFinish={wizardFinishWithMessages}
          onDataSave={handleDataSave}
        />
      </div>
    </div>
  );
}

export default App;
