import React, { useState, useRef, useEffect } from "react";
import SaveAsDialog from "../dialogs/SaveAsDialog";
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

const TreeNode = ({ 
  label, 
  children, 
  isTopLevel = false,
  onSaveAs,
  type,
  description,
  onRename,
  onDelete,
  canDelete = false,
}) => {
  const hasContent = hasRealChildren(children);
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState(null);
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(label);

  const ref = useRef();

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenu(null);
    };
    if (menu) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menu]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (canDelete) setMenu({ x: e.clientX, y: e.clientY });
  };

  const handleSaveAs = () => {
    setMenu(null);
    setSaveAsDialogOpen(true);
  }

  const handleSaveAsConfirm = (newName, newDesc) => {
    setSaveAsDialogOpen(false);
    onSaveAs && onSaveAs(newName, newDesc);
  }

  const handleSaveAsCancel = () => setSaveAsDialogOpen(false);

  const handleRename = () => {
    setMenu(null);
    setRenaming(true);
  }

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    setRenaming(false);
    if (renameValue !== label && onRename) {
      onRename(renameValue);
    }
  };

  const handleRenameBlur = () => {
    if (hasContent) setExpanded(!expanded);
  };

  const handleDelete = () => {
    setMenu(null);
    onDelete?.();
  }

  const toggleExpanded = () => {
    if (hasContent) setExpanded(!expanded);
  };

  const LabelTag = isTopLevel && hasContent ? "strong" : "span";

  return (
    <div className="tree-node" ref={ref} style={{ position: "relative" }}>
     <span
        className={`tree-label ${expanded ? "expanded" : ""}`}
        onClick={hasContent ? () => setExpanded(!expanded) : undefined}
        onContextMenu={handleContextMenu}
        style={{ 
          cursor: hasContent ? "pointer" : "default", 
          userSelect: "none", 
          display: "flex", 
          alignItems: "center", 
          gap: "4px" 
        }}
      >
        {hasContent && (expanded ? <FaFolderOpen color="#f6b73c" /> : <FaFolder color="#f6b73c" />)}
        {renaming ? (
          <form onSubmit={handleRenameSubmit}>
            <input
              type="text"
              autoFocus
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={handleRenameBlur}
              style={{ width: 100, fontSize: "1em" }}
            />
          </form>
        ) : (
          <LabelTag>{label}</LabelTag>
        )}
      </span>
      {menu && (
        <div
          className={`tree-context-menu ${canDelete ? "pointer" : "not-allowed"}`}
          style={{
            top: menu.y,
            left: menu.x,
          }}
        >
          <div
            style={{
              color: "#222",
              padding: "4px 12px",
              fontSize: "0.8em",
            }}
            onClick={handleSaveAs}
          >
            Save As
          </div>
          <div
            style={{
              color: "#222",
              padding: "4px 12px",
              fontSize: "0.8em",
            }}
            onClick={handleRename}
          >
            Rename
          </div>
          <div
            style={{
              color: "#222",
              padding: "4px 12px",
              fontSize: "0.8em",
              pointerEvents: canDelete ? "auto" : "none",
            }}
            onClick={canDelete ? handleDelete : undefined}
          >
            Delete
          </div>
        </div>
      )}
      {saveAsDialogOpen && (
        <SaveAsDialog
          type={type}
          oldName={label}
          oldDescription={description}
          onConfirm={handleSaveAsConfirm}
          onCancel={handleSaveAsCancel}
        />
      )}
      {expanded && hasContent && <div className="tree-children">{children}</div>}
    </div>
  );
};

export default TreeNode;
