import React, { useContext, useState } from "react";
import { StyleContext } from "../../styles/StyleContext";

function DockableItem({
  expandToContents = false,
  id,
  type,
  onRemove,
  children,
  dragHandleProps,
  isDragging,
  width,
  height,
  className
}) {
  const { modalStyle } = useContext(StyleContext);
  const [expanded, setExpanded] = useState(false);

  const containerStyle = expanded
    ? {
      position: "absolute",
      zIndex: 100,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    }
  : expandToContents
    ? {
        width: width ? `${width}px` : undefined,
        minWidth: width ? `${width}px` : undefined,
        minHeight: height ? `${height}px` : undefined,
        height: "auto"
      }
    : {
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        minWidth: width ? `${width}px` : undefined,
        minHeight: height ? `${height}px` : undefined,
      };

  return (
    <div className={`card-container dockable-item${expanded ? " expanded" : ""}${expandToContents ? " expand-to-contents" : ""}${className ? " " + className : ""}`} style={containerStyle}>
      <div className="card d-flex flex-column" style={expandToContents ? { minHeight: "100%", height: "auto" } : { height: "100%" }}>
        <div
          className={`card-header d-flex align-items-center justify-content-between ${modalStyle}`}
        >
          <div
            className="drag-handle"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            {...dragHandleProps}
          >
            <div className="card-title mb-0" style={{ cursor: "grab" }}>
              {type}
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <button
              type="button"
              className="dockable-item-header-btn dockable-item-expand-btn"
              onClick={e => {
                e.stopPropagation();
                setExpanded(exp => !exp);
                e.currentTarget.blur(); // Remove focus highlight
              }}
              aria-label={expanded ? "Restore" : "Expand"}
              title={expanded ? "Restore" : "Expand"}
            >
              {expanded ? "▭" : "▢"}
            </button>
            <button
              type="button"
              className="dockable-item-header-btn dockable-item-close-btn"
              onClick={e => {
                e.stopPropagation();
                onRemove(id);
                e.currentTarget.blur(); // Remove focus highlight
              }}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div className="card-body flex-grow-1 overflow-auto p-2">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DockableItem;
