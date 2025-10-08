import { useEffect, useState } from "react";
import Chart from "./Chart";
import Loader from "./Loader";
import { TextStore } from "../utils/TextStore";

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

  // non-DSS inline data
  rows?: Array<{ x: number | string; y: number | string }>;
  xLabel?: string;
  yLabel?: string;
  xUnits?: string;
  yUnits?: string;
}

async function loadDSSData(filepath?: string, pathname?: string): Promise<DSSJson> {
  const res = await fetch(
      `/api/read-dss?file=${encodeURIComponent(filepath || "")}&path=${encodeURIComponent(pathname || "")}`
  );
  return res.json();
}

function normalizePairedData(json: DSSJson, dataset: PairedDataset) {
  let xVals = (json.x || []).map((v) => Number(v));
  let yVals = (json.y || []).map((v) => Number(v));

  let xLabel = json.xLabel || dataset.xLabel || TextStore.interface("PairedDataPlot_DefaultXLabel");
  let xUnits = json.xUnits || dataset.xUnits || "";
  let yLabel = json.yLabel || dataset.yLabel || TextStore.interface("PairedDataPlot_DefaultYLabel");
  let yUnits = json.yUnits || dataset.yUnits || "";

  // Auto-swap Elev/Stor curves if needed
  if (xLabel.toLowerCase().includes("elev") && yLabel.toLowerCase().includes("stor")) {
    [xVals, yVals] = [yVals, xVals];
    [xLabel, yLabel] = [yLabel, xLabel];
    [xUnits, yUnits] = [yUnits, xUnits];
  }

  return { x: xVals, y: yVals, xLabel, yLabel, xUnits, yUnits };
}

export default function PairedDataPlot({ dataset }: { dataset: PairedDataset }) {
  const [data, setData] = useState<ReturnType<typeof normalizePairedData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        let json: DSSJson;
        if (dataset.dataFormat === "DSS") {
          json = await loadDSSData(dataset.filepath, dataset.pathname);
        } else if (dataset.rows) {
          json = {
            x: dataset.rows.map((r) => Number(r.x)),
            y: dataset.rows.map((r) => Number(r.y)),
            xLabel: dataset.xLabel,
            yLabel: dataset.yLabel,
            xUnits: dataset.xUnits,
            yUnits: dataset.yUnits,
          };
        } else {
          json = { x: [], y: [] };
        }

        const normalized = normalizePairedData(json, dataset);
        if (!cancelled) setData(normalized);
      } catch (err) {
        console.error("PairedData load failed", err);
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
  if (!data || data.x.length === 0 || data.y.length === 0) {
    return <div>{TextStore.interface("PairedDataPlot_InvalidData")}</div>;
  }

  return (
      <Chart
          x={data.x}
          y={data.y}
          title={dataset.name || TextStore.interface("PairedDataPlot_DefaultTitle")}
          xLabel={data.xUnits ? `${data.xLabel} (${data.xUnits})` : data.xLabel}
          yLabel={data.yUnits ? `${data.yLabel} (${data.yUnits})` : data.yLabel}
          forceLinearX
      />
  );
}
