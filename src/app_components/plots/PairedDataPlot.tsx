import { useEffect, useState } from "react";
import Plot from "./Plot";
import Loader from "./Loader";
import { TextStore } from "../../utils/TextStore";
import type { Datum } from "plotly.js";
import { buildPairedCategoryXAxis, isFlowFrequency, prettyProbLabel } from "./axisHelpers";
import { styleForPeakFlowFreq } from "./styleHelpers";
import { useProject } from "../../context/ProjectContext";

type DSSJson = {
  x?: Array<number | string>;
  y?: Array<number | string>;
  xLabel?: string;
  yLabel?: string;
  xUnits?: string;
  yUnits?: string;
};

interface PairedDataset {
  name?: string;
  dataFormat?: "DSS" | string;
  filepath?: string;
  pathname?: string;
  rows?: Array<{ x: number | string; y: number | string }>;
  xLabel?: string;
  yLabel?: string;
  xUnits?: string;
  yUnits?: string;

  // analysis/multi
  typeFolder?: string;
  frequencies?: string[];
  yScale?: "linear" | "log";
  xReverse?: boolean;
  styleMap?: Record<string, any>;
  parameter?: string; // e.g., "Discharge"
}

const isMultiPaired = (d: any) =>
    d && typeof d.filepath === "string" && Array.isArray(d.pathname) && d.pathname.length > 0;

async function readPaired(apiPrefix: string, file?: string, path?: string): Promise<DSSJson> {
  const dir = localStorage.getItem("lastProjectDir") || "";
  const url = `${apiPrefix}/read-dss?file=${encodeURIComponent(file || "")}` +
      `&path=${encodeURIComponent(path || "")}` +
      (dir ? `&dir=${encodeURIComponent(dir)}` : "");
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to read DSS");
  }
  return res.json();
}

function normalizePairedData(json: DSSJson, dataset: PairedDataset) {
  const xVals = (json.x || []).map((v) => Number(v));
  const yVals = (json.y || []).map((v) => Number(v));

  let xLabel = json.xLabel || dataset.xLabel || TextStore.interface("PairedDataPlot_DefaultXLabel");
  let xUnits = json.xUnits || dataset.xUnits || "";
  let yLabel = json.yLabel || dataset.yLabel || TextStore.interface("PairedDataPlot_DefaultYLabel");
  let yUnits = json.yUnits || dataset.yUnits || "";

  if ((xLabel || "").toLowerCase().includes("elev") && (yLabel || "").toLowerCase().includes("stor")) {
    return {
      x: yVals as any[],
      y: xVals as any[],
      xLabel: yLabel,
      yLabel: xLabel,
      xUnits: yUnits,
      yUnits: xUnits
    };
  }

  return { x: xVals as any[], y: yVals as any[], xLabel, yLabel, xUnits, yUnits };
}

export default function PairedDataPlot({ dataset }: { dataset: PairedDataset | any }) {
  const { apiPrefix } = useProject();
  const [loading, setLoading] = useState(true);
  const [singleData, setSingleData] = useState<ReturnType<typeof normalizePairedData> | null>(null);
  const [multiLoaded, setMultiLoaded] = useState<Array<DSSJson>>([]);

  const isMulti = isMultiPaired(dataset);
  const prefix = apiPrefix || "/api/unknown";

  useEffect(() => {
    let cancelled = false;
    async function loadSingle() {
      setLoading(true);
      try {
        let json: DSSJson;
        if (dataset.dataFormat === "DSS" && typeof dataset.pathname === "string") {
          json = await readPaired(prefix, dataset.filepath, dataset.pathname);
        } else if (Array.isArray(dataset.rows)) {
          json = {
            x: dataset.rows.map((r: any) => Number(r.x)),
            y: dataset.rows.map((r: any) => Number(r.y)),
            xLabel: dataset.xLabel,
            yLabel: dataset.yLabel,
            xUnits: dataset.xUnits,
            yUnits: dataset.yUnits,
          };
        } else {
          json = { x: [], y: [] };
        }
        const normalized = normalizePairedData(json, dataset);
        if (!cancelled) {
          setSingleData(normalized);
        }
      } catch {
        if (!cancelled) {
          setSingleData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    async function loadMulti() {
      setLoading(true);
      try {
        const paths = Array.isArray(dataset.pathname) ? dataset.pathname : [];
        const items = await Promise.all(
            paths.map((p: string) => readPaired(prefix, dataset.filepath, p).catch(() => null)),
        );
        const safe = items.filter(Boolean) as DSSJson[];
        if (!cancelled) {
          setMultiLoaded(safe);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (isMulti) {
      setSingleData(null);
      setMultiLoaded([]);
      void loadMulti();
    } else {
      setMultiLoaded([]);
      void loadSingle();
    }

    return () => {
      cancelled = true;
    };
  }, [isMulti, dataset, prefix]);

  if (loading) {
    return <Loader />;
  }

  const parameter = dataset.parameter || "Discharge";

  if (isMulti) {
    if (!multiLoaded.length) {
      return <div>{TextStore.interface("PairedDataPlot_InvalidData")}</div>;
    }

    const labelsFromAnalysis = Array.isArray(dataset.frequencies) ? dataset.frequencies.slice() : [];
    const labelsFromFirst = Array.isArray(multiLoaded[0]?.x)
        ? (multiLoaded[0].x as Array<number | string>).map((s) => String(s))
        : [];
    const rawLabels = labelsFromAnalysis.length ? labelsFromAnalysis : labelsFromFirst;

    const flowFreq = isFlowFrequency(
        { typeFolder: dataset?.typeFolder, pathname: dataset?.pathname },
        dataset?.pathname
    );

    const labels = flowFreq ? rawLabels.map((v: any) => prettyProbLabel(Number(v))) : rawLabels;

    const styleMapAcc: Record<string, any> = { ...(dataset.styleMap || {}) };

    const series = (dataset.pathname as string[]).map((p: string, idx: number) => {
      const s = multiLoaded[idx] || { x: [], y: [] };
      const xArr = Array.isArray(s.x) ? (s.x as Datum[]) : [];
      const yArr = Array.isArray(s.y) ? (s.y as Datum[]) : [];

      if (flowFreq) {
        const preset = styleForPeakFlowFreq(p);
        const display = preset.label;
        styleMapAcc[display] = preset.trace;
        return { name: display, x: xArr, y: yArr };
      }

      return { name: p, x: xArr, y: yArr };
    });

    const options: any = {
      labels,
      xReverse: flowFreq ? true : Boolean(dataset.xReverse),
      yScale: flowFreq ? "log" : (dataset.yScale || "linear"),
      styleMap: styleMapAcc,
      parameter
    };

    if (flowFreq) {
      options.xaxis = buildPairedCategoryXAxis(labels, true);
    }

    return (
        <Plot
            kind="paired_xy"
            title={dataset.name || "Analysis"}
            x_label={flowFreq ? "Exceedance Probability" : dataset.xLabel}
            y_label={dataset.yLabel || "Flow (cfs)"}
            input={{ series }}
            options={options}
            parameter={parameter}
        />
    );
  }

  if (!singleData || singleData.x.length === 0 || singleData.y.length === 0) {
    return <div>{TextStore.interface("PairedDataPlot_InvalidData")}</div>;
  }

  return (
      <Plot
          kind="paired_xy"
          title={dataset.name || TextStore.interface("PairedDataPlot_DefaultTitle")}
          x_label={singleData.xLabel}
          y_label={singleData.yLabel}
          input={{ series: [{ x: singleData.x as any[], y: singleData.y as any[] }] }}
          options={{ parameter }}
          parameter={parameter}
      />
  );
}
