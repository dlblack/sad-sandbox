import React from "react";
import { TextStore } from "../../../../utils/TextStore";

type Kind = "flow" | "precipitation" | "swe";

type Dataset = {
  name?: string;
  title?: string;
  label?: string;
  id?: string;
  pathname?: string;
  path?: string;
  dssPath?: string;
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
  return d?.name || d?.title || d?.label || d?.id || d?.pathname || "";
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
  // DSS-style pathname: /A/B/C/D/E/F/
  const p = d?.pathname || d?.path || d?.dssPath;
  if (!p || typeof p !== "string") return "";
  const parts = p.split("/").filter(Boolean);
  // A=0, B=1, C=2
  return toStr(parts[2] || "");
}

function concatCommonFields(d?: Dataset): string {
  return [
    d?.name,
    d?.title,
    d?.label,
    d?.group,
    d?.type,
    d?.dataType,
    d?.pathname,
    d?.id,
  ]
    .map(toStr)
    .join(" ");
}

/** Try to normalize a dataset to a canonical parameter "kind" */
function classifyKind(d?: Dataset): Kind | "" {
  const param = getParam(d);
  const dtype = getDataType(d);
  const c = getDssCPart(d);
  const all = concatCommonFields(d);

  // flow
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

  // precipitation
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

  // swe
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
      // BUGFIX: getDataType(d) (previous code called getDataType() without arg)
      const hay = `${getParam(d)} ${getDataType(d)} ${getDssCPart(d)} ${concatCommonFields(d)}`.toLowerCase();
      return needles.some((n) => hay.includes(toStr(n)));
    });
    if (filtered.length) return filtered;
  }

  return [];
}

type Option = { label: string; value: string };

function toOptions(list: Dataset[] = []): Option[] {
  return list.map((d) => {
    const name = getDisplayName(d);
    return { label: name, value: name };
  });
}

export type TimeSeriesComboBoxProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
"onChange" | "value"
> & {
  id?: string;
  datasets?: Dataset[];
  kind?: Kind;                 // "flow" | "precipitation" | "swe"
  needles?: Array<string | number>; // fallback fuzzy search terms
  value?: string;              // controlled value; default is "None" (empty)
  onChange?: (value: string) => void;
  className?: string;
  debug?: boolean;
};

export function TimeSeriesComboBox({
                                     id,
                                     datasets = [],
                                     kind,
                                     needles = [],
                                     value,
                                     onChange,
                                     className = "form-select font-xs",
                                     debug = false,
                                     ...props
                                   }: TimeSeriesComboBoxProps) {
  const matches = filterByKindOrNeedles(datasets, { kind, needles });
  const options = toOptions(matches);
  const has = options.length > 0;

  const isInOptions = (val?: string): boolean =>
    !!val && options.some((o) => o.value === val);

  // Always default to "None" ("") unless parent provides a valid option.
  const derived = has ? (isInOptions(value) ? value! : "") : "";

  if (debug) {
    // eslint-disable-next-line no-console
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

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <select
      id={id}
      className={className}
      disabled={!has}              /* disabled if no options */
      value={has ? derived : ""}   /* "" selects the "None" option */
      onChange={handleChange}
      {...props}
    >
      <option value="">
        {TextStore.interface?.("TimeSeriesCombo_None") || "None"}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function FlowTimeSeriesComboBox(props: Omit<TimeSeriesComboBoxProps, "kind" | "needles">) {
  return (
    <TimeSeriesComboBox
      {...props}
      kind="flow"
      needles={["flow", "discharge", "cfs", "cms"]}
    />
  );
}

export function PrecipTimeSeriesComboBox(props: Omit<TimeSeriesComboBoxProps, "kind" | "needles">) {
  return (
    <TimeSeriesComboBox
      {...props}
      kind="precipitation"
      needles={["precip", "precipitation", "rain", "ppt", "pcp"]}
    />
  );
}

export function SweTimeSeriesComboBox(props: Omit<TimeSeriesComboBoxProps, "kind" | "needles">) {
  return (
    <TimeSeriesComboBox
      {...props}
      kind="swe"
      needles={["swe", "snow water equivalent", "snow-water-equivalent"]}
    />
  );
}
