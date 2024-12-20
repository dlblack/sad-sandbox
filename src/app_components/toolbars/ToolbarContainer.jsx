import React from "react";
import Toolbar from "./Toolbar";
import { toolbarsConfig } from "../../config/toolbarConfig";

function ToolbarContainer({ activeToolbar, isVisible }) {
  if (!isVisible) return null;

  // Fetch the buttons for the active toolbar
  const buttons = toolbarsConfig[activeToolbar] || [];

  return <Toolbar buttons={buttons} />;
}

export default ToolbarContainer;
