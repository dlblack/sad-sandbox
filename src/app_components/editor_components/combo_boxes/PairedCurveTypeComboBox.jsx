import React from "react";

export const CURVE_TYPE_DEFAULTS = {
  "Elev-Stor": {yUnits: "acre-ft", xLabel: "Elevation", xUnits: "ft"},
  "Stage-Disch": {yUnits: "cfs", xLabel: "Stage", xUnits: "ft"},
  "Freq-Flow": {yUnits: "cfs", xLabel: "Frequency", xUnits: "%"},
};

export const CURVE_TYPE_OPTIONS = [
  {value: "Elev-Stor", label: "Elevation - Storage"},
  {value: "Stage-Disch", label: "Stage - Discharge"},
  {value: "Freq-Flow", label: "Frequency - Flow"},
];

export default function PairedCurveTypeComboBox({value, onChange, ...props}) {
  return (
    <select
      className="form-select font-xs"
      value={value}
      onChange={e => onChange(e.target.value)}
      {...props}
    >
      <option value="">Select Curve Type</option>
      {CURVE_TYPE_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
