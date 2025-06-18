import React from "react";

const INTERVAL_OPTIONS = [
  { value: "1Min", label: "1 Minute" },
  { value: "15Min", label: "15 Minutes" },
  { value: "30Min", label: "30 Minutes" },
  { value: "1Hr", label: "1 Hour" },
  { value: "2Hr", label: "2 Hours" },
  { value: "3Hr", label: "3 Hours" },
  { value: "6Hr", label: "6 Hours" },
  { value: "12Hr", label: "12 Hours" },
  { value: "24Hr", label: "24 Hours" },
];

export default function DataIntervalComboBox({ value, onChange, ...props }) {
  return (
    <select
      className="form-select font-xs"
      value={value}
      onChange={e => onChange(e.target.value)}
      {...props}
    >
      <option value="">Select Data Interval</option>
      {INTERVAL_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
