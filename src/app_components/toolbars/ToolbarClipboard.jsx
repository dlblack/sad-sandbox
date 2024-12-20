import React from "react";
import Toolbar from "./Toolbar";
import { clipboardToolbarButtons } from "../../config/toolbarConfig";

const ToolbarClipboard = () => {
  return <Toolbar buttons={clipboardToolbarButtons} />;
};

export default ToolbarClipboard;
