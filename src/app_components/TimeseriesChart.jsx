import useAPI from "../app_hooks/useAPI";
import Chart from "./chart";
import Loader from "./loader";

function parseValues(values) {
  const out = [];
  const formatters = [];
  values.forEach((step) => {
    step.forEach((m, i) => {
      if (!out[i]) out[i] = [];
      if (formatters[i]) {
        out[i].push(formatters[i](m));
      } else {
        out[i].push(m);
      }
    });
  });
  return out;
}

function TimeseriesChart({ tsName, office }) {
  if (!tsName) return <p>Please select a timeseries...</p>;

  const measurements = useAPI("timeseries", {
    office: office,
    name: encodeURI(tsName),
  });

  if (Array.isArray(measurements)) return <Loader />;

  const [x, y] = parseValues(measurements.values, [
    (m) => {
      return new Date(m);
    },
  ]);

  const trace = {
    x: x,
    y: y,
    type: "lines+markers",
  };

  const data = [trace];

  return <Chart data={data} />;
}

export default TimeseriesChart;
