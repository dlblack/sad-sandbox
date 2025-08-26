import React from "react";
import { TextStore } from "../../../utils/TextStore";

const UNIT_OPTIONS = {
  Precipitation: [
    { value: "IncIn", labelKey: "DataUnit_Precip_IncIn" },
    { value: "IncMM", labelKey: "DataUnit_Precip_IncMM" },
    { value: "CumIn", labelKey: "DataUnit_Precip_CumIn" },
    { value: "CumMM", labelKey: "DataUnit_Precip_CumMM" },
  ],
  Flow: [
    { value: "CFS", labelKey: "DataUnit_Flow_CFS" },
    { value: "CMS", labelKey: "DataUnit_Flow_CMS" },
  ],
  Stage: [
    { value: "ft", labelKey: "DataUnit_Stage_ft" },
    { value: "m",  labelKey: "DataUnit_Stage_m"  },
  ],
  Elev: [
    { value: "ft", labelKey: "DataUnit_Elev_ft" },
    { value: "m",  labelKey: "DataUnit_Elev_m"  },
  ],
  SWE: [
    { value: "in", labelKey: "DataUnit_SWE_in" },
    { value: "mm", labelKey: "DataUnit_SWE_mm" },
  ],
  Temperature: [
    { value: "F", labelKey: "DataUnit_Temp_F" },
    { value: "C", labelKey: "DataUnit_Temp_C" },
  ],
  Windspeed: [
    { value: "mph", labelKey: "DataUnit_Wind_mph" },
    { value: "kph", labelKey: "DataUnit_Wind_kph" },
    { value: "mps", labelKey: "DataUnit_Wind_mps" },
  ],
};

export default function DataUnitComboBox({ parameter, value, onChange, ...props }) {
  const options = UNIT_OPTIONS[parameter] || [];
  return (
    <select
      className="form-select font-xs"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={options.length === 0}
      {...props}
    >
      <option value="">{TextStore.interface("DataUnit_Placeholder")}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {TextStore.interface(opt.labelKey)}
        </option>
      ))}
    </select>
  );
}
