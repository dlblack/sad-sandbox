import type { Layout, PlotData } from "plotly.js";

export type PopoutKind = "plot";

export type PlotModel = {
  plotKey: number;
  plotData: Partial<PlotData>[];
  layout: Partial<Layout>;
  title?: string;
};

export type PopoutModelByKind = {
  plot: PlotModel;
};

export type PopoutBounds = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type PopoutOpenRequest<Kind extends PopoutKind = PopoutKind> = {
  id: string;
  kind: Kind;
  title: string;
  ownerKey?: string;
  bounds?: PopoutBounds;
};

export type PopoutMessage =
  | { type: "POPOUT:MODEL"; id: string; kind: PopoutKind; model: unknown }
  | { type: "POPOUT:REFRESH_REQUEST"; id: string }
  | { type: "POPOUT:BOUNDS"; id: string; bounds: PopoutBounds }
  | { type: "POPOUT:CLOSE"; id: string }
  | { type: "POPOUT:REQUEST_MODEL"; id: string };
