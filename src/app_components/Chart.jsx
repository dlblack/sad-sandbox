import Plotly from "plotly.js-dist-min";
import {useEffect, useRef} from "react";

function Chart({
                 data,
                 layout,
                 x,
                 y,
                 title,
                 xLabel,
                 yLabel,
                 stepped = false,
                 ...rest
               }) {
  const chartEl = useRef();

  useEffect(() => {
    let plotData, plotLayout;

    const looksLikeDate =
      (x && x.length > 0 && typeof x[0] === "string") ||
      (Array.isArray(data) && data[0]?.x && typeof data[0].x[0] === "string");

    if (Array.isArray(data)) {
      plotData = data;
      plotLayout = {
        ...layout,
        title: layout?.title ?? title ?? "",
        xaxis: {
          ...(layout?.xaxis || {}),
          title: {text: xLabel || layout?.xaxis?.title?.text || ""},
          type: looksLikeDate ? "date" : "linear",
        },
        yaxis: {
          ...(layout?.yaxis || {}),
          title: {text: yLabel || layout?.yaxis?.title?.text || ""}
        }
      };
    } else if (x && y) {
      plotData = [{
        x,
        y,
        mode: "lines+markers",
        type: "scatter",
        line: stepped ? {shape: "hv"} : {},
        ...rest,
      }];
      plotLayout = {
        title: title || "",
        xaxis: {title: {text: xLabel || ""}, type: looksLikeDate ? "date" : "linear"},
        yaxis: {title: {text: yLabel || ""}},
        ...layout,
      };
    } else {
      plotData = [];
      plotLayout = layout || {};
    }

    console.debug("DEBUG: Plot layout applied:", plotLayout);

    if (chartEl.current) {
      Plotly.newPlot(chartEl.current, plotData, plotLayout, {responsive: true});
    }
  }, [data, layout, x, y, title, xLabel, yLabel, stepped, rest]);

  return <div ref={chartEl}></div>;
}

export default Chart;
