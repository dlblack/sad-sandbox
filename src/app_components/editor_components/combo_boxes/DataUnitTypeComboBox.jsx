import React from "react";
import { TextStore } from "../../../utils/TextStore";

const DATA_TYPE_OPTIONS = [
  { value: "PerAver", labelKey: "DataUnitType_PerAver" },
  { value: "PerCum",  labelKey: "DataUnitType_PerCum"  },
  { value: "InstVal", labelKey: "DataUnitType_InstVal" },
  { value: "InstCum", labelKey: "DataUnitType_InstCum" },
];

export default function DataUnitTypeComboBox({ value, onChange, ...props }) {
  return (
    <select
      className="form-select font-xs"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    >
      <option value="">{TextStore.interface("DataUnitType_Placeholder")}</option>
      {DATA_TYPE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {TextStore.interface(opt.labelKey)}
        </option>
      ))}
    </select>
  );
}
