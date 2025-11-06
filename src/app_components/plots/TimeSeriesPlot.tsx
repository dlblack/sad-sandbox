import { useEffect, useState } from "react";
import Plot from "./Plot";
import Loader from "./Loader";
import { TextStore } from "../../utils/TextStore";
import { useProject } from "../../context/ProjectContext";

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
  dataType?: string;
  units?: string;
}

async function loadDSSData(apiPrefix: string, filepath?: string, pathname?: string): Promise<DSSJson> {
  const dir = localStorage.getItem("lastProjectDir") || "";
  const url =
      `${apiPrefix}/read-dss` +
      `?file=${encodeURIComponent(filepath || "")}` +
      `&path=${encodeURIComponent(pathname || "")}` +
      (dir ? `&dir=${encodeURIComponent(dir)}` : "");
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to read DSS");
  return res.json();
}

function normalizeTimeSeries(json: DSSJson) {
  const times = json.x ?? json.times ?? [];
  const values = json.y ?? json.values ?? [];

  const x = times.map((t, i) => {
    if (typeof t === "string") {
      if (t.includes("T")) return t;
      return new Date(
          t.replace(
              /^(\d{2})([A-Za-z]{3})(\d{4}) (.+)$/,
              (_, d, m, y, time) => `${d} ${m} ${y} ${time} UTC`
          )
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

function getCPart(pathname?: string): string | undefined {
  if (!pathname) return undefined;
  const parts = pathname.split("/");
  return parts.length >= 4 ? parts[3] : undefined;
}

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
    TEMP: "TEMPERATURE"
  };
  return ALIASES[t] || t;
}

function inferParameter(ds: TimeSeriesDataset, normalized: { yLabel?: string }): string | undefined {
  const raw =
      ds.parameter ||
      ds.dataType ||
      getCPart(ds.pathname) ||
      normalized.yLabel;
  return raw ? canonicalParam(raw) : undefined;
}

export default function TimeSeriesPlot({ dataset }: { dataset: TimeSeriesDataset }) {
  const { apiPrefix } = useProject();
  const [data, setData] = useState<ReturnType<typeof normalizeTimeSeries> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        let json: DSSJson;
        if (dataset.dataFormat === "DSS") {
          const prefix = apiPrefix || "/api/unknown";
          json = await loadDSSData(prefix, dataset.filepath, dataset.pathname);
        } else {
          json = {
            times: dataset.times || [],
            values: dataset.values || [],
            yLabel: dataset.parameter || dataset.dataType || TextStore.interface("TimeSeriesPlot_DefaultYLabel"),
            yUnits: dataset.units || ""
          };
        }

        const normalized = normalizeTimeSeries(json);
        if (!cancelled) setData({ ...normalized });
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dataset, apiPrefix]);

  if (loading) return <Loader />;
  if (!data || !Array.isArray(data.x) || !Array.isArray(data.y) || data.x.length === 0) {
    return <div>{TextStore.interface("TimeSeriesPlot_InvalidData")}</div>;
  }

  const canonical = inferParameter(dataset, { yLabel: data.yLabel });

  return (
      <Plot
          title={dataset.name}
          x={data.x as any[]}
          y={data.y as any[]}
          yLabel={data.yLabel}
          options={{ parameter: canonical, stepped: false }}
      />
  );
}
