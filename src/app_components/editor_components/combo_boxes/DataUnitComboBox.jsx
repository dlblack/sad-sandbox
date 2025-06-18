import React from "react";

// This mapping drives available units per parameter
const UNIT_OPTIONS = {
  Precipitation: [
    { value: "IncIn", label: "Incremental Inches" },
    { value: "IncMM", label: "Incremental Millimeters" },
    { value: "CumIn", label: "Cumulative Inches" },
    { value: "CumMM", label: "Cumulative Millimeters" },
  ],
  Flow: [
    { value: "CFS", label: "Cubic Feet per Second (cfs)" },
    { value: "CMS", label: "Cubic Meters per Second (cms)" },
  ],
  Stage: [
    { value: "ft", label: "Feet" },
    { value: "m", label: "Meters" },
  ],
  Elev: [
    { value: "ft", label: "Feet" },
    { value: "m", label: "Meters" },
  ],
  SWE: [
    { value: "in", label: "Inches" },
    { value: "mm", label: "Millimeters" },
  ],
  Temperature: [
    { value: "F", label: "Fahrenheit" },
    { value: "C", label: "Celsius" },
  ],
  Windspeed: [
    { value: "mph", label: "Miles per Hour" },
    { value: "kph", label: "Kilometers per Hour" },
    { value: "mps", label: "Meters per Second" },
  ],
};

export default function DataUnitComboBox({ parameter, value, onChange, ...props }) {
  const options = UNIT_OPTIONS[parameter] || [];
  return (
    <select
      className="form-select font-xs"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={options.length === 0}
      {...props}
    >
      <option value="">Select Data Unit</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
