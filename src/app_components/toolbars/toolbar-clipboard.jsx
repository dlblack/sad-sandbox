import React from "react";
import Toolbar from "./toolbar";

const ClipboardToolbar = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  const clipboardToolbarButtons = [
    {
      label: "",
      icon: "content_copy",
      tooltip: "Copy",
    },
    {
      label: "",
      icon: "content_paste",
      tooltip: "Paste",
    },
    {
      label: "",
      icon: "content_cut",
      tooltip: "Cut",
    },
  ];

  return (
    <div>
      <Toolbar buttons={clipboardToolbarButtons} />
    </div>
  );
};

export default ClipboardToolbar;
