import React, {useContext, useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom";
import {StyleContext} from "../styles/StyleContext";
import "../styles/css/SaveAsDialog.css";

function SaveAsDialog({type, oldName, onConfirm, onCancel}) {
  const {componentHeaderStyle, componentBackgroundStyle} = useContext(StyleContext);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const inputRef = useRef();
  const dialogRef = useRef();

  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = origOverflow; };
  }, []);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const dialog = (
    <div
      className="saveas-modal-overlay"
      onMouseDown={(e) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target)) {
          inputRef.current?.focus();
        }
      }}
      tabIndex={-1}
    >
      <div
        className={`card saveas-dialog-card ${componentBackgroundStyle}`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div className={`card-header d-flex justify-content-between align-items-center ${componentHeaderStyle}`}>
          <div className="card-title mb-0">Save {type} As</div>
          <button
            type="button"
            className="dockable-item-header-btn dockable-item-close-btn"
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
          <div className="manual-entry-content p-2">
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90}}>Old Name</label>
              <input type="text" className="form-control form-control-sm font-xs" value={oldName} disabled />
            </div>
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90}}>Name</label>
              <input
                type="text"
                className="form-control form-control-sm font-xs"
                value={name}
                onChange={e => setName(e.target.value)}
                ref={inputRef}
                required
                maxLength={64}
                placeholder="Enter new name"
              />
            </div>
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90}}>Description</label>
              <textarea
                className="form-control form-control-sm font-xs"
                rows={3}
                maxLength={200}
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>
          <div className={`saveas-dialog-footer ${componentBackgroundStyle}`}>
            <div className="saveas-dialog-footer-inner">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!name.trim()}>OK</button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(dialog, document.body);
}

export default SaveAsDialog;
