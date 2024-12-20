import React from "react";
import Toolbar from "./Toolbar";
import { dssVueToolbarButtons } from "../../config/toolbarConfig";

const ToolbarDssVue = () => {
  return <Toolbar buttons={dssVueToolbarButtons} />;
};

export default ToolbarDssVue;
