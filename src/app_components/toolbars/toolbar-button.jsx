import React from "react";

function ToolbarButton({ label, icon, tooltip }) {
  const hasIcon = icon && icon.trim() !== "";
  const buttonClass = hasIcon
    ? "btn btn-secondary"
    : "btn btn-secondary no-icon";

  return (
    <button type="button" className={buttonClass} title={tooltip}>
      {hasIcon ? (
        icon.includes(".gif") ? (
          <img src={icon} alt="" />
        ) : (
          <span className="material-icons">{icon}</span>
        )
      ) : null}
      {label}
    </button>
  );
}

export default ToolbarButton;
