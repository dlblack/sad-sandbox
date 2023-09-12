import React from "react";
import Toolbar from "./toolbar";

const StandardToolbar = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  const standardToolbarButtons = [
    {
      label: "",
      icon: "file_open",
    },
    {
      label: "",
      icon: "close",
    },
    {
      label: "",
      icon: "save",
    },
    {
      label: "",
      icon: "print",
    },
  ];

  return (
    <div>
      <Toolbar buttons={standardToolbarButtons} />
    </div>
  );
};

export default StandardToolbar;
