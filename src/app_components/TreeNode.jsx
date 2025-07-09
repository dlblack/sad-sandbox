import React, { useRef, useEffect } from "react";
import SaveAsDialog from "../dialogs/SaveAsDialog";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import "../styles/css/TreeNode.css";
import dssIcon from '../../assets/images/dss.gif';

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

function getNodeBadgeOrIcon(label, isLeaf, type, section) {
  if (isLeaf && section === "data") {
    return (
      <img
        src={dssIcon}
        alt="Data"
        className="tree-data-icon"
      />
    );
  }
  if (isLeaf && section === "analysis") {
    if (label === "Bulletin 17 Analysis") {
      return <span className="tree-badge b17">B17</span>;
    }
    if (label === "Peak Flow Frequency") {
      return <span className="tree-badge pff">PFF</span>;
    }
  }
  return null;
}

const TreeNode = ({
  label,
  children,
  isTopLevel = false,
  onSaveAs,
  type,
  section,
  description,
  onRename,
  onDelete,
  canDelete = false,
  parentLabel,
  expanded,
  onToggle,
  path,
  menu,
  setMenu,
  renaming,
  setRenaming,
  renameValue,
  setRenameValue,
  saveAsDialogOpen,
  setSaveAsDialogOpen,
}) => {
  const hasContent = hasRealChildren(children);
  const isLeaf = !hasContent;
  const isBottomLevel = isLeaf && canDelete;
  const badge = getNodeBadgeOrIcon(parentLabel, isLeaf, type, section);
  const ref = useRef();

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenu?.(null);
    };
    if (menu) document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [menu, setMenu]);

  const handleContextMenu = (e) => {
    if (!isBottomLevel) return;
    e.preventDefault();
    setMenu?.({ x: e.clientX, y: e.clientY, path });
  };

  const handleSaveAs = () => {
    setMenu?.(null);
    setSaveAsDialogOpen?.(path);
  };

  const handleSaveAsConfirm = (newName, newDesc) => {
    setSaveAsDialogOpen?.(null);
    onSaveAs && onSaveAs(newName, newDesc);
  };

  const handleSaveAsCancel = () => setSaveAsDialogOpen?.(null);

  const handleRename = () => {
    setMenu?.(null);
    setRenaming?.(path);
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    setRenaming?.(null);
    if (renameValue !== label && onRename) {
      onRename(renameValue);
    }
  };

  const handleRenameBlur = () => setRenaming?.(null);

  const handleDelete = () => {
    setMenu?.(null);
    onDelete?.();
  };

  const LabelTag = isTopLevel && hasContent ? "strong" : "span";

  return (
    <div className={`tree-node${isTopLevel ? " top-level" : ""}`} ref={ref}>
      <span
        className={`tree-label${expanded ? " expanded" : ""}${hasContent ? " pointer" : ""}`}
        onClick={hasContent ? () => onToggle(path) : undefined}
        onContextMenu={handleContextMenu}
      >
        {hasContent && (expanded ? <FaFolderOpen color="#f6b73c" /> : <FaFolder color="#f6b73c" />)}
        {badge}
        {renaming === path ? (
          <form onSubmit={handleRenameSubmit}>
            <input
              type="text"
              autoFocus
              value={renameValue}
              onChange={e => setRenameValue?.(e.target.value)}
              onBlur={handleRenameBlur}
            />
          </form>        
        ) : (
          <LabelTag>{label}</LabelTag>
        )}
      </span>
      {menu && menu.path === path && isBottomLevel && (
        <div
          className="tree-context-menu pointer"
          style={{
            top: menu.y,
            left: menu.x,
          }}
        >
          <div className="tree-menu-item" onClick={handleSaveAs}>
            Save As
          </div>
          <div className="tree-menu-item" onClick={handleRename}>
            Rename
          </div>
          <div 
            className={`tree-menu-item${canDelete ? "" : " not-allowed"}`} 
            onClick={canDelete ? handleDelete : undefined}
          >
            Delete
          </div>
        </div>
      )}
      {saveAsDialogOpen === path && isBottomLevel && (
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
