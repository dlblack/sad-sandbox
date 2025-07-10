import React, { useContext, useState, useRef, useEffect } from "react";
import { StyleContext } from "../styles/StyleContext";
import "../styles/css/SaveAsDialog.css";

function SaveAsDialog({ type, oldName, oldDescription, onConfirm, onCancel }) {
  const { modalStyle } = useContext(StyleContext);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const inputRef = useRef();
  const dialogRef = useRef();

  // Prevent background scroll
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = origOverflow; };
  }, []);

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Focus trap for Tab and Shift+Tab, ESC to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'input:not([disabled]), textarea, button:not([disabled]), [tabindex="0"]'
        );
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [onCancel]);

  // Refocus dialog if overlay is clicked
  function handleOverlayMouseDown(e) {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      e.stopPropagation();
      inputRef.current?.focus();
    }
  }

  // Block any background pointer events
  function handleOverlayPointer(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  // Prevent modal card clicks from bubbling to overlay
  function stopPropagation(e) { e.stopPropagation(); }

  return (
    <div
      className="saveas-modal-overlay"
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayPointer}
      onWheel={handleOverlayPointer}
      onMouseMove={handleOverlayPointer}
      onPointerDown={handleOverlayPointer}
      tabIndex={-1}
    >
      <div
        className="card saveas-dialog-card"
        ref={dialogRef}
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div className={`saveas-dialog-header ${modalStyle || ""}`}>
          <span>
            Save {type} As
          </span>
          <button
            className="saveas-dialog-close dockable-item-close-btn dockable-item-header-btn"
            aria-label="Close"
            type="button"
            tabIndex={0}
            onClick={onCancel}
          >×</button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onConfirm(name.trim(), desc.trim());
          }}
        >
          <div className="saveas-dialog-body">
            <div className="saveas-dialog-row">
              <label className="saveas-dialog-label">Old Name:</label>
              <input
                type="text"
                className="saveas-dialog-oldname form-control form-control-sm"
                value={oldName}
                disabled
                tabIndex={-1}
              />
            </div>
            <div className="saveas-dialog-row">
              <label className="saveas-dialog-label">Name:</label>
              <input
                type="text"
                className="saveas-dialog-input form-control form-control-sm"
                value={name}
                onChange={e => setName(e.target.value)}
                ref={inputRef}
                required
                minLength={1}
                maxLength={64}
                placeholder="Enter new name"
              />
            </div>
            <div className="saveas-dialog-row" style={{ alignItems: "start" }}>
              <label className="saveas-dialog-label" style={{ marginTop: "4px" }}>Description:</label>
              <textarea
                rows={3}
                className="saveas-dialog-textarea form-control"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Enter description"
                maxLength={200}
              />
            </div>
          </div>
          <div className="saveas-dialog-footer">
            <button
              type="button"
              className="saveas-dialog-btn btn btn-secondary btn-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="saveas-dialog-btn btn btn-primary btn-sm"
              disabled={!name.trim()}
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SaveAsDialog;
