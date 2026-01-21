import { useEffect, useMemo, useRef, useState } from "react";
import { useUnits } from "../../../../context/UnitsContext";
import { useProject } from "../../../../context/ProjectContext";
import type { Layout, PlotData, Shape } from "plotly.js";
import { TextStore } from "../../../../utils/TextStore";
import {
  buildYears,
  clampInt,
  DATA_TYPES,
  defaultThresholdRow,
  FlowRow,
  parseClipboardGrid,
  parseDateUTC,
  parseNum,
  pinkShade,
  syncRowsToYears,
  ThresholdRow,
  waterYearFromDate,
} from "./flowRangesUtils";

type FlowRangesState = { rows?: FlowRow[] };
type ThresholdsState = { rows?: ThresholdRow[] };

export type FlowRangesBag = {
  timeWindow?: { startYear?: unknown; endYear?: unknown };
  startYear?: unknown;
  endYear?: unknown;
  flowRanges?: FlowRangesState;
  perceptionThresholds?: ThresholdsState;
};

type Props<B extends FlowRangesBag> = {
  bag: B;
  setBag: (fn: (prev: B) => B) => void;
  selectedDataset?: string;
  data: Record<string, unknown>;
};

type DssTimeSeriesJson = {
  x?: Array<number | string>;
  times?: Array<number | string>;
  y?: Array<number | string>;
  values?: Array<number | string>;
};

type YearPeriodSpec =
  | { mode: "CY" }
  | { mode: "WY" }
  | { mode: "START_MONTH"; startMonth: number };

const DEFAULT_PERIOD: YearPeriodSpec = { mode: "WY" };

type BucketReduce = "max" | "min" | "first" | "last";

type PasteCol = "peak" | "low" | "high";

function bucketYearFromDate(d: Date, spec: YearPeriodSpec): number {
  if (spec.mode === "CY") return d.getUTCFullYear();
  if (spec.mode === "WY") return waterYearFromDate(d);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  return m >= spec.startMonth ? y + 1 : y;
}

function reduceValue(
  existing: { value: number; order: number } | undefined,
  next: { value: number; order: number },
  reduce: BucketReduce
) {
  if (!existing) return next;
  if (reduce === "first") return existing.order <= next.order ? existing : next;
  if (reduce === "last") return existing.order >= next.order ? existing : next;
  if (reduce === "min") return existing.value <= next.value ? existing : next;
  return existing.value >= next.value ? existing : next;
}

function coerceToNumberValue(value: unknown): number | null {
  const asNumber = typeof value === "number" ? value : Number(value);
  return Number.isFinite(asNumber) ? asNumber : null;
}

function normalizeDssTimeSeriesToYearToValue(
  timeSeriesJson: DssTimeSeriesJson,
  period: YearPeriodSpec,
  reduce: BucketReduce
): Map<number, number> {
  const xValues = (timeSeriesJson.x ?? timeSeriesJson.times ?? []) as Array<number | string>;
  const yValues = (timeSeriesJson.y ?? timeSeriesJson.values ?? []) as Array<number | string>;
  const pairCount = Math.min(xValues.length, yValues.length);

  const bucketAgg = new Map<number, { value: number; order: number }>();

  for (let index = 0; index < pairCount; index += 1) {
    const d = parseDateUTC(xValues[index]);
    const value = coerceToNumberValue(yValues[index]);
    if (!d || value == null) continue;

    const year = bucketYearFromDate(d, period);
    const next = { value, order: index };
    bucketAgg.set(year, reduceValue(bucketAgg.get(year), next, reduce));
  }

  const out = new Map<number, number>();
  for (const [year, agg] of bucketAgg.entries()) out.set(year, agg.value);
  return out;
}

function findSelectedDatasetDescriptor(data: Record<string, unknown>, selectedDataset?: string): any | null {
  if (!selectedDataset) return null;

  const dataAny = data as any;
  const datasetsList =
    (Array.isArray(dataAny.Discharge) ? dataAny.Discharge : null) ??
    (Array.isArray(dataAny.datasets) ? dataAny.datasets : null) ??
    (Array.isArray(dataAny.dataSets) ? dataAny.dataSets : null) ??
    null;

  if (!Array.isArray(datasetsList)) return null;

  return (
    datasetsList.find(
      (dataset: any) => String(dataset?.name ?? dataset?.title ?? dataset?.label ?? "") === selectedDataset
    ) ?? null
  );
}

async function fetchDssTimeSeriesJson(apiPrefix: string, filePath?: string, dssPathname?: string): Promise<DssTimeSeriesJson> {
  const projectDirectory = localStorage.getItem("lastProjectDir") || "";

  const url =
    `${apiPrefix}/read-dss` +
    `?file=${encodeURIComponent(filePath || "")}` +
    `&path=${encodeURIComponent(dssPathname || "")}` +
    (projectDirectory ? `&dir=${encodeURIComponent(projectDirectory)}` : "");

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to read DSS");

  return response.json();
}

function rowsContainAnyUserEdits(flowRows: FlowRow[]): boolean {
  for (const flowRow of flowRows) {
    const peak = String(flowRow.peak ?? "").trim();
    const low = String(flowRow.low ?? "").trim();
    const high = String(flowRow.high ?? "").trim();
    if (peak !== "" || low !== "" || high !== "") return true;
  }
  return false;
}

function applyDatasetValuesToFlowRows(flowRows: FlowRow[], yearToValueMap: Map<number, number>): FlowRow[] {
  return flowRows.map((flowRow) => {
    const datasetValue = yearToValueMap.get(flowRow.year);
    if (datasetValue == null) return flowRow;

    const valueString = String(datasetValue);
    return {
      ...flowRow,
      peak: valueString,
      low: valueString,
      high: valueString,
      dataType: "Systematic",
    };
  });
}

type PlotSnapshot = {
  rows: FlowRow[];
  thresholdRows: ThresholdRow[];
  totalLowNum: number;
};

export function useFlowRangesStep<B extends FlowRangesBag>({ bag, setBag, selectedDataset, data }: Props<B>) {
  const units = useUnits();
  const { apiPrefix } = useProject();

  const totalStartYear = clampInt(bag.timeWindow?.startYear ?? bag.startYear, 0);
  const totalEndYear = clampInt(bag.timeWindow?.endYear ?? bag.endYear, 0);

  const years = useMemo(() => buildYears(totalStartYear, totalEndYear), [totalStartYear, totalEndYear]);

  const [rows, setRows] = useState<FlowRow[]>(() => syncRowsToYears(bag.flowRanges?.rows, years));
  const [thresholdRows, setThresholdRows] = useState<ThresholdRow[]>(() => bag.perceptionThresholds?.rows ?? []);

  const [plotKey, setPlotKey] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [plotHeight, setPlotHeight] = useState<number>(360);

  const [totalLow, setTotalLow] = useState<string>("0");
  const [totalHigh, setTotalHigh] = useState<string>("inf");
  const [totalComment, setTotalComment] = useState<string>("");

  const [newThrStartYear, setNewThrStartYear] = useState<number>(totalStartYear);
  const [newThrEndYear, setNewThrEndYear] = useState<number>(totalEndYear);

  useEffect(() => {
    setNewThrStartYear(totalStartYear);
    setNewThrEndYear(totalEndYear);
  }, [totalStartYear, totalEndYear]);

  useEffect(() => {
    setRows((previousRows) => syncRowsToYears(previousRows, years));
  }, [years]);

  useEffect(() => {
    setBag((previousBag) => {
      const previousFlowRows = previousBag.flowRanges?.rows;
      const previousThresholdRows = previousBag.perceptionThresholds?.rows;

      const flowRowsUnchanged = previousFlowRows === rows;
      const thresholdRowsUnchanged = previousThresholdRows === thresholdRows;

      if (flowRowsUnchanged && thresholdRowsUnchanged) return previousBag;

      return {
        ...previousBag,
        flowRanges: flowRowsUnchanged ? previousBag.flowRanges : { ...(previousBag.flowRanges ?? {}), rows },
        perceptionThresholds: thresholdRowsUnchanged
          ? previousBag.perceptionThresholds
          : { ...(previousBag.perceptionThresholds ?? {}), rows: thresholdRows },
      };
    });
  }, [rows, thresholdRows, setBag]);

  useEffect(() => {
    const rootElement = rootRef.current;
    if (!rootElement) return;

    const wizardBody = rootElement.closest(".wizardBody") as HTMLElement | null;
    const resizeTarget = wizardBody ?? rootElement;

    const resizeObserver = new ResizeObserver(() => {
      const height = resizeTarget.getBoundingClientRect().height;
      const computedPlotHeight = Math.max(240, Math.floor(height * 0.8));
      setPlotHeight((previousHeight) => (previousHeight === computedPlotHeight ? previousHeight : computedPlotHeight));
    });

    resizeObserver.observe(resizeTarget);
    return () => resizeObserver.disconnect();
  }, []);

  const [datasetYearToValue, setDatasetYearToValue] = useState<Map<number, number>>(new Map());
  const [datasetIdentityKey, setDatasetIdentityKey] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;

    async function loadDatasetSeries(): Promise<void> {
      if (!apiPrefix) return;
      if (!selectedDataset) return;

      const datasetDescriptor = findSelectedDatasetDescriptor(data, selectedDataset);
      if (!datasetDescriptor) return;

      const filePath =
        datasetDescriptor.filepath ??
        datasetDescriptor.file ??
        datasetDescriptor.pathfile ??
        datasetDescriptor.filename;

      const pathname =
        (typeof datasetDescriptor.pathname === "string" ? datasetDescriptor.pathname : null) ??
        (Array.isArray(datasetDescriptor.pathname) ? datasetDescriptor.pathname[0] : null) ??
        datasetDescriptor.dssPath ??
        datasetDescriptor.path ??
        datasetDescriptor.pathnameString;

      const nextIdentityKey = `${selectedDataset}::${String(filePath ?? "")}::${String(pathname ?? "")}`;
      if (nextIdentityKey === datasetIdentityKey) return;

      try {
        const dssJson = await fetchDssTimeSeriesJson(String(apiPrefix), String(filePath ?? ""), String(pathname ?? ""));
        const yearToValue = normalizeDssTimeSeriesToYearToValue(dssJson, DEFAULT_PERIOD, "max");

        if (isCancelled) return;
        setDatasetYearToValue(yearToValue);
        setDatasetIdentityKey(nextIdentityKey);
      } catch (error) {
        if (!isCancelled) {
          setDatasetYearToValue(new Map());
          setDatasetIdentityKey(nextIdentityKey);
          console.error(error);
        }
      }
    }

    void loadDatasetSeries();
    return () => {
      isCancelled = true;
    };
  }, [apiPrefix, data, selectedDataset, datasetIdentityKey]);

  const [autoFillGuardKey, setAutoFillGuardKey] = useState<string>("");

  useEffect(() => {
    if (!selectedDataset) return;

    const nextAutoFillGuardKey = `${selectedDataset}::${totalStartYear}::${totalEndYear}::${datasetIdentityKey}`;
    if (nextAutoFillGuardKey === autoFillGuardKey) return;

    if (!datasetYearToValue.size) return;
    if (rowsContainAnyUserEdits(rows)) return;

    setRows((previousRows) => applyDatasetValuesToFlowRows(previousRows, datasetYearToValue));
    setAutoFillGuardKey(nextAutoFillGuardKey);
  }, [selectedDataset, totalStartYear, totalEndYear, datasetYearToValue, datasetIdentityKey, rows, autoFillGuardKey]);

  const [plotSnapshot, setPlotSnapshot] = useState<PlotSnapshot>(() => ({
    rows: syncRowsToYears(bag.flowRanges?.rows, years),
    thresholdRows: bag.perceptionThresholds?.rows ?? [],
    totalLowNum: 0,
  }));

  const yUpper = useMemo(() => {
    let maximumY = 0;

    for (const flowRow of plotSnapshot.rows) {
      const peakValue = parseNum(flowRow.peak);
      const lowValue = parseNum(flowRow.low);
      const highValue = parseNum(flowRow.high);

      if (peakValue != null) maximumY = Math.max(maximumY, peakValue);
      if (lowValue != null) maximumY = Math.max(maximumY, lowValue);
      if (highValue != null) maximumY = Math.max(maximumY, highValue);
    }

    for (const thresholdRow of plotSnapshot.thresholdRows) {
      const lowThreshold = parseNum(thresholdRow.low);
      const highThreshold = parseNum(thresholdRow.high);

      if (lowThreshold != null) maximumY = Math.max(maximumY, lowThreshold);
      if (highThreshold != null) maximumY = Math.max(maximumY, highThreshold);
    }

    maximumY = Math.max(maximumY, plotSnapshot.totalLowNum);
    return maximumY <= 0 ? 1 : maximumY * 1.05;
  }, [plotSnapshot]);

  const thresholdShades = useMemo(() => {
    const totalThresholds = thresholdRows.length;
    return thresholdRows.map((_, index) => ({
      fill: pinkShade(index, totalThresholds, 0.2),
      rect: pinkShade(index, totalThresholds, 0.35),
      line: pinkShade(index, totalThresholds, 0.85),
    }));
  }, [thresholdRows]);

  const snapshotThresholdRows = plotSnapshot.thresholdRows ?? [];

  const shapes = useMemo<Partial<Shape>[]>(() => {
    const plotShapes: Partial<Shape>[] = [];

    for (let thresholdIndex = 0; thresholdIndex < snapshotThresholdRows.length; thresholdIndex += 1) {
      const thresholdRow = snapshotThresholdRows[thresholdIndex];

      const startYear = clampInt(thresholdRow.startYear, totalStartYear);
      const endYear = clampInt(thresholdRow.endYear, totalEndYear);
      if (endYear < startYear) continue;

      const blockHeight = parseNum(thresholdRow.low);
      if (blockHeight == null || blockHeight <= 0) continue;

      plotShapes.push({
        type: "rect",
        xref: "x",
        yref: "y",
        x0: startYear,
        x1: endYear,
        y0: 0,
        y1: blockHeight,
        fillcolor: pinkShade(thresholdIndex, snapshotThresholdRows.length || 1, 0.35),
        line: { width: 0 },
        layer: "below",
      });
    }

    return plotShapes;
  }, [snapshotThresholdRows, totalStartYear, totalEndYear]);

  const plotData: Partial<PlotData>[] = useMemo(() => {
    const snapshotFlowRows = plotSnapshot.rows ?? [];
    const snapshotThresholdRowsForLegend = plotSnapshot.thresholdRows ?? [];

    const peakYears: number[] = [];
    const peakValues: number[] = [];

    const rangeYears: Array<number | null> = [];
    const rangeValues: Array<number | null> = [];

    for (const flowRow of snapshotFlowRows) {
      const year = flowRow.year;

      const peakValue = parseNum(flowRow.peak);
      if (peakValue != null) {
        peakYears.push(year);
        peakValues.push(peakValue);
      }

      if (flowRow.dataType === "Censored") continue;

      const lowValue = parseNum(flowRow.low);
      const highValue = parseNum(flowRow.high);

      if (lowValue != null && highValue != null && lowValue !== highValue) {
        rangeYears.push(year, year, null);
        rangeValues.push(lowValue, highValue, null);
      }
    }

    const traces: Partial<PlotData>[] = [
      {
        type: "scatter",
        mode: "markers",
        name: TextStore.interface("Bulletin17_Wizard_FlowRanges_Legend_Data"),
        x: peakYears,
        y: peakValues,
      } as any,
      {
        type: "scatter",
        mode: "lines",
        name: TextStore.interface("Bulletin17_Wizard_FlowRanges_Legend_Ranges"),
        x: rangeYears,
        y: rangeValues,
      } as any,
    ];

    for (let thresholdIndex = 0; thresholdIndex < snapshotThresholdRowsForLegend.length; thresholdIndex += 1) {
      const thresholdRow = snapshotThresholdRowsForLegend[thresholdIndex];
      const label = `${thresholdRow.startYear}-${thresholdRow.endYear}`;
      const legendColor = pinkShade(thresholdIndex, snapshotThresholdRowsForLegend.length || 1, 0.85);

      traces.push({
        type: "scatter",
        mode: "lines",
        name: label,
        x: [null],
        y: [null],
        line: { width: 10, color: legendColor },
        hoverinfo: "skip",
        showlegend: true,
      } as any);
    }

    return traces;
  }, [plotSnapshot.rows, plotSnapshot.thresholdRows, plotKey]);

  const layout: Partial<Layout> = useMemo(() => {
    const plotStartYear = years.length ? years[0] : totalStartYear;
    const plotEndYear = years.length ? years[years.length - 1] : totalEndYear;

    return {
      autosize: true,
      height: plotHeight,
      margin: { l: 55, r: 20, t: 44, b: 40 },

      xaxis: {
        title: { text: TextStore.interface("Bulletin17_Wizard_FlowRanges_XLabel") },
        range: [plotStartYear, plotEndYear] as [number, number],
        automargin: true,
        showline: true,
        linewidth: 1,
        linecolor: "#444",
        mirror: "allticks",
        ticks: "outside",
      },

      yaxis: {
        title: { text: units.label(TextStore.interface("Bulletin17_Wizard_FlowRanges_YLabel"), "flow") },
        range: [0, yUpper] as [number, number],
        automargin: true,
        showline: true,
        linewidth: 1,
        linecolor: "#444",
        mirror: "allticks",
        ticks: "outside",
      },

      legend: { orientation: "h" as any },
      shapes,
    };
  }, [years, totalStartYear, totalEndYear, yUpper, plotHeight, shapes, units]);

  function setCell(rowIndex: number, patch: Partial<FlowRow>) {
    setRows((previousRows) => {
      const nextRows = previousRows.slice();
      const current = nextRows[rowIndex];
      const isSystematic = current?.dataType === "Systematic";

      if (isSystematic && patch.peak != null) return previousRows;

      const mergedRow: FlowRow = { ...current, ...patch };

      if (!isSystematic && patch.peak != null) {
        const peakValue = parseNum(mergedRow.peak);
        if (peakValue != null) mergedRow.dataType = "Systematic";
      }

      nextRows[rowIndex] = mergedRow;
      return nextRows;
    });
  }

  function applyPasteGrid(startRowIndex: number, startColumn: PasteCol, clipboardText: string) {
    const grid = parseClipboardGrid(clipboardText);
    if (!grid.length) return;

    setRows((previousRows) => {
      const nextRows = previousRows.slice();
      let didChange = false;

      for (let gridRowIndex = 0; gridRowIndex < grid.length; gridRowIndex += 1) {
        const targetRowIndex = startRowIndex + gridRowIndex;
        if (targetRowIndex >= nextRows.length) break;

        const rowCells = grid[gridRowIndex].map((c) => (c ?? "").trim());
        const existing = nextRows[targetRowIndex];
        const isSystematic = existing.dataType === "Systematic";

        let nextPeak = existing.peak;
        let nextLow = existing.low;
        let nextHigh = existing.high;

        if (startColumn === "peak") {
          if (!isSystematic && rowCells[0] != null) nextPeak = rowCells[0] ?? "";
          if (rowCells.length >= 2) nextLow = rowCells[1] ?? "";
          if (rowCells.length >= 3) nextHigh = rowCells[2] ?? "";
        } else if (startColumn === "low") {
          if (rowCells.length >= 1) nextLow = rowCells[0] ?? "";
          if (rowCells.length >= 2) nextHigh = rowCells[1] ?? "";
        } else if (startColumn === "high") {
          if (rowCells.length >= 1) nextHigh = rowCells[0] ?? "";
        }

        const changed =
          nextPeak !== existing.peak ||
          nextLow !== existing.low ||
          nextHigh !== existing.high;

        if (!changed) continue;

        const merged: FlowRow = {
          ...existing,
          peak: nextPeak,
          low: nextLow,
          high: nextHigh,
        };

        if (!isSystematic && startColumn === "peak") {
          const peakValue = parseNum(String(merged.peak ?? ""));
          if (peakValue != null) merged.dataType = "Systematic";
        }

        nextRows[targetRowIndex] = merged;
        didChange = true;
      }

      return didChange ? nextRows : previousRows;
    });
  }

  function addThreshold() {
    const startYear = clampInt(newThrStartYear, totalStartYear);
    const endYear = clampInt(newThrEndYear, totalEndYear);
    setThresholdRows((previous) => [...previous, defaultThresholdRow(startYear, endYear)]);
  }

  function applyThresholdsToFlowRanges() {
    if (!thresholdRows.length) return;

    setRows((previousRows) => {
      const yearToRowIndex = new Map<number, number>();
      for (let index = 0; index < previousRows.length; index += 1) yearToRowIndex.set(previousRows[index].year, index);

      let didChangeAnyRow = false;
      const nextRows = previousRows.slice();

      for (const thresholdRow of thresholdRows) {
        const highLimitRaw = (thresholdRow.low ?? "").toString().trim();
        if (!highLimitRaw) continue;

        const highLimit = parseNum(highLimitRaw);
        if (highLimit == null) continue;

        const startYear = clampInt(thresholdRow.startYear, totalStartYear);
        const endYear = clampInt(thresholdRow.endYear, totalEndYear);
        if (endYear < startYear) continue;

        for (let year = startYear; year <= endYear; year += 1) {
          const rowIndex = yearToRowIndex.get(year);
          if (rowIndex == null) continue;

          const flowRow = nextRows[rowIndex];
          if ((flowRow.peak ?? "").trim()) continue;

          const existingLowText = (flowRow.low ?? "").trim();
          const existingHighText = (flowRow.high ?? "").trim();

          const existingLowValue = parseNum(existingLowText);
          const existingHighValue = parseNum(existingHighText);

          const isAlreadyCensored = flowRow.dataType === "Censored";
          const looksEmpty =
            (existingLowValue == null || existingLowValue === 0) && (existingHighValue == null || existingHighValue === 0);

          if (!isAlreadyCensored && !looksEmpty) continue;

          const nextHighText = highLimit.toString();
          const shouldUpdate = existingLowText !== "0" || existingHighText !== nextHighText || flowRow.dataType !== "Censored";
          if (!shouldUpdate) continue;

          nextRows[rowIndex] = {
            ...flowRow,
            low: "0",
            high: nextHighText,
            dataType: "Censored",
          };
          didChangeAnyRow = true;
        }
      }

      return didChangeAnyRow ? nextRows : previousRows;
    });
  }

  function removeThreshold(thresholdIndex: number) {
    setThresholdRows((previous) => previous.filter((_, index) => index !== thresholdIndex));
  }

  function setThresholdCell(thresholdIndex: number, patch: Partial<ThresholdRow>) {
    setThresholdRows((previous) => {
      const next = previous.slice();
      next[thresholdIndex] = { ...next[thresholdIndex], ...patch };
      return next;
    });
  }

  function refreshPlot() {
    setPlotSnapshot({
      rows,
      thresholdRows,
      totalLowNum: (() => {
        const lowBound = parseNum(totalLow);
        return lowBound == null ? 0 : lowBound;
      })(),
    });
    setPlotKey((k) => k + 1);
  }

  return {
    DATA_TYPES,
    rootRef,

    totalStartYear,
    totalEndYear,
    years,

    rows,
    setCell,
    applyPasteGrid,

    thresholdRows,
    setThresholdCell,
    addThreshold,
    removeThreshold,
    applyThresholdsToFlowRanges,

    thrShades: thresholdShades,

    totalLow,
    setTotalLow,
    totalHigh,
    setTotalHigh,
    totalComment,
    setTotalComment,

    newThrStartYear,
    setNewThrStartYear,
    newThrEndYear,
    setNewThrEndYear,

    plotKey,
    refreshPlot,

    plotData,
    layout,

    tableStyles: {
      th: {
        paddingTop: 0,
        paddingBottom: 0,
        whiteSpace: "nowrap",
        fontSize: "var(--mantine-font-size-xs)",
      },
      td: {
        padding: 0,
        fontSize: "var(--mantine-font-size-xs)",
      },
    } as const,

    greenCell: { background: "rgba(0, 255, 0, 0.18)" } as const,

    textInputStyles: { input: { backgroundColor: "transparent" } } as const,
    numberInputStyles: { input: { backgroundColor: "transparent" } } as const,
  };
}
