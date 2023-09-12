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
      tooltip: "Open a new Map Window",
    },
    {
      label: "",
      icon: "center_focus_strong",
      tooltip:
        "Set the zoom level for all open Map Windows to the level of the selected Map Window",
    },
    {
      label: "",
      icon: "grid_view",
      tooltip: "Display open Map Windows tiled in the Map Panel",
    },
    {
      label: "",
      icon: "layers",
      tooltip: "Stack all open Map Windows",
    },
  ];

  return (
    <div>
      <Toolbar buttons={mapsToolbarButtons} />
    </div>
  );
};

export default MapsToolbar;
