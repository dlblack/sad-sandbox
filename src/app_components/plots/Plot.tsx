import React from "react";
import type { Datum } from "plotly.js";
import type { PlotRequest, PlotDataInput, BuiltPlot } from "./plot_types";
import { buildTimeSeries, buildPairedCategory } from "./plot_builders";
import Chart from "./Chart";

type PlotKind = "time_series" | "paired_xy";
type PropsBag = Record<string, unknown>;

function isIsoTimestamp(value: unknown): boolean {
  return typeof value === "string" && value.includes("T");
}

function isDateObject(value: unknown): value is Date {
  return value instanceof Date;
}

function inferKindFromFirstSeries(series: { x?: Datum[] }[] | undefined): PlotKind {
  const firstX =
    Array.isArray(series) && series.length > 0 && Array.isArray(series[0]?.x)
      ? (series[0]!.x as Datum[])
      : [];

  if (firstX.length === 0) return "paired_xy";

  const firstXValue = firstX[0];
  return isIsoTimestamp(firstXValue) || isDateObject(firstXValue) ? "time_series" : "paired_xy";
}

function getCPartFromDssPath(pathname: unknown): string | undefined {
  if (typeof pathname !== "string") return undefined;
  const parts = pathname.split("/");
  const cPart = parts.length >= 4 ? parts[3] : "";
  return cPart ? cPart.toUpperCase() : undefined;
}

function pickFirstPathname(props: PropsBag): string | undefined {
  const single = props.pathname;
  if (typeof single === "string") return single;

  const firstFromArray =
    Array.isArray(props.pathname) && props.pathname.length > 0 ? props.pathname[0] : undefined;
  if (typeof firstFromArray === "string") return firstFromArray;

  const altSingle = props.pathnames;
  if (typeof altSingle === "string") return altSingle;

  const altFirstFromArray =
    Array.isArray(props.pathnames) && props.pathnames.length > 0 ? props.pathnames[0] : undefined;
  if (typeof altFirstFromArray === "string") return altFirstFromArray;

  return undefined;
}

function inferParameterFromYLabel(yLabel: unknown): string | undefined {
  if (typeof yLabel !== "string") return undefined;
  const trimmed = yLabel.trim();
  if (!trimmed) return undefined;

  const parenIndex = trimmed.indexOf("(");
  const core = parenIndex > 0 ? trimmed.slice(0, parenIndex).trim() : trimmed;

  return core || undefined;
}

function inferParameter(props: PropsBag): string | undefined {
  const directParameter = props.parameter;
  if (typeof directParameter === "string" && directParameter.trim()) return directParameter.trim();

  const dataset = props.dataset as PropsBag | undefined;
  if (dataset && typeof dataset.parameter === "string" && dataset.parameter.trim()) {
    return dataset.parameter.trim();
  }

  const meta = props.meta as PropsBag | undefined;
  if (meta && typeof meta.parameter === "string" && meta.parameter.trim()) {
    return meta.parameter.trim();
  }

  const firstPathname = pickFirstPathname(props);
  const cPart = firstPathname ? getCPartFromDssPath(firstPathname) : undefined;
  if (cPart) return cPart;

  const fromY = inferParameterFromYLabel(props.yLabel);
  if (fromY) return fromY;

  return undefined;
}

function withInferredParameter(options: PropsBag, parameter: string | undefined): PropsBag {
  if (!parameter) return options;
  if (typeof options.parameter === "string" && options.parameter.trim()) return options;
  return { ...options, parameter };
}

function normalizeToPlotRequest(rawProps: unknown): PlotRequest {
  const props: PropsBag = (rawProps && typeof rawProps === "object" ? rawProps : {}) as PropsBag;
  const inferredParameter = inferParameter(props);

  // Case 1: already a PlotRequest-like object
  if ("input" in props && props.input) {
    const request = props as unknown as PlotRequest;
    const mergedOptions = withInferredParameter({ ...(request.options || {}) } as PropsBag, inferredParameter);

    if (typeof (props as any).showRangeSlider === "boolean") {
      (mergedOptions as any).showRangeSlider = Boolean((props as any).showRangeSlider);
    }

    if (typeof request.kind === "string") {
      return { ...request, options: mergedOptions };
    }

    const series = "series" in request.input ? ((request.input as any).series as any) : undefined;
    const inferredKind = inferKindFromFirstSeries(series);
    return { ...request, kind: inferredKind, options: mergedOptions };
  }

  // Case 2: x/y arrays provided directly
  if (Array.isArray(props.x) && Array.isArray(props.y)) {
    const x = props.x as Datum[];
    const y = props.y as Datum[];
    const inferredKind = inferKindFromFirstSeries([{ x }]);
    const showRangeSlider = Boolean(props.showRangeSlider);

    if (inferredKind === "time_series") {
      const xAsIso = x.map((xValue) => (xValue instanceof Date ? xValue.toISOString() : xValue));

      const options = withInferredParameter(
        {
          stepped: Boolean(props.stepped),
          showRangeSlider,
        },
        inferredParameter
      );

      return {
        kind: "time_series",
        title: props.title as any,
        x_label: "Time",
        y_label: props.yLabel as any,
        input: { series: [{ x: xAsIso, y }] },
        options,
      };
    }

    const options = withInferredParameter(
      {
        labels: Array.isArray(props.labels) ? props.labels : undefined,
        xReverse: Boolean(props.xReverse),
        yScale: (props.yScale as any) || "linear",
        styleMap: props.styleMap as any,
        xaxis: props.xaxis as any,
      },
      inferredParameter
    );

    return {
      kind: "paired_xy",
      title: props.title as any,
      x_label: props.xLabel as any,
      y_label: props.yLabel as any,
      input: { series: [{ x, y }] },
      options,
    };
  }

  // Case 3: nothing usable; return empty paired plot
  const emptyInput: PlotDataInput = { series: [{ x: [], y: [] }] };
  const options = withInferredParameter({ stepped: Boolean((props as any).stepped) }, inferredParameter);

  return {
    kind: "paired_xy",
    title: "",
    input: emptyInput,
    options,
  };
}

function pickPlotBuilder(request: PlotRequest) {
  if (request.kind === "time_series") return buildTimeSeries;
  if (request.kind === "paired_xy") return buildPairedCategory;

  const series = "series" in request.input ? (request.input as any).series : undefined;
  const inferredKind = inferKindFromFirstSeries(series as any);
  return inferredKind === "time_series" ? buildTimeSeries : buildPairedCategory;
}

export default function Plot(props: PropsBag) {
  const request = normalizeToPlotRequest(props);
  const builder = pickPlotBuilder(request);
  const built: BuiltPlot = builder(request);
  return <Chart data={built.data} layout={built.layout} />;
}
