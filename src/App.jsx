import React, { useState } from "react";
import Navbar from "./app_components/navbar";
import ToolbarContainer from "./app_components/toolbars/toolbar-container";
import ResizableFrame from "./app_components/resizable-frame";
import Divider from "./app_components/toolbars/divider";

function App() {
  const [standardToolbarVisible, setStandardToolbarVisible] = useState(true);
  const [clipboardToolbarVisible, setClipboardToolbarVisible] = useState(true);
  const [mapsToolbarVisible, setMapsToolbarVisible] = useState(true);
  const [dssVueToolbarVisible, setDssVueToolbarVisible] = useState(true);

  const toggleStandardToolbar = () => {
    setStandardToolbarVisible(!standardToolbarVisible);
  };

  const toggleClipboardToolbar = () => {
    setClipboardToolbarVisible(!clipboardToolbarVisible);
  };

  const toggleMapsToolbar = () => {
    setMapsToolbarVisible(!mapsToolbarVisible);
  };

  const toggleDssVueToolbar = () => {
    setDssVueToolbarVisible(!dssVueToolbarVisible);
  };

  return (
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
      <ResizableFrame />
    </div>
  );
}

export default App;
