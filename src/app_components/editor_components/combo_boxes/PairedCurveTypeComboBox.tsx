import React, { useMemo } from "react";
import { Select, SelectProps } from "@mantine/core";
import { TextStore } from "../../../utils/TextStore";

export const CURVE_TYPE_DEFAULTS = {
  "Elev-Stor": { yUnits: "acre-ft", xLabel: "Elevation", xUnits: "ft" },
  "Stage-Disch": { yUnits: "cfs", xLabel: "Stage", xUnits: "ft" },
  "Freq-Flow": { yUnits: "cfs", xLabel: "Frequency", xUnits: "%" },
};

export const CURVE_TYPE_OPTIONS = [
  { value: "Elev-Stor", labelKey: "PairedCurveType_ElevStor" },
  { value: "Stage-Disch", labelKey: "PairedCurveType_StageDisch" },
  { value: "Freq-Flow", labelKey: "PairedCurveType_FreqFlow" },
];

type Props = {
  value?: string;
  onChange: (value: string) => void;
} & Omit<SelectProps, "data" | "value" | "onChange">;

export default function PairedCurveTypeComboBox({ value, onChange, ...props }: Props) {
  const data = useMemo(
      () => CURVE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: TextStore.interface(o.labelKey) })),
      []
  );

  return (
      <Select
          size="xs"
          data={data}
          value={value ?? ""}
          onChange={(v) => onChange(v ?? "")}
          placeholder={TextStore.interface("PairedCurveType_Placeholder")}
          searchable
          {...props}
      />
  );
}
