import React from "react";
import Toolbar from "./toolbar";

const MapsToolbar = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  const mapsToolbarButtons = [
    {
      label: "",
      icon: "open_in_new",
    },
    {
      label: "",
      icon: "center_focus_strong",
    },
    {
      label: "",
      icon: "grid_view",
    },
    {
      label: "",
      icon: "layers",
    },
  ];

  return (
    <div>
      <Toolbar buttons={mapsToolbarButtons} />
    </div>
  );
};

export default MapsToolbar;
