import React from "react";

const PARAMETER_OPTIONS = [
  { value: "Flow", label: "Flow" },
  { value: "Stage", label: "Stage" },
  { value: "Elev", label: "Elevation" },
  { value: "Precipitation", label: "Precipitation" },
  { value: "SWE", label: "Snow Water Equivalent (SWE)" },
  { value: "Temperature", label: "Temperature" },
  { value: "Windspeed", label: "Windspeed" },
];

export default function ParameterComboBox({ value, onChange, ...props }) {
  return (
    <select
      className="form-select font-xs"
      value={value}
      onChange={e => onChange(e.target.value)}
      {...props}
    >
      <option value="">Select Parameter</option>
      {PARAMETER_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
