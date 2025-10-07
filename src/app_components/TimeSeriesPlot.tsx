import {useEffect, useState} from "react";
import Chart from "./Chart";
import Loader from "./Loader";
import {TextStore} from "../utils/TextStore";

type DSSJson = {
  x?: Array<string | number>;
  times?: Array<string | number>;
  y?: Array<number | string>;
  values?: Array<number | string>;
  yLabel?: string;
  yUnits?: string;
};

interface TimeSeriesDataset {
  name?: string;
  dataFormat?: "DSS" | string;
  filepath?: string;
  pathname?: string;
  times?: Array<string | number>;
  values?: Array<number | string>;
  parameter?: string;
  units?: string;
}

async function loadDSSData(filepath?: string, pathname?: string): Promise<DSSJson> {
  const res = await fetch(
      `/api/read-dss?file=${encodeURIComponent(filepath || "")}&path=${encodeURIComponent(pathname || "")}`
  );
  return res.json();
}

function normalizeTimeSeries(json: DSSJson) {
  const times = json.x ?? json.times ?? [];
  const values = json.y ?? json.values ?? [];

  const x = times.map((t, i) => {
    if (typeof t === "string") {
      if (t.includes("T")) return t; // already ISO-ish
      return new Date(
          t.replace(/^(\d{2})([A-Za-z]{3})(\d{4}) (.+)$/, (_, d, m, y, time) => `${d} ${m} ${y} ${time} UTC`)
      ).toISOString();
    }
    if (typeof t === "number") return t;
    return i;
  });

  const y = values.map((v) => Number(v));

  return {
    x,
    y,
    yLabel: json.yLabel || TextStore.interface("TimeSeriesPlot_DefaultYLabel"),
    yUnits: json.yUnits || "",
  };
}

export default function TimeSeriesPlot({ dataset }: { dataset: TimeSeriesDataset }) {
  const [data, setData] = useState<ReturnType<typeof normalizeTimeSeries> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        let json: DSSJson;
        if (dataset.dataFormat === "DSS") {
          json = await loadDSSData(dataset.filepath, dataset.pathname);
        } else {
          json = {
            times: dataset.times || [],
            values: dataset.values || [],
            yLabel: dataset.parameter || TextStore.interface("TimeSeriesPlot_DefaultYLabel"),
            yUnits: dataset.units || "",
          };
        }

        const normalized = normalizeTimeSeries(json);
        if (!cancelled) setData({ ...normalized });
      } catch (err) {
        console.error("TimeSeries load failed", err);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dataset]);

  if (loading) return <Loader />;
  if (!data || !Array.isArray(data.x) || !Array.isArray(data.y) || data.x.length === 0) {
    return <div>{TextStore.interface("TimeSeriesPlot_InvalidData")}</div>;
  }

  return (
      <Chart
          x={data.x}
          y={data.y}
          title={dataset.name}
          xLabel={TextStore.interface("TimeSeriesPlot_XLabelTime")}
          yLabel={data.yUnits ? `${data.yLabel} (${data.yUnits})` : data.yLabel || dataset.units || ""}
          stepped
      />
  );
}
