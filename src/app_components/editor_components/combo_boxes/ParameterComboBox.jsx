import React from "react";
import { TextStore } from "../../../utils/TextStore";

const PARAMETER_OPTIONS = [
  { value: "Flow",          labelKey: "Parameter_Flow" },
  { value: "Stage",         labelKey: "Parameter_Stage" },
  { value: "Elev",          labelKey: "Parameter_Elev" },
  { value: "Precipitation", labelKey: "Parameter_Precipitation" },
  { value: "SWE",           labelKey: "Parameter_SWE" },
  { value: "Temperature",   labelKey: "Parameter_Temperature" },
  { value: "Windspeed",     labelKey: "Parameter_Windspeed" },
];

export default function ParameterComboBox({ value, onChange, ...props }) {
  return (
    <select
      className="form-select font-xs"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    >
      <option value="">{TextStore.interface("Parameter_Placeholder")}</option>
      {PARAMETER_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {TextStore.interface(opt.labelKey)}
        </option>
      ))}
    </select>
  );
}
