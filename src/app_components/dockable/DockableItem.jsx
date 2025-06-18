import React, { useContext } from "react";
import { StyleContext } from "../../styles/StyleContext";

function DockableItem({ id, x, y, width, height, type, onRemove, onDragStart, children }) {
  const { modalStyle } = useContext(StyleContext);

  return (
    <div
      className="card-container"
      style={{
        left: x,
        top: y,
        width: `${width}px`,
        height: `${height}px`,
        position: "absolute",
        zIndex: 1050,
        overflow: "hidden",
      }}
    >
      <div className="card h-100 d-flex flex-column">
        {/* Card Header */}
        <div
          className={`card-header d-flex align-items-center justify-content-between ${modalStyle}`}
          onMouseDown={(e) => onDragStart(id, e)}
          style={{
            cursor: "move",
            padding: "4px 10px 4px 10px",
            borderBottom: "1px solid #dee2e6",
          }}
        >
          <h6 className="card-title mb-0">{type}</h6>
          <button
            type="button"
            className="btn-close"
            onClick={() => onRemove(id)}
            aria-label="Close"
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          ></button>
        </div>

        {/* Card Body */}
        <div className="card-body flex-grow-1 overflow-auto p-2" style={{ flex: 1, overflow: "auto", padding: "1px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default DockableItem;
