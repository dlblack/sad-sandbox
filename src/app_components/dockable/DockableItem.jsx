import React, { useContext } from "react";
import { StyleContext } from "../../styles/StyleContext";

function DockableItem({ id, type, onRemove, children, dragHandleProps, isDragging, width, height }) {
  const { modalStyle } = useContext(StyleContext);

  return (
    <div className="card-container dockable-item" style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }}>
      <div className="card h-100 d-flex flex-column">
        {/* Card Header as Drag Handle */}
        <div
          className={`card-header d-flex align-items-center justify-content-between ${modalStyle}`}
        >
          <div className="drag-handle" 
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          {...dragHandleProps}
          >
            <h6 className="card-title mb-0" style={{ cursor: "grab" }}>
              {type}
            </h6>
          </div>
          <button
            type="button"
            className="btn-close dockable-item-close-btn"
            onClick={e => {
              e.stopPropagation();
              onRemove(id);
            }}
            aria-label="Close"
          ></button>
        </div>
        {/* Card Body */}
        <div className="card-body flex-grow-1 overflow-auto p-2">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DockableItem;
