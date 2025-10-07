import React, { useMemo } from "react";
import { Select, SelectProps } from "@mantine/core";
import { TextStore } from "../../../utils/TextStore";

type UnitOption = { value: string; labelKey: string };
type UnitMap = Record<string, UnitOption[]>;

const UNIT_OPTIONS: UnitMap = {
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
    { value: "m", labelKey: "DataUnit_Stage_m" },
  ],
  Elev: [
    { value: "ft", labelKey: "DataUnit_Elev_ft" },
    { value: "m", labelKey: "DataUnit_Elev_m" },
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

type Props = {
  parameter?: string;
  value?: string;
  onChange: (value: string) => void;
} & Omit<SelectProps, "data" | "value" | "onChange">;

export default function DataUnitComboBox({ parameter, value, onChange, ...props }: Props) {
  const options = UNIT_OPTIONS[parameter ?? ""] ?? [];
  const data = useMemo(
      () => options.map((opt) => ({ value: opt.value, label: TextStore.interface(opt.labelKey) })),
      [options]
  );

  return (
      <Select
          size="xs"
          data={data}
          value={value ?? ""}
          onChange={(v) => onChange(v ?? "")}
          placeholder={TextStore.interface("DataUnit_Placeholder")}
          disabled={data.length === 0}
          searchable
          {...props}
      />
  );
}
