import React from "react";
import Toolbar from "./toolbar";

const DssVueToolbar = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  const dssVueToolbarButtons = [
    {
      label: "",
      icon: "../../../resources/ssp/client/dss.gif",
      tooltip: "Open DSSVue",
    },
  ];

  return (
    <div>
      <Toolbar buttons={dssVueToolbarButtons} />
    </div>
  );
};

export default DssVueToolbar;
