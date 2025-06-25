import React, { useState } from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";

const hasRealChildren = (children) => {
  if (!children) return false;
  const arr = React.Children.toArray(children);
  return arr.some(child => {
    if (child && child.type === TreeNode) {
      return !!child.props.label && child.props.label !== "(No analyses)";
    }
    return !!child;
  });
};

const TreeNode = ({ label, children, isTopLevel = false }) => {
  const hasContent = hasRealChildren(children);
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    if (hasContent) setExpanded(!expanded);
  };

  const LabelTag = isTopLevel && hasContent ? "strong" : "span";

  return (
    <div className="tree-node">
      {hasContent ? (
        <span
          className={`tree-label ${expanded ? "expanded" : ""}`}
          onClick={toggleExpanded}
          style={{ cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", gap: "4px" }}
        >
          {expanded ? <FaFolderOpen color="#f6b73c" /> : <FaFolder color="#f6b73c" />}
          <LabelTag>{label}</LabelTag>
        </span>
      ) : (
        <span className="tree-label" style={{ marginLeft: 24 }}>{label}</span>
      )}
      {expanded && hasContent && <div className="tree-children">{children}</div>}
    </div>
  );
};

export default TreeNode;
