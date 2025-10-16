import { useEffect, useMemo, useState } from "react";
import Chart from "./Chart";
import { AnalysisShape, buildPairedCategoryXAxis, isFlowFrequency } from "./axisHelpers";
import { styleForPeakFlowFreq } from "./styleHelpers";

/** DSS read shape */
type PdJson = { x?: Array<number | string>; y?: number[] };

/** Component props */
type Props = {
    analysis: AnalysisShape & {
        filepath: string;
        pathname: string[];
        frequencies?: string[];
    };
    title?: string;
    styleMap?: Record<string, any>;
    yMinDecade?: number;
};

async function readPd(file: string, path: string): Promise<PdJson> {
    const res = await fetch(`/api/read-dss?file=${encodeURIComponent(file)}&path=${encodeURIComponent(path)}`);
    return res.json();
}

/** Compact, stable string label for a probability */
function labelProb(v: number | string): string {
    if (typeof v === "string") return v.trim();
    const n = Number(v);
    if (!isFinite(n)) return String(v);
    // keep labels short, without trailing junk
    if (n >= 0.1) return n.toFixed(2).replace(/\.?0+$/, "");
    if (n >= 0.01) return n.toFixed(3).replace(/\.?0+$/, "");
    return Number(n.toPrecision(3)).toString();
}

export default function GenericPairedPlot({ analysis, title, styleMap, yMinDecade = 100 }: Props) {
    const [loaded, setLoaded] = useState<(PdJson | null)[]>([]);

    // load all pathnames
    useEffect(() => {
        let cancel = false;
        (async () => {
            const all = await Promise.all(
                analysis.pathname.map((p) => readPd(analysis.filepath, p).catch(() => null))
            );
            if (!cancel) setLoaded(all);
        })();
        return () => {
            cancel = true;
            setLoaded([]);
        };
    }, [analysis.filepath, JSON.stringify(analysis.pathname)]);

    const tracesInfo = useMemo(() => {
        const traces: any[] = [];
        const allY: number[] = [];

        // Determine the master label order for the x-axis:
        // 1) analysis.frequencies if provided, else
        // 2) x-array from the first loaded DSS series
        const labelsFromAnalysis = (analysis.frequencies ?? []).map((s) => s.trim()).filter(Boolean);
        const labelsFromDss =
            Array.isArray(loaded[0]?.x) ? (loaded[0]!.x as Array<number | string>).map(labelProb) : [];
        const masterLabels = labelsFromAnalysis.length ? labelsFromAnalysis : labelsFromDss;

        for (let i = 0; i < analysis.pathname.length; i += 1) {
            const series = loaded[i];
            if (!series || !Array.isArray(series.y)) continue;

            // Collect range
            for (const v of series.y) {
                const n = Number(v);
                if (!Number.isNaN(n)) allY.push(n);
            }

            // Build a mapping from this series’ own x to y
            const seriesLabels =
                Array.isArray(series.x) ? (series.x as Array<number | string>).map(labelProb) : masterLabels.slice(0, series.y.length);

            const map: Record<string, number> = {};
            for (let k = 0; k < series.y.length; k += 1) {
                map[seriesLabels[k]] = Number(series.y[k]);
            }

            // Order y according to the masterLabels (drop any labels the series doesn’t have)
            const xForTrace = masterLabels.slice(0, series.y.length); // same count as y typically
            const yForTrace = xForTrace.map((lab) => map[lab]).filter((v) => v !== undefined);

            const { trace: autos, label: pretty } = styleForPeakFlowFreq(analysis.pathname[i]);
            const override = styleMap?.[analysis.pathname[i]];

            traces.push({
                type: "scatter",
                x: xForTrace,
                y: yForTrace,
                name: pretty,
                ...autos,
                ...(override || {}),
            });
        }

        const maxY = allY.length ? Math.max(...allY) : 1;
        const topDecade = Math.pow(10, Math.ceil(Math.log10(maxY)));

        return { traces, labels: masterLabels, topDecade };
    }, [loaded, analysis.pathname, analysis.frequencies, styleMap]);

    if (!tracesInfo.traces.length) return <div>Loading…</div>;

    // Axes
    const reverseX = isFlowFrequency({ typeFolder: "Peak Flow Frequency", ...analysis }, analysis.pathname);
    const xaxis = buildPairedCategoryXAxis(tracesInfo.labels, reverseX);

    const yMin = yMinDecade;
    const yMax = tracesInfo.topDecade;
    const decades: number[] = [];
    for (let p = Math.ceil(Math.log10(yMin)); Math.pow(10, p) <= yMax; p += 1) decades.push(Math.pow(10, p));

    return (
        <Chart
            data={tracesInfo.traces}
            layout={{
                title: { text: title || analysis.name || "Paired Data" },
                xaxis,
                yaxis: {
                    type: "log",
                    title: { text: "Flow (cfs)" },
                    tickmode: "array",
                    tickvals: decades,
                    ticktext: decades.map((v) => v.toLocaleString()),
                    ticks: "",
                    ticklen: 0,
                    showgrid: true,
                    gridcolor: "rgba(0,0,0,0.22)",
                    gridwidth: 1.2,
                    minor: { showgrid: true, dtick: "D1", gridcolor: "rgba(0,0,0,0.12)", gridwidth: 0.7 },
                    range: [Math.log10(yMin), Math.log10(yMax)],
                },
                legend: {
                    orientation: "v",
                    x: 1.03,
                    y: 0.5,
                    xanchor: "left",
                    yanchor: "middle",
                    bgcolor: "rgba(255,255,255,0.85)",
                },
                margin: { l: 92, r: 220, b: 64, t: 52 },
                height: 450,
            }}
        />
    );
}
