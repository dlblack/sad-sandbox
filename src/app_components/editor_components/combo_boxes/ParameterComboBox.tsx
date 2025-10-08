import React, { useMemo } from "react";
import { Select, SelectProps } from "@mantine/core";
import { TextStore } from "../../../utils/TextStore";

const PARAMETER_OPTIONS = [
  { value: "Flow", labelKey: "Parameter_Flow" },
  { value: "Stage", labelKey: "Parameter_Stage" },
  { value: "Elev", labelKey: "Parameter_Elev" },
  { value: "Precipitation", labelKey: "Parameter_Precipitation" },
  { value: "SWE", labelKey: "Parameter_SWE" },
  { value: "Temperature", labelKey: "Parameter_Temperature" },
  { value: "Windspeed", labelKey: "Parameter_Windspeed" },
];

type Props = {
  value?: string;
  onChange: (value: string) => void;
} & Omit<SelectProps, "data" | "value" | "onChange">;

export default function ParameterComboBox({ value, onChange, ...props }: Props) {
  const data = useMemo(
      () => PARAMETER_OPTIONS.map((o) => ({ value: o.value, label: TextStore.interface(o.labelKey) })),
      []
  );

  return (
      <Select
          size="xs"
          data={data}
          value={value ?? ""}
          onChange={(v) => onChange(v ?? "")}
          placeholder={TextStore.interface("Parameter_Placeholder")}
          searchable
          {...props}
      />
  );
}
