import type { PlotData, Layout, Datum } from "plotly.js";
import type { PlotRequest, BuiltPlot } from "./plot_types";
import { resolveSeriesStyle, styleToPlotly } from "./plotStyleResolve";
import { getMergedDefaultsSync } from "./plotStyleStore";
import type { SeriesRuleKey, PlotKind as StylePlotKind } from "./plotStyleTypes";

type CategoryLabelValue = string | number | Date | null | undefined;

const PARAMETER_ALIASES: Record<string, string> = {
  FLOW: "FLOW",
  DISCHARGE: "FLOW",
  PRECIP: "PRECIPITATION",
  PRECIPITATION: "PRECIPITATION",
  STAGE: "STAGE",
  ELEVATION: "STAGE",
  STORAGE: "STORAGE",
};

/**
 * Normalizes parameter names so that FLOW, Discharge, etc. map consistently.
 * This allows multiple synonymous terms to share one rule.
 */
function normalizeParameter(value: unknown): string | undefined {
  if (value == null) return undefined;
  const key = String(value).trim().toUpperCase();
  if (!key) return undefined;
  return PARAMETER_ALIASES[key] || key;
}

function toDatumArray(value: unknown): Datum[] {
  return Array.isArray(value) ? (value as Datum[]) : [];
}

function getFirstSeries(req: PlotRequest): { x: Datum[]; y: Datum[]; name?: string } {
  const series =
    "series" in req.input && Array.isArray(req.input.series) && req.input.series.length > 0
      ? req.input.series[0]
      : { x: [], y: [] };

  return {
    x: toDatumArray(series.x),
    y: toDatumArray(series.y),
    name: (series as any).name,
  };
}

function asTrimmedString(value: unknown): string {
  return String(value ?? "").trim();
}

/* ---------------- time series ---------------- */
export function buildTimeSeries(req: PlotRequest): BuiltPlot {
  const firstSeries = getFirstSeries(req);
  const { x, y } = firstSeries;

  const options = (req.options || {}) as Record<string, unknown>;
  const stepped = Boolean(options.stepped);
  const showRangeSlider = Boolean(options.showRangeSlider);
  const lineShape = stepped ? "hv" : "linear";

  const mergedDefaults = getMergedDefaultsSync();

  const styleKey: SeriesRuleKey = {
    kind: req.kind as StylePlotKind | undefined,
    parameter: normalizeParameter(options.parameter),
    seriesName: firstSeries.name,
    seriesIndex: 0,
  };

  const resolvedStyle = mergedDefaults ? resolveSeriesStyle(mergedDefaults, styleKey) : undefined;
  const resolvedPlotlyStyle = styleToPlotly(resolvedStyle);

  const baseTrace: Partial<PlotData> = {
    type: "scatter",
    mode: "lines",
    x,
    y,
    line: { shape: lineShape },
  };

  const trace: Partial<PlotData> = Object.assign({}, baseTrace, resolvedPlotlyStyle);

  if (stepped) {
    trace.line = Object.assign({}, trace.line, { shape: "hv" });
  }

  return {
    data: [trace],
    layout: {
      title: { text: req.title || "" },
      xaxis: {
        title: { text: req.x_label || "Time" },
        type: "date",
        rangeslider: { visible: showRangeSlider },
      },
      yaxis: { title: { text: req.y_label || "" } },
    },
  };
}

/* ---------------- paired category ---------------- */
type PairedCategoryOptions = {
  labels?: string[];
  xReverse?: boolean;
  yScale?: "linear" | "log";
  styleMap?: Record<string, Partial<PlotData>>;
  yMinDecade?: number;
  xaxis?: Partial<Layout["xaxis"]>;
  parameter?: string;
};

function formatProbabilityLabel(value: unknown): string {
  const num = Number(value as any);
  if (!Number.isFinite(num)) return asTrimmedString(value);

  const commonTargets = [1, 0.99, 0.9, 0.5, 0.1, 0.01, 0.001];
  const tolerance = 0.000001;

  for (const target of commonTargets) {
    if (Math.abs(num - target) <= tolerance) return String(target);
  }

  if (num >= 0.1) return Number(num.toFixed(2)).toString();
  if (num >= 0.01) return Number(num.toFixed(3)).toString();
  return Number(num.toPrecision(3)).toString();
}

function chooseCategoryLabelFormatter(masterValues: ReadonlyArray<CategoryLabelValue>) {
  const numeric = masterValues.map((v) => Number(v as any));
  const allNumeric = numeric.every((n) => Number.isFinite(n));
  const looksLikeProbability = allNumeric && numeric.every((n) => n > 0 && n <= 1);

  return looksLikeProbability ? formatProbabilityLabel : asTrimmedString;
}

function buildLogAxis(
  allYValues: number[],
  yAxisTitle: string,
  yMinDecadeHint?: number
): Partial<Layout["yaxis"]> {
  const positive = allYValues.filter((n) => n > 0);
  const minY = positive.length ? Math.min(...positive) : 1;
  const maxY = positive.length ? Math.max(...positive) : 10;

  const minPower = Math.floor(Math.log10(yMinDecadeHint || minY));
  const maxPower = Math.ceil(Math.log10(maxY));

  const start = Math.pow(10, minPower);
  const end = Math.pow(10, maxPower);

  const decades: number[] = [];
  for (let tick = start; tick <= end; tick *= 10) decades.push(tick);

  const lastDecade = decades.length === 0 ? start : decades[decades.length - 1];

  return {
    type: "log",
    title: { text: yAxisTitle },
    tickmode: "array",
    tickvals: decades,
    ticktext: decades.map((n) => n.toLocaleString()),
    ticks: "",
    ticklen: 0,
    showgrid: true,
    gridcolor: "rgba(0,0,0,0.22)",
    gridwidth: 1.2,
    minor: {
      showgrid: true,
      dtick: "D1",
      gridcolor: "rgba(0,0,0,0.12)",
      gridwidth: 0.7,
    },
    range: [Math.log10(decades[0] || start), Math.log10(lastDecade)],
  };
}

export function buildPairedCategory(req: PlotRequest): BuiltPlot {
  const series = "series" in req.input ? req.input.series || [] : [];
  const options = (req.options || {}) as PairedCategoryOptions;

  const masterCategoryRaw: Array<CategoryLabelValue> =
    Array.isArray(options.labels) && options.labels.length > 0
      ? (options.labels as Array<CategoryLabelValue>)
      : (toDatumArray(series[0]?.x) as Array<CategoryLabelValue>);

  const formatCategoryLabel = chooseCategoryLabelFormatter(masterCategoryRaw);
  const masterCategoryLabels = masterCategoryRaw.map(formatCategoryLabel);

  const traces: Partial<PlotData>[] = [];
  const allYValues: number[] = [];

  const mergedDefaults = getMergedDefaultsSync();

  series.forEach((seriesItem, seriesIndex) => {
    const xValues = toDatumArray(seriesItem.x);
    const yValues = toDatumArray(seriesItem.y);

    const yByCategory: Record<string, number> = {};

    xValues.forEach((xValue, i) => {
      const yValue = yValues[i];
      const yNum = Number(yValue as any);
      if (!Number.isFinite(yNum)) return;

      const categoryKey = formatCategoryLabel(xValue as any);
      yByCategory[categoryKey] = yNum;
      allYValues.push(yNum);
    });

    const orderedCategories = masterCategoryLabels.slice();
    const orderedY = orderedCategories.map((category) => (category in yByCategory ? yByCategory[category] : null));

    const baseTrace: Partial<PlotData> = {
      type: "scatter",
      mode: "lines",
      connectgaps: true,
      x: orderedCategories,
      y: orderedY,
      name: (seriesItem as any).name,
    };

    const styleKey: SeriesRuleKey = {
      kind: req.kind as StylePlotKind | undefined,
      parameter: normalizeParameter(options.parameter),
      seriesName: (seriesItem as any).name,
      seriesIndex,
    };

    const resolvedStyle = mergedDefaults ? resolveSeriesStyle(mergedDefaults, styleKey) : undefined;
    const resolvedPlotlyStyle = styleToPlotly(resolvedStyle);

    const name = (seriesItem as any).name as string | undefined;
    const namedOverride = options.styleMap && name ? options.styleMap[name] : undefined;

    const trace = Object.assign({}, baseTrace, resolvedPlotlyStyle, namedOverride);
    traces.push(trace);
  });

  const categoryArray = options.xReverse ? masterCategoryLabels.slice().reverse() : masterCategoryLabels.slice();

  const wantsLogScale = options.yScale === "log";
  const yaxis: Partial<Layout["yaxis"]> = wantsLogScale
    ? buildLogAxis(allYValues, req.y_label || "", options.yMinDecade)
    : { type: "linear", title: { text: req.y_label || "" } };

  const defaultXaxis: Partial<Layout["xaxis"]> = {
    title: { text: req.x_label || "" },
    type: "category",
    categoryorder: "array",
    categoryarray: categoryArray,
  };

  const layout: Partial<Layout> = {
    title: { text: req.title || "" },
    xaxis: options.xaxis ? Object.assign({}, defaultXaxis, options.xaxis) : defaultXaxis,
    yaxis,
    margin: { l: 92, r: 220, b: 64, t: 52 },
    height: 450,
    legend: {
      orientation: "v",
      x: 1.03,
      y: 0.5,
      xanchor: "left",
      yanchor: "middle",
      bgcolor: "rgba(255,255,255,0.85)",
    },
  };

  return { data: traces, layout };
}
