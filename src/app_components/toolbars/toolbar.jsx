import React from "react";
import ToolbarButton from "./ToolbarButton";

function Toolbar({ buttons }) {
  return (
    <div className="btn-group" role="group" aria-label="Basic example">
      {buttons.map((button, index) => (
        <ToolbarButton
          key={index}
          label={button.label}
          icon={button.icon}
          tooltip={button.tooltip}
        />
      ))}
    </div>
  );
}

export default Toolbar;
