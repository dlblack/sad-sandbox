import Plotly from "plotly.js-dist-min";
import type { Layout, PlotData } from "plotly.js";
import React, { useEffect, useRef } from "react";

type XType = number | string | Date;
type YType = number | string;

export type ChartProps = Omit<Partial<PlotData>, "x" | "y" | "type" | "mode" | "line"> & {
  data?: Partial<PlotData>[];
  layout?: Partial<Layout>;
  x?: XType[];
  y?: YType[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  stepped?: boolean;
  forceLinearX?: boolean;
};

export default function Chart({
                                data,
                                layout,
                                x,
                                y,
                                title,
                                xLabel,
                                yLabel,
                                stepped = false,
                                forceLinearX = false,
                                ...restTraceProps
                              }: ChartProps) {
  const chartEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Determine axis type
    const looksLikeDate =
        !forceLinearX &&
        (
            (Array.isArray(x) && x.length > 0 && typeof x[0] === "string") ||
            (Array.isArray(data) &&
                data.length > 0 &&
                Array.isArray(data[0]?.x) &&
                typeof (data[0]!.x as any[])[0] === "string")
        );

    let plotData: Partial<PlotData>[];
    if (Array.isArray(data)) {
      plotData = data;
    } else if (Array.isArray(x) && Array.isArray(y)) {
      plotData = [
        {
          x,
          y,
          type: "scatter",
          mode: "lines+markers",
          ...(stepped ? { line: { shape: "hv" as const } } : {}),
          ...restTraceProps,
        },
      ];
    } else {
      plotData = [];
    }

    const resolvedTitleText =
        typeof title === "string"
            ? title
            : (layout?.title as any)?.text ?? "";

    const xaxisIncoming = layout?.xaxis ?? {};
    const yaxisIncoming = layout?.yaxis ?? {};

    // Respect an explicit incoming type if it exists
    const incomingType = (xaxisIncoming as any).type;
    const resolvedXType =
        incomingType !== undefined
            ? incomingType
            : forceLinearX
                ? "linear"
                : looksLikeDate
                    ? "date"
                    : "linear";

    const plotLayout: Partial<Layout> = {
      ...layout,
      title: { text: resolvedTitleText },
      xaxis: {
        ...xaxisIncoming,
        title: { text: xLabel ?? (xaxisIncoming as any)?.title?.text ?? "" },
        type: resolvedXType,
      },
      yaxis: {
        ...yaxisIncoming,
        title: { text: yLabel ?? (yaxisIncoming as any)?.title?.text ?? "" },
      },
    };

    if (chartEl.current) {
      Plotly.newPlot(chartEl.current, plotData, plotLayout, { responsive: true });
    }
  }, [
    data,
    layout,
    x,
    y,
    title,
    xLabel,
    yLabel,
    stepped,
    forceLinearX,
  ]);

  return <div ref={chartEl} />;
}
