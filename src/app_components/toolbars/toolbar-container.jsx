import React from "react";
import StandardToolbar from "./toolbar-standard";
import ClipboardToolbar from "./toolbar-clipboard";
import MapsToolbar from "./toolbar-maps";
import DssVueToolbar from "./toolbar-dssvue";

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
