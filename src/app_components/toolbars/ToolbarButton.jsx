import React from "react";

function ToolbarButton({ label, icon, tooltip, onClick, isDisabled, isActive }) {
  const hasIcon = icon && icon.trim() !== "";
  const buttonClass = `
    btn btn-secondary ${isDisabled ? "disabled" : ""}
    ${isActive ? "active" : ""}
  `;

  return (
    <button
      type="button"
      className={buttonClass}
      title={tooltip}
      aria-label={tooltip || label}
      tabIndex={isDisabled ? -1 : 0}
      onClick={!isDisabled ? onClick : undefined}
      onKeyDown={(e) => !isDisabled && e.key === "Enter" && onClick()}
      disabled={isDisabled}
    >
      {hasIcon ? (
        icon.includes(".gif") ? (
          <img src={icon} alt={tooltip || label} />
        ) : (
          <span className="material-icons">{icon}</span>
        )
      ) : null}
      {label}
    </button>
  );
}

export default ToolbarButton;
