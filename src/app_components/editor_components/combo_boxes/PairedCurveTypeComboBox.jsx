import React from "react";
import { TextStore } from "../../../utils/TextStore";

export const CURVE_TYPE_DEFAULTS = {
  "Elev-Stor": { yUnits: "acre-ft", xLabel: "Elevation", xUnits: "ft" },
  "Stage-Disch": { yUnits: "cfs", xLabel: "Stage", xUnits: "ft" },
  "Freq-Flow": { yUnits: "cfs", xLabel: "Frequency", xUnits: "%" },
};

export const CURVE_TYPE_OPTIONS = [
  { value: "Elev-Stor",  labelKey: "PairedCurveType_ElevStor" },
  { value: "Stage-Disch",labelKey: "PairedCurveType_StageDisch" },
  { value: "Freq-Flow",  labelKey: "PairedCurveType_FreqFlow" },
];

export default function PairedCurveTypeComboBox({ value, onChange, ...props }) {
  return (
    <select
      className="form-select font-xs"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    >
      <option value="">{TextStore.interface("PairedCurveType_Placeholder")}</option>
      {CURVE_TYPE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {TextStore.interface(opt.labelKey)}
        </option>
      ))}
    </select>
  );
}
