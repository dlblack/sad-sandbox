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
    },
    {
      label: "",
      icon: "content_paste",
    },
    {
      label: "",
      icon: "content_cut",
    },
  ];

  return (
    <div>
      <Toolbar buttons={clipboardToolbarButtons} />
    </div>
  );
};

export default ClipboardToolbar;
