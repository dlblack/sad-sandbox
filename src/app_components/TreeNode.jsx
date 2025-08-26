import React, { useContext, useEffect, useRef } from "react";
import SaveAsDialog from "../dialogs/SaveAsDialog";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import "../styles/css/TreeNode.css";
import dssIcon from "../../assets/images/dss.gif";
import { StyleContext } from "../styles/StyleContext";
import { TextStore } from "../utils/TextStore";

const hasRealChildren = (children) => {
  if (!children) return false;
  const arr = React.Children.toArray(children);
  const noAnalysesText = TextStore.interface("Tree_NoAnalyses");
  return arr.some((child) => {
    if (child && child.type === TreeNode) {
      return !!child.props.label && child.props.label !== noAnalysesText;
    }
    return !!child;
  });
};

function getNodeBadgeOrIcon(parentLabel, isLeaf, type, section) {
  if (isLeaf && section === "data") {
    return (
      <img
        src={dssIcon}
        alt={TextStore.interface("Tree_Alt_DataIcon")}
        className="tree-data-icon"
      />
    );
  }
  if (isLeaf && section === "analysis") {
    const b17Label = TextStore.interface("ComponentMetadata_Wizard_Bulletin17AnalysisWizard");
    const pffLabel = TextStore.interface("ComponentMetadata_Wizard_PeakFlowFreqWizard");
    if (parentLabel === b17Label) {
      return <span className="tree-badge b17">{TextStore.interface("Tree_Badge_B17")}</span>;
    }
    if (parentLabel === pffLabel) {
      return <span className="tree-badge pff">{TextStore.interface("Tree_Badge_PFF")}</span>;
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
                    dataset,
                  }) => {
  const { componentBackgroundStyle } = useContext(StyleContext);
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

  const handlePlot = () => {
    setMenu?.(null);
    if (section === "data" && dataset) {
      // Dispatch event for plot consumers
      window.dispatchEvent(
        new CustomEvent("plotNodeData", {
          detail: { dataset },
        })
      );
    }
  };

  return (
    <div
      className={`tree-node ${componentBackgroundStyle} ${
        isTopLevel ? " top-level" : ""
      }`}
      ref={ref}
    >
      <span
        className={`tree-label${expanded ? " expanded" : ""}${
          hasContent ? " pointer" : ""
        }`}
        onClick={hasContent ? () => onToggle(path) : undefined}
        onContextMenu={handleContextMenu}
      >
        {hasContent &&
          (expanded ? (
            <FaFolderOpen color="#f6b73c" />
          ) : (
            <FaFolder color="#f6b73c" />
          ))}
        {badge}
        {renaming === path ? (
          <form onSubmit={handleRenameSubmit}>
            <input
              type="text"
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue?.(e.target.value)}
              onBlur={handleRenameBlur}
            />
          </form>
        ) : (
          <span>{label}</span>
        )}
      </span>

      {menu && menu.path === path && isBottomLevel && (
        <div
          className={`tree-context-menu pointer ${componentBackgroundStyle} `}
          style={{
            top: menu.y,
            left: menu.x,
          }}
        >
          <div className="tree-menu-item" onClick={handleSaveAs}>
            {TextStore.interface("Tree_Menu_SaveAs")}
          </div>
          <div className="tree-menu-item" onClick={handleRename}>
            {TextStore.interface("Tree_Menu_Rename")}
          </div>
          <div
            className={`tree-menu-item${canDelete ? "" : " not-allowed"}`}
            onClick={canDelete ? handleDelete : undefined}
          >
            {TextStore.interface("Tree_Menu_Delete")}
          </div>
          {section === "data" && (
            <div className="tree-menu-item" onClick={handlePlot}>
              {TextStore.interface("Tree_Menu_Plot")}
            </div>
          )}
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
