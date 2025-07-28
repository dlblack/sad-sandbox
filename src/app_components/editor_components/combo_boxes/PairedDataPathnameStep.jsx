import React from "react";

export default function PairedDataPathnameStep({pathnameParts, setPathnameParts}) {
  function update(part, val) {
    setPathnameParts(parts => ({...parts, [part]: val}));
  }

  return (
    <div className="mb-3">
      <div className="d-flex gap-2 mb-1">
        <input className="form-control form-control-sm" style={{maxWidth: 100}} placeholder="A part"
               value={pathnameParts.A} onChange={e => update("A", e.target.value)}/>
        <input className="form-control form-control-sm" style={{maxWidth: 100}} placeholder="B part"
               value={pathnameParts.B} onChange={e => update("B", e.target.value)}/>
        <input className="form-control form-control-sm" style={{maxWidth: 120}} placeholder="C part (Curve Type)"
               value={pathnameParts.C} onChange={e => update("C", e.target.value)}/>
        {/* D part not shown for PairedData */}
        <input className="form-control form-control-sm" style={{maxWidth: 100}} placeholder="E part"
               value={pathnameParts.E} onChange={e => update("E", e.target.value)}/>
        <input className="form-control form-control-sm" style={{maxWidth: 100}} placeholder="F part"
               value={pathnameParts.F} onChange={e => update("F", e.target.value)}/>
      </div>
      <div className="font-xs text-muted">
        DSS Path: /A/B/C//E/F/
      </div>
    </div>
  );
}
