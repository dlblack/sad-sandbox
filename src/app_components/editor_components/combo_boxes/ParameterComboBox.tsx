import React, { useMemo } from "react";
import { Select, SelectProps } from "@mantine/core";
import { TimeSeriesType } from "../../../timeSeries/timeSeriesType";
import { TextStore } from "../../../utils/TextStore";

type ParameterOption = {
  kind: TimeSeriesType;
  value: string;
  labelKey: string;
};


const PARAMETER_OPTIONS: ParameterOption[] = [
  { kind: TimeSeriesType.FLOW,         value: "Flow",          labelKey: "Parameter_Flow" },
  { kind: TimeSeriesType.STAGE,        value: "Stage",         labelKey: "Parameter_Stage" },
  { kind: TimeSeriesType.ELEVATION,    value: "Elev",          labelKey: "Parameter_Elev" },
  { kind: TimeSeriesType.PRECIPITATION,value: "Precipitation", labelKey: "Parameter_Precipitation" },
  { kind: TimeSeriesType.SWE,          value: "SWE",           labelKey: "Parameter_SWE" },
  { kind: TimeSeriesType.TEMPERATURE,  value: "Temperature",   labelKey: "Parameter_Temperature" },
  { kind: TimeSeriesType.WINDSPEED,    value: "Windspeed",     labelKey: "Parameter_Windspeed" },
];

type Props = {
  value?: string;
  onChange: (value: string) => void;
} & Omit<SelectProps, "data" | "value" | "onChange">;

export default function ParameterComboBox({ value, onChange, ...props }: Props) {
  const data = useMemo(
    () =>
      PARAMETER_OPTIONS.map((option) => ({
        value: option.value,
        label: TextStore.interface(option.labelKey),
      })),
    []
  );

  return (
    <Select
      size="xs"
      data={data}
      value={value ?? ""}
      onChange={(selectedValue) => onChange(selectedValue ?? "")}
      placeholder={TextStore.interface("Parameter_Placeholder")}
      searchable
      {...props}
    />
  );
}
