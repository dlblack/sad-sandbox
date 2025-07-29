import {useEffect, useState} from "react";
import Chart from "./Chart";
import Loader from "./Loader";

async function loadDSSData(filepath, pathname) {
  const res = await fetch(`/api/read-dss?file=${encodeURIComponent(filepath)}&path=${encodeURIComponent(pathname)}`);
  return await res.json();
}

function normalizeTimeSeries(json) {
  const times = json.x || json.times || [];
  const values = json.y || json.values || [];

  const x = times.map((t, i) => {
    if (typeof t === "string") {
      if (t.includes("T")) return t;

      const parsed = new Date(t.replace(
        /^(\d{2})([A-Za-z]{3})(\d{4}) (.+)$/,
        (_, d, m, y, time) => `${d} ${m} ${y} ${time} UTC`
      ));
      return parsed.toISOString();
    }
    if (typeof t === "number") return t;
    return i;
  });

  const y = values.map(v => Number(v));
  return {
    x,
    y,
    yLabel: json.yLabel || "Value",
    yUnits: json.yUnits || ""
  };
}

function TimeSeriesPlot({dataset}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        let json;
        if (dataset.dataFormat === "DSS") {
          json = await loadDSSData(dataset.filepath, dataset.pathname);
        } else {
          json = {
            times: dataset.times || [],
            values: dataset.values || [],
            yLabel: dataset.parameter || "Value",
            yUnits: dataset.units || ""
          };
        }
        const normalized = normalizeTimeSeries(json);
        normalized.stepped = true;
        if (!cancelled) setData(normalized);
      } catch (err) {
        console.error("TimeSeries load failed", err);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [dataset]);

  if (loading) return <Loader/>;
  if (!data || !Array.isArray(data.x) || !Array.isArray(data.y) || data.x.length === 0) {
    return <div>Error: Invalid DSS TimeSeries data.</div>;
  }

  return (
    <Chart
      x={data.x}
      y={data.y}
      title={dataset.name}
      xLabel="Time"
      yLabel={data.yLabel || dataset.units || ""}
      stepped={true}
    />
  );
}

export default TimeSeriesPlot;
