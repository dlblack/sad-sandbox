import React, { useMemo } from "react";
import { Select, type SelectProps } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";

type Kind = "flow" | "precipitation" | "swe";

type Dataset = {
  name?: string;
  title?: string;
  label?: string;
  id?: string;
  pathname?: unknown;
  path?: unknown;
  dssPath?: unknown;
  dataType?: string;
  type?: string;
  groupType?: string;
  parameter?: string;
  param?: string;
  Parameter?: string;
  meta?: { parameter?: string };
  [key: string]: unknown;
};

const toStr = (v: unknown): string => (v == null ? "" : String(v)).toLowerCase();

function getDataType(d?: Dataset): string {
  return toStr(d?.dataType || d?.type || d?.groupType);
}
function getDisplayName(d?: Dataset): string {
  const v = d?.name || d?.title || d?.label || d?.id || d?.pathname || "";
  return v == null ? "" : String(v);
}
function getParam(d?: Dataset): string {
  return (
    toStr(d?.parameter) ||
    toStr(d?.param) ||
    toStr(d?.Parameter) ||
    toStr(d?.meta?.parameter) ||
    ""
  );
}
function getDssCPart(d?: Dataset): string {
  const p = d?.pathname ?? d?.path ?? d?.dssPath;
  if (typeof p !== "string") return "";
  const parts = p.split("/").filter(Boolean);
  return toStr(parts[2] || "");
}
function concatCommonFields(d?: Dataset): string {
  return [d?.name, d?.title, d?.label, (d as any)?.group, d?.type, d?.dataType, d?.pathname, d?.id]
    .map(toStr)
    .join(" ");
}

function classifyKind(d?: Dataset): Kind | "" {
  const param = getParam(d);
  const dtype = getDataType(d);
  const c = getDssCPart(d);
  const all = concatCommonFields(d);

  if (
    param === "flow" ||
    param === "discharge" ||
    dtype === "discharge" ||
    c.includes("flow") ||
    c.includes("discharge") ||
    all.includes(" cfs") ||
    all.includes(" cms")
  ) {
    return "flow";
  }
  if (
    param === "precipitation" ||
    param === "precip" ||
    param === "pcp" ||
    c.includes("precip") ||
    c.includes("pcp") ||
    all.includes("precip") ||
    all.includes("rain") ||
    all.includes("ppt")
  ) {
    return "precipitation";
  }
  if (
    param === "swe" ||
    c.includes("swe") ||
    all.includes("snow water equivalent") ||
    all.includes("snow-water-equivalent")
  ) {
    return "swe";
  }
  return "";
}

function filterByKindOrNeedles(
  datasetList: Dataset[] = [],
  opts: { kind?: Kind; needles?: Array<string | number> }
): Dataset[] {
  if (!Array.isArray(datasetList)) return [];
  const { kind, needles = [] } = opts;

  if (kind) {
    const exact = datasetList.filter((d) => classifyKind(d) === kind);
    if (exact.length) return exact;
  }

  if (needles.length) {
    const filtered = datasetList.filter((d) => {
      const hay = `${getParam(d)} ${getDataType(d)} ${getDssCPart(d)} ${concatCommonFields(d)}`.toLowerCase();
      return needles.some((n) => hay.includes(toStr(n)));
    });
    if (filtered.length) return filtered;
  }

  return [];
}

type Option = { label: string; value: string };
const toOptions = (list: Dataset[] = []): Option[] =>
  list.map((d) => {
    const name = getDisplayName(d);
    return { label: name, value: name };
  });

export type TimeSeriesComboBoxProps = Omit<SelectProps, "data" | "value" | "onChange"> & {
  id?: string;
  datasets?: Dataset[];
  kind?: Kind;
  needles?: Array<string | number>;
  value?: string;
  onChange?: (value: string) => void;
  debug?: boolean;
};

export function TimeSeriesComboBox({
                                     id,
                                     datasets = [],
                                     kind,
                                     needles = [],
                                     value,
                                     onChange,
                                     debug = false,
                                     placeholder = TextStore.interface?.("TimeSeriesCombo_None") || "None",
                                     searchable = true,
                                     clearable = true,
                                     nothingFoundMessage = TextStore.interface?.("Combo_NoneFound") || "No matches",
                                     ...rest
                                   }: TimeSeriesComboBoxProps) {
  const { options, has } = useMemo(() => {
    const matches = filterByKindOrNeedles(datasets, { kind, needles });
    const opts = toOptions(matches);
    return { options: opts, has: opts.length > 0 };
  }, [datasets, kind, needles]);

  const isInOptions = (val?: string): boolean => !!val && options.some((o) => o.value === val);
  const derived = has ? (isInOptions(value) ? value! : null) : null;

  if (debug) {
    console.debug(`[${id ?? "ts-combo"}]`, {
      kind,
      needles,
      datasetsCount: Array.isArray(datasets) ? datasets.length : 0,
      matchedCount: options.length,
      matched: options.map((o) => o.value),
      value,
      derived,
      disabled: !has,
    });
  }

  return (
    <Select
      id={id}
      data={options}
      value={derived}
      onChange={(val) => onChange?.(val ?? "")}
      disabled={!has}
      searchable={searchable}
      clearable={clearable}
      placeholder={placeholder}
      nothingFoundMessage={nothingFoundMessage}
      {...rest}
    />
  );
}

export function FlowTimeSeriesComboBox(props: Omit<TimeSeriesComboBoxProps, "kind" | "needles">) {
  return <TimeSeriesComboBox {...props} kind="flow" needles={["flow", "discharge", "cfs", "cms"]} />;
}

export function PrecipTimeSeriesComboBox(props: Omit<TimeSeriesComboBoxProps, "kind" | "needles">) {
  return (
    <TimeSeriesComboBox {...props} kind="precipitation" needles={["precip", "precipitation", "rain", "ppt", "pcp"]} />
  );
}

export function SweTimeSeriesComboBox(props: Omit<TimeSeriesComboBoxProps, "kind" | "needles">) {
  return <TimeSeriesComboBox {...props} kind="swe" needles={["swe", "snow water equivalent", "snow-water-equivalent"]} />;
}
