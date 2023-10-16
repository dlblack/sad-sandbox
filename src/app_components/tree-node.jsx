import React, { useState } from "react";
import DockableItem from "./dockable-item";

const TreeNode = ({ label, children }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    if (children) {
      setExpanded(!expanded);
    }
  };

  return (
    <DockableItem content="Your message content goes here">
      <div className="tree-node">
        {children && (
          <span
            className={`tree-label ${expanded ? "expanded" : ""}`}
            onClick={toggleExpanded}
          >
            {expanded ? "▼" : "▶"} {label}
          </span>
        )}
        {!children && <span className="tree-label">{label}</span>}
        {expanded && children && (
          <div className="tree-children">{children}</div>
        )}
      </div>
    </DockableItem>
  );
};

export default TreeNode;
