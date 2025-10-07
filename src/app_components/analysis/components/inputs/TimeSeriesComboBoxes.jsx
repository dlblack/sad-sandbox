import React from "react";
import { TextStore } from "../../../../utils/TextStore";

const toStr = (v) => (v == null ? "" : String(v)).toLowerCase();

function getDataType(d) {
  return toStr(d?.dataType || d?.type || d?.groupType);
}

function getDisplayName(d) {
  return d?.name || d?.title || d?.label || d?.id || d?.pathname || "";
}

function getParam(d) {
  return (
    toStr(d?.parameter) ||
    toStr(d?.param) ||
    toStr(d?.Parameter) ||
    toStr(d?.meta?.parameter) ||
    ""
  );
}

function getDssCPart(d) {
  // If you have DSS-style pathnames: /A/B/C/D/E/F/
  const p = d?.pathname || d?.path || d?.dssPath;
  if (!p || typeof p !== "string") return "";
  const parts = p.split("/").filter(Boolean);
  // A=0, B=1, C=2
  return toStr(parts[2] || "");
}

function concatCommonFields(d) {
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
function classifyKind(d) {
  const param = getParam(d);
  const dtype = getDataType(d);
  const c = getDssCPart(d);
  const all = concatCommonFields(d);

  // flow
  if (
    param === "flow" ||
    param === "discharge" || dtype === "discharge" ||
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

function filterByKindOrNeedles(datasetList = [], { kind, needles = [] }) {
  if (!Array.isArray(datasetList)) return [];

  if (kind) {
    const exact = datasetList.filter((d) => classifyKind(d) === kind);
    if (exact.length) return exact;
  }

  if (needles.length) {
    const filtered = datasetList.filter((d) => {
      const hay =
        `${getParam(d)} ${getDataType()} ${getDssCPart(d)} ${concatCommonFields(d)}`.toLowerCase();
      return needles.some((n) => hay.includes(toStr(n)));
    });
    if (filtered.length) return filtered;
  }

  return [];
}

function toOptions(list = []) {
  return list.map((d) => {
    const name = getDisplayName(d);
    return { label: name, value: name };
  });
}

export function TimeSeriesComboBox({
                                     id,
                                     datasets = [],
                                     kind,                 // "flow" | "precipitation" | "swe"
                                     needles = [],         // fallback fuzzy search terms
                                     value,                // controlled value from parent; leave empty/undefined to default to "None"
                                     onChange,
                                     // selectedDataset is intentionally ignored so we don't auto-fill
                                     className = "form-select font-xs",
                                     debug = false,
                                     ...props
                                   }) {
  const matches = filterByKindOrNeedles(datasets, { kind, needles });
  const options = toOptions(matches);
  const has = options.length > 0;

  const isInOptions = (val) => !!val && options.some((o) => o.value === val);

  // Always default to "None" ("") unless parent provides a valid option.
  // No auto-selecting the first option. No fallback to selectedDataset.
  const derived = has ? (isInOptions(value) ? value : "") : "";

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
    <select
      id={id}
      className={className}
      disabled={!has}               // disabled if no options
      value={has ? derived : ""}    // "" selects the "None" option
      onChange={(e) => onChange?.(e.target.value)}
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

export function FlowTimeSeriesComboBox(props) {
  return (
    <TimeSeriesComboBox
      {...props}
      kind="flow"
      needles={["flow", "discharge", "cfs", "cms"]}
    />
  );
}

export function PrecipTimeSeriesComboBox(props) {
  return (
    <TimeSeriesComboBox
      {...props}
      kind="precipitation"
      needles={["precip", "precipitation", "rain", "ppt", "pcp"]}
    />
  );
}

export function SweTimeSeriesComboBox(props) {
  return (
    <TimeSeriesComboBox
      {...props}
      kind="swe"
      needles={["swe", "snow water equivalent", "snow-water-equivalent"]}
    />
  );
}
