import React from "react";
import Toolbar from "./Toolbar";
import { standardToolbarButtons } from "../../config/toolbarConfig";

const ToolbarStandard = () => {
  return <Toolbar buttons={standardToolbarButtons} />;
};

export default ToolbarStandard;
