import React from "react";
import Toolbar from "./Toolbar";

const StandardToolbar = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  const standardToolbarButtons = [
    {
      label: "",
      icon: "create_new_folder",
      tooltip: "Create New...",
    },
    {
      label: "",
      icon: "file_open",
      tooltip: "Open a Study",
    },
    {
      label: "",
      icon: "close",
      tooltip: "Close the Study",
    },
    {
      label: "",
      icon: "save",
      tooltip: "Save the Study",
    },
    {
      label: "",
      icon: "print",
      tooltip: "Print",
    },
  ];

  return (
    <div>
      <Toolbar buttons={standardToolbarButtons} />
    </div>
  );
};

export default StandardToolbar;
