import React from "react";

const DATA_TYPE_OPTIONS = [
  { value: "TimeSeries", label: "Time Series" },
  { value: "PairedData", label: "Paired Data" },
];

export default function DataTypeComboBox({ value, onChange, ...props }) {
  return (
    <select
      className="form-select font-xs"
      value={value}
      onChange={e => onChange(e.target.value)}
      {...props}
    >
      <option value="">Select Data Type</option>
      {DATA_TYPE_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
