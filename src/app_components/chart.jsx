import Plotly from "plotly.js-dist-min";
import { useEffect, useRef } from "react";

function Chart({ data }) {
  const chartEl = useRef();

  useEffect(() => {
    if (chartEl.current) {
      Plotly.newPlot(chartEl.current, data);
    }
  }, [chartEl.current, data]);

  return <div ref={chartEl}></div>;
}

export default Chart;
