import type { PlotStyleDefaults, SeriesRuleKey, SeriesStyle } from "./plotStyleTypes";
import type { PlotData } from "plotly.js";

/** Canonicalize parameter names so aliases match the same rule. */
function canonicalParam(p?: string): string | undefined {
    if (!p) return undefined;
    const t = String(p).trim().toUpperCase();

    const ALIASES: Record<string, string> = {
        FLOW: "FLOW",
        DISCHARGE: "FLOW",
        Q: "FLOW",

        PRECIP: "PRECIPITATION",
        PRECIPITATION: "PRECIPITATION",

        STAGE: "STAGE",
        ELEV: "STAGE",
        ELEVATION: "STAGE",

        STORAGE: "STORAGE",
        STOR: "STORAGE",

        TEMPERATURE: "TEMPERATURE",
        TEMP: "TEMPERATURE",
    };

    return ALIASES[t] || t;
}

function score(rule: SeriesRuleKey, key: SeriesRuleKey): number {
    let s = 0;

    // kind
    if (rule.kind && key.kind && rule.kind === key.kind) s += 3;

    // parameter
    const rp = canonicalParam(rule.parameter);
    const kp = canonicalParam(key.parameter);
    if (rp && kp && rp === kp) {
        s += 3;
        if (
            rule.parameter &&
            key.parameter &&
            String(rule.parameter).toUpperCase() === String(key.parameter).toUpperCase()
        ) {
            s += 1;
        }
    }

    // seriesName
    if (
        rule.seriesName &&
        key.seriesName &&
        String(rule.seriesName).toLowerCase() === String(key.seriesName).toLowerCase()
    ) {
        s += 2;
    }

    // seriesIndex
    if (typeof rule.seriesIndex === "number" && rule.seriesIndex === key.seriesIndex) {
        s += 1;
    }

    return s;
}

/**
 * Resolve style with scoring; later matches win ties.
 * This ensures user overrides (merged after base) beat base defaults.
 */
export function resolveSeriesStyle(
    defaults: PlotStyleDefaults,
    key: SeriesRuleKey
): SeriesStyle | undefined {
    if (!defaults || !Array.isArray(defaults.rules)) return undefined;

    let best: { style: SeriesStyle; score: number; idx: number } | undefined;

    defaults.rules.forEach((r, idx) => {
        const sc = score(r.match, key);
        if (sc <= 0) return;
        if (!best || sc > best.score || (sc === best.score && idx > best.idx)) {
            best = { style: r.style, score: sc, idx };
        }
    });

    return best?.style;
}

/** Convert a resolved SeriesStyle into Plotly trace props. */
export function styleToPlotly(style?: SeriesStyle): Partial<PlotData> {
    if (!style) return {};

    const out: Partial<PlotData> = {};

    // mode
    if (style.drawLine === false && style.drawPoints === true) out.mode = "markers";
    else if (style.drawLine === false) out.mode = "none";
    else if (style.drawLine === true && style.drawPoints === true) out.mode = "lines+markers";
    else out.mode = "lines";

    // line
    out.line = {
        color: style.lineColor,
        width: style.lineWidth,
        dash: style.lineDash,
    };

    // marker
    if (style.drawPoints) {
        out.marker = {
            color: style.pointFillColor,
            size: style.pointSize,
            line: { color: style.pointLineColor },
        };
    }

    if (style.label) out.name = style.label;

    return out;
}
