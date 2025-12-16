import { useEffect, useState } from "react";
import Plot from "./Plot";
import Loader from "./Loader";
import { TextStore } from "../../utils/TextStore";
import { useProject } from "../../context/ProjectContext";
import {TimeSeriesType, parseTimeSeriesType, timeSeriesTypeToString} from "../../timeSeries/timeSeriesType";

type DSSJson = {
  x?: Array<string | number>;
  times?: Array<string | number>;
  y?: Array<number | string>;
  values?: Array<number | string>;
  yLabel?: string;
  yUnits?: string;
  valueType?: string;
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

async function loadDSSData(
  apiPrefix: string,
  filepath?: string,
  pathname?: string,
): Promise<DSSJson> {
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

const MONTH_INDEX: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

function hecStringToIso(t: string, fallbackIndex: number): string | number {
  const m = t.match(/^(\d{2})([A-Za-z]{3})(\d{4}) (\d{2}):(\d{2})$/);
  if (!m) {
    return fallbackIndex;
  }

  const day = Number(m[1]);
  const monthAbbrev = m[2].toUpperCase();
  const year = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);

  const monthIndex = MONTH_INDEX[monthAbbrev];
  if (monthIndex === undefined) {
    return fallbackIndex;
  }

  const utcMillis = Date.UTC(year, monthIndex, day, hour, minute);
  return new Date(utcMillis).toISOString();
}

function normalizeTimeSeries(json: DSSJson) {
  const times = json.x ?? json.times ?? [];
  const values = json.y ?? json.values ?? [];

  const x = times.map((t, i) => {
    if (typeof t === "string") {
      if (t.includes("T")) {
        return t;
      }
      return hecStringToIso(t, i);
    }
    if (typeof t === "number") {
      return t;
    }
    return i;
  });

  const y = values.map((v) => Number(v));

  if (x.length > 0 && y.length > 0) {
    console.log(
      "normalizeTimeSeries: first/last x, first/last y:",
      x[0],
      x[x.length - 1],
      y[0],
      y[y.length - 1],
    );
  }

  console.log("normalizeTimeSeries valueType:", json.valueType);

  return {
    x,
    y,
    yLabel: json.yLabel || TextStore.interface("TimeSeriesPlot_DefaultYLabel"),
    yUnits: json.yUnits || "",
    valueType: json.valueType,
  };
}

function getCPart(pathname?: string): string | undefined {
  if (!pathname) return undefined;
  const parts = pathname.split("/");
  return parts.length >= 4 ? parts[3] : undefined;
}

function canonicalParam(p?: string): string | undefined {
  const t = parseTimeSeriesType(p);
  if (t) return timeSeriesTypeToString(t);
  if (!p) return undefined;
  return String(p).trim().toUpperCase();
}

function inferParameter(
  ds: TimeSeriesDataset,
  normalized: { yLabel?: string },
): string | undefined {
  const raw =
    ds.parameter ||
    ds.dataType ||
    getCPart(ds.pathname) ||
    normalized.yLabel;
  return raw ? canonicalParam(raw) : undefined;
}

export default function TimeSeriesPlot({ dataset }: { dataset: TimeSeriesDataset }) {
  const { apiPrefix } = useProject();
  const [data, setData] =
    useState<ReturnType<typeof normalizeTimeSeries> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRangeSlider, setShowRangeSlider] = useState(false);

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
            yLabel:
              dataset.parameter ||
              dataset.dataType ||
              TextStore.interface("TimeSeriesPlot_DefaultYLabel"),
            yUnits: dataset.units || "",
          };
        }

        const normalized = normalizeTimeSeries(json);
        if (!cancelled) setData({ ...normalized });
      } catch (err) {
        console.error("TimeSeriesPlot load error:", err);
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
  if (
    !data ||
    !Array.isArray(data.x) ||
    !Array.isArray(data.y) ||
    data.x.length === 0
  ) {
    return <div>{TextStore.interface("TimeSeriesPlot_InvalidData")}</div>;
  }

  const xForPlot = data.x.map((v, i) => {
    if (typeof v === "string" && v.includes("T")) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d;
      return i;
    }
    return v;
  });

  const canonical = inferParameter(dataset, { yLabel: data.yLabel });

  const vt = (data as any).valueType;
  const stepped =
    typeof vt === "string" && vt.toUpperCase().includes("PER-AVER");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          fontSize: "0.85rem",
          gap: 8
        }}
      >
        <span>Time axis options</span>
        <button
          type="button"
          onClick={() => setShowRangeSlider(v => !v)}
          style={{ fontSize: "0.8rem", padding: "2px 8px", cursor: "pointer" }}
        >
          {showRangeSlider ? "Hide Range Slider" : "Show Range Slider"}
        </button>
      </div>

      <Plot
        title={dataset.name}
        x={xForPlot as any[]}
        y={data.y as any[]}
        yLabel={data.yLabel}
        stepped={stepped}
        options={{ parameter: canonical }}
        showRangeSlider={showRangeSlider}
      />
    </div>
  );
}
