import React, { useMemo } from "react";
import { Select, SelectProps } from "@mantine/core";
import { TextStore } from "../../../utils/TextStore";

export type DataUnitType = "PerAver" | "PerCum" | "InstVal" | "InstCum";

export type DataUnitTypeOption = { value: DataUnitType; labelKey: string };

export const DATA_TYPE_OPTIONS: DataUnitTypeOption[] = [
  { value: "PerAver", labelKey: "DataUnitType_PerAver" },
  { value: "PerCum",  labelKey: "DataUnitType_PerCum"  },
  { value: "InstVal", labelKey: "DataUnitType_InstVal" },
  { value: "InstCum", labelKey: "DataUnitType_InstCum" },
];

type Props = {
  value?: DataUnitType | "";
  onChange: (value: DataUnitType | "") => void;
} & Omit<SelectProps, "data" | "value" | "onChange">;

export default function DataUnitTypeComboBox({ value, onChange, ...props }: Props) {
  const data = useMemo(
      () =>
          DATA_TYPE_OPTIONS.map((opt) => ({
            value: opt.value,
            label: TextStore.interface(opt.labelKey),
          })),
      []
  );

  return (
      <Select
          size="xs"
          data={data}
          value={value ?? ""}
          onChange={(v) => onChange((v as DataUnitType) ?? "")}
          placeholder={TextStore.interface("DataUnitType_Placeholder")}
          {...props}
      />
  );
}
