import type { Layout, PlotData, Datum } from "plotly.js";

export type TableRow = Record<string, unknown>;

export type DataTable = {
    rows: TableRow[];
    fields: string[];
};

export type Series = {
    name?: string;
    x?: Datum[];
    y?: Datum[];
    meta?: Record<string, unknown>;
};

export type PlotDataInput =
    | { table: DataTable }
    | { series: Series[] };

export type PlotKind =
    | "time_series"
    | "paired_xy"
    | "frequency_curve"
    | "histogram"
    | "scatter"
    | "bar"
    | "heatmap"
    | "map"
    | "custom";

export type PlotRequest = {
    kind?: PlotKind;
    input: PlotDataInput;
    title?: string;
    x_label?: string;
    y_label?: string;
    options?: Record<string, unknown>;
};

export type BuiltPlot = {
    data: Partial<PlotData>[];
    layout: Partial<Layout>;
};
