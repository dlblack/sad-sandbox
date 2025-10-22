import React from "react";
import type { Datum } from "plotly.js";
import type { PlotRequest, PlotDataInput, BuiltPlot } from "./plot_types";
import { buildTimeSeries, buildPairedCategory } from "./plot_builders";
import Chart from "./Chart";

/* ---------- tiny helpers (self-contained, no hardcoding of parameters) ---------- */

function isIsoString(v: unknown): boolean {
    return typeof v === "string" && v.indexOf("T") >= 0;
}

function pickKindFromSeries(series: { x?: Datum[] }[] | undefined): "time_series" | "paired_xy" {
    const x0 = Array.isArray(series) && series.length > 0 && Array.isArray(series[0]?.x)
        ? (series[0]?.x as Datum[])
        : [];
    if (x0.length > 0 && (isIsoString(x0[0]) || x0[0] instanceof Date)) return "time_series";
    return "paired_xy";
}

/** Extract the DSS C-part (4th token) if path looks like /A/B/C/D/E/F/ */
function getCPart(path?: unknown): string | undefined {
    if (typeof path !== "string") return undefined;
    const parts = path.split("/");
    // parts: ["", "A", "B", "C", "D", "E", "F", ""] → C at index 3
    if (parts.length >= 4 && parts[3]) return parts[3].toUpperCase();
    return undefined;
}

/** Try to infer a meaningful parameter label from a y-axis label like "Discharge (cfs)" → "Discharge" */
function fromYLabel(y?: unknown): string | undefined {
    if (typeof y !== "string") return undefined;
    const trimmed = y.trim();
    if (!trimmed) return undefined;
    const paren = trimmed.indexOf("(");
    const core = paren > 0 ? trimmed.slice(0, paren).trim() : trimmed;
    return core || undefined;
}

/** One place to infer the parameter from various shapes the app already passes around */
function inferParameter(props: any): string | undefined {
    // 1) explicit
    if (typeof props?.parameter === "string" && props.parameter.trim()) return props.parameter.trim();

    // 2) common metadata slots
    if (typeof props?.dataset?.parameter === "string" && props.dataset.parameter.trim()) {
        return props.dataset.parameter.trim();
    }
    if (typeof props?.meta?.parameter === "string" && props.meta.parameter.trim()) {
        return props.meta.parameter.trim();
    }

    // 3) DSS pathname(s)
    if (typeof props?.pathname === "string") {
        const c = getCPart(props.pathname);
        if (c) return c;
    }
    if (Array.isArray(props?.pathname) && props.pathname.length > 0) {
        const c = getCPart(props.pathname[0]);
        if (c) return c;
    }
    if (typeof props?.pathnames === "string") {
        const c = getCPart(props.pathnames);
        if (c) return c;
    }
    if (Array.isArray(props?.pathnames) && props.pathnames.length > 0) {
        const c = getCPart(props.pathnames[0]);
        if (c) return c;
    }

    // 4) fall back to yLabel text (sans units) as a human-readable parameter name
    const yl = fromYLabel(props?.yLabel);
    if (yl) return yl;

    // Nothing found
    return undefined;
}

function normalizeToRequest(props: any): PlotRequest {
    const inferredParam = inferParameter(props);

    // Already a PlotRequest with input
    if (props && typeof props === "object" && "input" in props && (props as PlotRequest).input) {
        const req = props as PlotRequest;
        const nextOptions = Object.assign({}, req.options || {});
        if (inferredParam && !nextOptions.parameter) (nextOptions as any).parameter = inferredParam;

        if (typeof req.kind === "string") return { ...req, options: nextOptions };

        // infer kind from series if not provided
        const series = "series" in req.input ? (req.input as any).series : undefined;
        const inferredKind = pickKindFromSeries(series as any);
        return { ...req, kind: inferredKind, options: nextOptions };
    }

    // Raw x and y handed directly
    if (Array.isArray(props?.x) && Array.isArray(props?.y)) {
        const x = props.x as Datum[];
        const y = props.y as Datum[];
        const inferredKind = pickKindFromSeries([{ x }]);

        if (inferredKind === "time_series") {
            const options: Record<string, unknown> = { stepped: Boolean(props.stepped) };
            if (inferredParam) (options as any).parameter = inferredParam;

            return {
                kind: "time_series",
                title: props.title,
                x_label: "Time",
                y_label: props.yLabel,
                input: { series: [{ x, y }] },
                options
            };
        }

        const options: Record<string, unknown> = {
            labels: Array.isArray(props.labels) ? props.labels : undefined,
            xReverse: Boolean(props.xReverse),
            yScale: props.yScale || "linear",
            styleMap: props.styleMap,
            xaxis: props.xaxis
        };
        if (inferredParam) (options as any).parameter = inferredParam;

        return {
            kind: "paired_xy",
            title: props.title,
            x_label: props.xLabel,
            y_label: props.yLabel,
            input: { series: [{ x, y }] },
            options
        };
    }

    // If nothing recognizable, return an empty paired request
    const empty: PlotDataInput = { series: [{ x: [], y: [] }] };
    const options: Record<string, unknown> = {};
    if (inferredParam) (options as any).parameter = inferredParam;

    return { kind: "paired_xy", title: "", input: empty, options };
}

function pickBuilder(req: PlotRequest) {
    if (req.kind === "time_series") return buildTimeSeries;
    if (req.kind === "paired_xy") return buildPairedCategory;

    // last resort inference
    const series = "series" in req.input ? (req.input as any).series : undefined;
    const inferred = pickKindFromSeries(series as any);
    return inferred === "time_series" ? buildTimeSeries : buildPairedCategory;
}

/* ---------- component ---------- */

export default function Plot(props: any) {
    const req = normalizeToRequest(props);
    const builder = pickBuilder(req);
    const built: BuiltPlot = builder(req);
    return <Chart data={built.data} layout={built.layout} />;
}
