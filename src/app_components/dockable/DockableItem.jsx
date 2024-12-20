import React, { useContext } from "react";
import { StyleContext } from "../../styles/StyleContext";

function DockableItem({ id, x, y, width, height, type, onRemove, onDragStart, children }) {
  const { modalStyle } = useContext(StyleContext);

  return (
    <div
      className="modal-container"
      style={{
        left: x,
        top: y,
        width: `${width}px`,
        height: `${height}px`,
        position: "absolute",
        zIndex: 1050,
        border: "1px solid #ccc",
        borderRadius: "0.25rem",
        boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
        overflow: "hidden",
      }}
    >
      <div className="modal-content" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Modal Header */}
        <div
          className={`modal-header ${modalStyle}`}
          onMouseDown={(e) => onDragStart(id, e)}
          style={{
            cursor: "move",
            padding: "10px",
            borderBottom: "1px solid #dee2e6",
          }}
        >
          <h5 className="modal-title">{type}</h5>
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

        {/* Modal Body */}
        <div className="modal-body" style={{ flex: 1, overflow: "auto", padding: "1px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default DockableItem;
