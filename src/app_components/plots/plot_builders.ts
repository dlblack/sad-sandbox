import type { PlotData, Layout, Datum } from "plotly.js";
import type { PlotRequest, BuiltPlot } from "./plot_types";
import { resolveSeriesStyle, styleToPlotly } from "./plotStyleResolve";
import { getMergedDefaultsSync } from "./plotStyleStore";
import type { SeriesRuleKey, PlotKind as StylePlotKind } from "./plotStyleTypes";

type Labelish = string | number | Date | null | undefined;

/* ---------------- normalization ---------------- */
/**
 * Normalizes parameter names so that FLOW, Discharge, etc. map consistently.
 * This allows multiple synonymous terms to share one rule.
 */
function normalizeParameter(p: any): string | undefined {
    if (!p) return undefined;
    const text = String(p).trim().toUpperCase();

    const aliases: Record<string, string> = {
        FLOW: "FLOW",
        DISCHARGE: "FLOW",
        PRECIP: "PRECIPITATION",
        PRECIPITATION: "PRECIPITATION",
        STAGE: "STAGE",
        ELEVATION: "STAGE",
        STORAGE: "STORAGE"
    };

    return aliases[text] || text;
}

/* ---------------- time series ---------------- */
export function buildTimeSeries(req: PlotRequest): BuiltPlot {
    const s =
        "series" in req.input && Array.isArray(req.input.series) && req.input.series.length > 0
            ? req.input.series[0]
            : { x: [], y: [] };

    const x = Array.isArray(s.x) ? (s.x as Datum[]) : [];
    const y = Array.isArray(s.y) ? (s.y as Datum[]) : [];

    const stepped = Boolean((req.options as any)?.stepped);
    const lineShape = stepped ? "hv" : "linear";

    const merged = getMergedDefaultsSync();

    const key: SeriesRuleKey = {
        kind: req.kind as StylePlotKind | undefined,
        parameter: normalizeParameter((req.options as any)?.parameter),
        seriesName: s.name,
        seriesIndex: 0
    };

    const auto = merged ? resolveSeriesStyle(merged, key) : undefined;
    const autoPlotly = styleToPlotly(auto);

    const base: Partial<PlotData> = {
        type: "scatter",
        mode: "lines",
        x,
        y,
        line: { shape: lineShape }
    };

    const trace: Partial<PlotData> = Object.assign({}, base, autoPlotly);

    return {
        data: [trace],
        layout: {
            title: { text: req.title || "" },
            xaxis: { title: { text: req.x_label || "Time" } },
            yaxis: { title: { text: req.y_label || "" } }
        }
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

const asDatumArray = (v: unknown): Datum[] => (Array.isArray(v) ? (v as Datum[]) : []);
const asString = (v: any): string => String(v ?? "").trim();

function probLabel(v: any): string {
    const n = Number(v);
    if (!Number.isFinite(n)) return asString(v);
    const targets = [1, 0.99, 0.9, 0.5, 0.1, 0.01, 0.001];
    const tol = 0.000001;
    for (const t of targets) if (Math.abs(n - t) <= tol) return String(t);
    if (n >= 0.1) return Number(n.toFixed(2)).toString();
    if (n >= 0.01) return Number(n.toFixed(3)).toString();
    return Number(n.toPrecision(3)).toString();
}

function chooseLabelFn(masterRaw: ReadonlyArray<Labelish>) {
    const nums = masterRaw.map((v) => Number(v as any));
    const allNumeric = nums.every((m) => Number.isFinite(m));
    const inProbRange = allNumeric && nums.every((m) => m > 0 && m <= 1);
    return inProbRange ? probLabel : asString;
}

export function buildPairedCategory(req: PlotRequest): BuiltPlot {
    const series = "series" in req.input ? req.input.series || [] : [];
    const opts = (req.options || {}) as PairedCategoryOptions;

    const masterRaw: Array<Labelish> =
        Array.isArray(opts.labels) && opts.labels.length > 0
            ? (opts.labels as Array<Labelish>)
            : (asDatumArray(series[0]?.x) as Array<Labelish>);

    const labelFn = chooseLabelFn(masterRaw);
    const masterLabels = masterRaw.map(labelFn);

    const traces: Partial<PlotData>[] = [];
    const allY: number[] = [];

    const merged = getMergedDefaultsSync();

    series.forEach((s, si) => {
        const sx = asDatumArray(s.x);
        const sy = asDatumArray(s.y);

        const map: Record<string, number> = {};
        sx.forEach((xVal, i) => {
            const yVal = sy[i];
            const num = Number(yVal as any);
            if (Number.isFinite(num)) {
                const k = labelFn(xVal);
                map[k] = num;
                allY.push(num);
            }
        });

        const orderedX = masterLabels.slice();
        const orderedY = orderedX.map((lab) => (lab in map ? map[lab] : null));

        const base: Partial<PlotData> = {
            type: "scatter",
            mode: "lines",
            connectgaps: true,
            x: orderedX,
            y: orderedY,
            name: s.name
        };

        const key: SeriesRuleKey = {
            kind: req.kind as StylePlotKind | undefined,
            parameter: normalizeParameter(opts.parameter),
            seriesName: s.name,
            seriesIndex: si
        };

        const auto = merged ? resolveSeriesStyle(merged, key) : undefined;
        const autoPlotly = styleToPlotly(auto);
        const namedOverride = opts.styleMap && s.name ? opts.styleMap[s.name] : undefined;

        const trace = Object.assign({}, base, autoPlotly, namedOverride);
        traces.push(trace);
    });

    const categoryArray = Boolean(opts.xReverse)
        ? masterLabels.slice().reverse()
        : masterLabels.slice();

    const wantsLog = opts.yScale === "log";
    let yaxis: Partial<Layout["yaxis"]>;

    if (wantsLog) {
        const positiveY = allY.filter((v) => v > 0);
        const minY = positiveY.length ? Math.min(...positiveY) : 1;
        const maxY = positiveY.length ? Math.max(...positiveY) : 10;

        const minP = Math.floor(Math.log10(opts.yMinDecade || minY));
        const maxP = Math.ceil(Math.log10(maxY));

        const start = Math.pow(10, minP);
        const end = Math.pow(10, maxP);
        const decades: number[] = [];
        for (let tick = start; tick <= end; tick *= 10) decades.push(tick);

        yaxis = {
            type: "log",
            title: { text: req.y_label || "" },
            tickmode: "array",
            tickvals: decades,
            ticktext: decades.map((v) => v.toLocaleString()),
            ticks: "",
            ticklen: 0,
            showgrid: true,
            gridcolor: "rgba(0,0,0,0.22)",
            gridwidth: 1.2,
            minor: {
                showgrid: true,
                dtick: "D1",
                gridcolor: "rgba(0,0,0,0.12)",
                gridwidth: 0.7
            },
            range: [
                Math.log10(decades[0]),
                Math.log10(decades[decades.length === 0 ? 0 : decades.length - 1])
            ]
        };
    } else {
        yaxis = { type: "linear", title: { text: req.y_label || "" } };
    }

    const defaultXaxis: Partial<Layout["xaxis"]> = {
        title: { text: req.x_label || "" },
        type: "category",
        categoryorder: "array",
        categoryarray: categoryArray
    };

    const layout: Partial<Layout> = {
        title: { text: req.title || "" },
        xaxis: opts.xaxis ? Object.assign({}, defaultXaxis, opts.xaxis) : defaultXaxis,
        yaxis,
        margin: { l: 92, r: 220, b: 64, t: 52 },
        height: 450,
        legend: {
            orientation: "v",
            x: 1.03,
            y: 0.5,
            xanchor: "left",
            yanchor: "middle",
            bgcolor: "rgba(255,255,255,0.85)"
        }
    };

    return { data: traces, layout };
}
