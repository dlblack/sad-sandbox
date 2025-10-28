export type PlotKind = "time_series" | "paired_xy" | "frequency_curve" | "scatter" | "bar" | "heatmap" | "custom";

export type SeriesRuleKey = {
    kind?: PlotKind;
    parameter?: string;
    analysisName?: string;
    seriesName?: string;
    seriesIndex?: number;
};

export type LineDash = "solid" | "dash" | "dot" | "dashdot" | "longdash" | "longdashdot";

export type SeriesStyle = {
    drawLine?: boolean;
    drawPoints?: boolean;
    lineColor?: string;
    lineWidth?: number;
    lineDash?: LineDash;
    pointFillColor?: string;
    pointLineColor?: string;
    pointSize?: number;
    pointSymbol?: string;
    label?: string;
};

export type SeriesRule = {
    match: SeriesRuleKey;
    style: SeriesStyle;
};

export type PlotStyleDefaults = {
    meta?: { name?: string; version?: number };
    rules: SeriesRule[];
};
