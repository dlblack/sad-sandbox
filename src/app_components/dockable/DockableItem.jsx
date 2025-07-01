import React, { useContext } from "react";
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

  // For expandToContents, only set min sizes
  // For all others, set both width and height
  const containerStyle = expandToContents
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
    <div className={`card-container dockable-item${expandToContents ? " expand-to-contents" : ""}${className ? " " + className : ""}`} style={containerStyle}>
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
          <button
            type="button"
            className="dockable-item-close-btn"
            onClick={e => {
              e.stopPropagation();
              onRemove(id);
            }}
            aria-label="Close"
          >
            &#10005;
          </button>
        </div>
        <div className="card-body flex-grow-1 overflow-auto p-2">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DockableItem;
