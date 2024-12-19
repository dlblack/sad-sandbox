import React, { useState } from "react";
import { StyleProvider } from "./styles/StyleContext";
import Navbar from "./app_components/navbar";
import ToolbarContainer from "./app_components/toolbars/ToolbarContainer";
import Divider from "./app_components/toolbars/Divider";
import DockableFrame from "./app_components/dockable/DockableFrame";

function App() {
  const [standardToolbarVisible, setStandardToolbarVisible] = useState(true);
  const [clipboardToolbarVisible, setClipboardToolbarVisible] = useState(true);
  const [mapsToolbarVisible, setMapsToolbarVisible] = useState(true);
  const [dssVueToolbarVisible, setDssVueToolbarVisible] = useState(true);

  const [containers, setContainers] = useState({
    Project: { x: 10, y: 10, width: 300, height: 300, type: "Project" },
    ComponentEditor: { x: 320, y: 10, width: 400, height: 300, type: "ComponentEditor" },
    Map: { x: 730, y: 10, width: 500, height: 500, type: "Map" },
    Messages: { x: 10, y: 320, width: 1020, height: 200, type: "Messages" },
  });

  const toggleStandardToolbar = () => setStandardToolbarVisible((prev) => !prev);
  const toggleClipboardToolbar = () => setClipboardToolbarVisible((prev) => !prev);
  const toggleMapsToolbar = () => setMapsToolbarVisible((prev) => !prev);
  const toggleDssVueToolbar = () => setDssVueToolbarVisible((prev) => !prev);

  const addComponent = (type) => {
    const existingKey = Object.keys(containers).find(
      (key) => containers[key].type === type
    );

    if (existingKey) {
      alert(`${type} is already open.`);
      return;
    }

    const newComponentId = `${type}-${Date.now()}`;
    const newComponent = {
      [newComponentId]: {
        x: 100,
        y: 100,
        width: type === "Map" ? 500 : 300,
        height: type === "Map" ? 500 : 300,
        type,
      },
    };

    setContainers((prev) => ({ ...prev, ...newComponent }));
  };

  const removeComponent = (id) => {
    setContainers((prev) => {
      const updatedContainers = { ...prev };
      delete updatedContainers[id];
      return updatedContainers;
    });
  };

  return (
    <StyleProvider>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <div>
          <Navbar
            toggleStandardToolbar={toggleStandardToolbar}
            toggleClipboardToolbar={toggleClipboardToolbar}
            toggleMapsToolbar={toggleMapsToolbar}
            toggleDssVueToolbar={toggleDssVueToolbar}
            isStandardToolbarDisplayed={standardToolbarVisible}
            isClipboardToolbarDisplayed={clipboardToolbarVisible}
            isMapsToolbarDisplayed={mapsToolbarVisible}
            isDssVueToolbarDisplayed={dssVueToolbarVisible}
            addComponent={addComponent}
          />
          <div style={{ display: "flex", alignItems: "stretch" }}>
            <ToolbarContainer
              activeToolbar="standardtoolbar"
              isVisible={standardToolbarVisible}
              toggleToolbar={toggleStandardToolbar}
            />
            <Divider />
            <ToolbarContainer
              activeToolbar="clipboardtoolbar"
              isVisible={clipboardToolbarVisible}
              toggleToolbar={toggleClipboardToolbar}
            />
            <Divider />
            <ToolbarContainer
              activeToolbar="mapstoolbar"
              isVisible={mapsToolbarVisible}
              toggleToolbar={toggleMapsToolbar}
            />
            <Divider />
            <ToolbarContainer
              activeToolbar="dssvuetoolbar"
              isVisible={dssVueToolbarVisible}
              toggleToolbar={toggleDssVueToolbar}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <DockableFrame
            containers={containers}
            setContainers={setContainers}
            addComponent={addComponent}
            removeComponent={removeComponent}
          />
        </div>
      </div>
    </StyleProvider>
  );
}

export default App;
