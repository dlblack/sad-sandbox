import React from "react";
import StandardToolbar from "./ToolbarStandard";
import ClipboardToolbar from "./ToolbarClipboard";
import MapsToolbar from "./ToolbarMaps";
import DssVueToolbar from "./ToolbarDssVue";

function ToolbarContainer({ activeToolbar, isVisible }) {
  return (
    <div>
      {activeToolbar === "standardtoolbar" && (
        <StandardToolbar isVisible={isVisible} />
      )}
      {activeToolbar === "clipboardtoolbar" && (
        <ClipboardToolbar isVisible={isVisible} />
      )}
      {activeToolbar === "mapstoolbar" && <MapsToolbar isVisible={isVisible} />}
      {activeToolbar === "dssvuetoolbar" && (
        <DssVueToolbar isVisible={isVisible} />
      )}
    </div>
  );
}

export default ToolbarContainer;
