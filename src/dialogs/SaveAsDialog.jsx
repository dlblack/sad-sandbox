import React, { useContext, useState, useRef, useEffect } from "react";
import { StyleContext } from "../styles/StyleContext";

function SaveAsDialog({ type, oldName, oldDescription, onConfirm, onCancel }) {
  const { modalStyle } = useContext(StyleContext);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState(""); // description defaults to empty
  const inputRef = useRef();

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <div className="saveas-modal-overlay">
      <div 
        className="card saveas-dialog-card"
        style={{
          minWidth: 340,
          minHeight: 320,
          maxWidth: "96vw",
          boxShadow: "0 8px 32px #0002",
          borderRadius: 8,
          overflow: "hidden",
          fontFamily: "var(--bs-body-font-family"
        }}
      >
        <div className={`card-header d-flex justify-content-between align-items-center px-3 py-2 ${modalStyle || ""}`}>
          <span className="fw-normal" style={{ color: "#f1f1f1", fontFamily: "var(--bs-body-font-family)", fontSize: "1.5vh", fontWeight: "var(--bs-body-font-weight)" }}>
            Save {type} As
          </span>
          <button
            className="dockable-item-close-btn dockable-item-header-btn"
            aria-label="Close"
            type="button"
            tabIndex={-1}
            style={{ marginLeft: "8px", fontSize: "1.1em" }}
            onClick={onCancel}
          >
            ×
          </button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onConfirm(name.trim(), desc.trim());
          }}
        >
          <div
            className="card-body pt-3 pb-2 px-3"
            style={{
              background: "#222",
              color: "#eee",
              fontFamily: "var(--bs-body-font-family)",
              paddingTop: "16px",
              paddingBottom: "8px",
              minHeight: 160,
            }}
          >
            <div className="style-selector-row mb-2">
              <label className="style-selector-label" style={{ minWidth: 110 }}>Old Name:</label>
              <input
                type="text"
                className="form-control form-control-sm style-selector-compact"
                value={oldName}
                disabled
                style={{
                  background: "#fff",
                  color: "#888",
                  border: "1px solid #bbb",
                  fontSize: "1.4vh",
                  opacity: 0.7
                }}
              />
            </div>
            <div className="style-selector-row mb-2">
              <label className="style-selector-label" style={{ minWidth: 110 }}>Name:</label>
              <input
                type="text"
                className="form-control form-control-sm style-selector-compact"
                value={name}
                onChange={e => setName(e.target.value)}
                ref={inputRef}
                required
                minLength={1}
                maxLength={64}
                placeholder="Enter new name"
                style={{
                  background: "#fff",
                  color: "#222",
                  fontSize: "1.4vh"
                }}
              />
            </div>
            <div className="style-selector-row mb-2 align-items-start">
              <label className="style-selector-label" style={{ minWidth: 110, marginTop: "4px" }}>Description:</label>
              <textarea
                rows={3}
                className="form-control"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Enter description"
                maxLength={200}
              />
            </div>
          </div>
          <div
            className="card-footer d-flex justify-content-end gap-2 py-2 px-3"
            style={{
              background: "#222",
              color: "#eee",
              borderTop: "1px solid #333"
            }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ minWidth: 54, minHeight: 28, fontSize: "0.95em" }}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ minWidth: 54, minHeight: 28, fontSize: "0.95em" }}
              disabled={!name.trim()}
            >
              OK
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .saveas-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.22);
          z-index: 3200;
          display: flex; align-items: center; justify-content: center;
        }
        .saveas-dialog-card {
          min-width: 340px;
          max-width: 96vw;
          box-shadow: 0 8px 32px #0002;
          border-radius: 8px;
          overflow: hidden;
          animation: modalfadein 0.13s cubic-bezier(.46,1.26,.5,1.1);
        }
        @keyframes modalfadein {
          from { transform: scale(.98) translateY(20px); opacity: 0; }
          to   { transform: scale(1)   translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default SaveAsDialog;
