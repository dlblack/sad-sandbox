import { UsgsDataType } from "../../../api/usgs/io/UsgsDataType";
import { TimeSeriesType } from "../../../timeSeries/timeSeriesType";
import { fetchTimeseriesViaServer, UsgsTimeZone } from "../../../api/usgsApi";
import { toJulianDay } from "../../../utils/timeUtils";

export type DataFormat = "DSS" | "JSON";

export type StationRow = {
  id: string;
  aPart: string;
  bPart: string;
  fPart: string;
  importFlag: boolean;
};

export type SeriesResult = {
  stationId: string;
  aPart: string;
  bPart: string;
  fPart: string;
  points: { timestamp: string | number; value: number | null }[];
  variety: TimeSeriesType;
  error?: string;
};

export type StationSummary = {
  totalStations: number;
  totalSeriesRequested: number;
  withDataCount: number;
  noDataCount: number;
  failedCount: number;
  withDataIds: string[];
  noDataIds: string[];
  failedIds: string[];
};

export type ProgressPhase = "query" | "download" | "write" | "done";

export type ProgressUpdate = {
  phase: ProgressPhase;

  queryStart?: number;
  queryEnd?: number;
  queryTotal?: number;

  downloadDone?: number;
  downloadTotal?: number;

  writeLabelKey?: string;
  writeDone?: number;
  writeTotal?: number;

  summary?: StationSummary;
};

const MAX_CONCURRENT_REQUESTS = 10;
const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

type SeriesPoint = { timestamp: string | number; value: number | null };

function parseToDateOrNull(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function getValidSortedPoints(points: SeriesPoint[] | undefined): SeriesPoint[] {
  const valid = (points || []).filter((p) => p.value != null);
  valid.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return valid;
}

export function getPrimaryVariety(selected: TimeSeriesType[]): TimeSeriesType {
  if (selected.includes(TimeSeriesType.STAGE)) return TimeSeriesType.STAGE;
  return TimeSeriesType.FLOW;
}

export function formatDssDateFromIso(dateStr: string): string {
  const date = parseToDateOrNull(dateStr);
  if (!date) return "";
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mon = MONTHS[date.getUTCMonth()];
  const yyyy = date.getUTCFullYear();
  return `${dd}${mon}${yyyy}`;
}

export function formatHecDateTimeFromIso(dateStr: string): string {
  const date = parseToDateOrNull(dateStr);
  if (!date) return "";
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mon = MONTHS[date.getUTCMonth()];
  const yyyy = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${dd}${mon}${yyyy} ${hh}:${mm}`;
}

export function sanitizeDssPart(part: string): string {
  if (!part) return "";
  return part.replace(/\//g, " ").trim();
}

export function inferIntervalEPart(dataType: UsgsDataType): string {
  if (dataType === UsgsDataType.DAILY) return "1Day";
  if (dataType === UsgsDataType.INSTANTANEOUS) return "15Minute";
  if (dataType === UsgsDataType.ANNUAL_PEAKS) return "IR-Century";
  return "1Day";
}

export async function fetchSeriesInBatches(
  selectedStations: StationRow[],
  selectedVarieties: TimeSeriesType[],
  dataType: UsgsDataType,
  startDate: Date | null,
  endDate: Date | null,
  retrievePor: boolean,
  timeZone: UsgsTimeZone,
  onProgress: (update: ProgressUpdate) => void
): Promise<SeriesResult[]> {
  const tasks: { row: StationRow; variety: TimeSeriesType }[] = [];
  selectedStations.forEach((row) => {
    selectedVarieties.forEach((variety) => {
      tasks.push({ row, variety });
    });
  });

  const total = tasks.length;
  const results: SeriesResult[] = [];
  let downloaded = 0;

  for (let i = 0; i < tasks.length; i += MAX_CONCURRENT_REQUESTS) {
    const batch = tasks.slice(i, i + MAX_CONCURRENT_REQUESTS);
    const startIndex = i + 1;
    const endIndex = Math.min(i + batch.length, total);

    onProgress({
      phase: "query",
      queryStart: startIndex,
      queryEnd: endIndex,
      queryTotal: total,
    });

    const batchResults = await Promise.all(
      batch.map(async ({ row, variety }) => {
        try {
          const points = await fetchTimeseriesViaServer({
            stationId: row.id,
            dataType,
            variety,
            startDate,
            endDate,
            retrievePor,
            timeZone,
          });

          return {
            stationId: row.id,
            aPart: row.aPart,
            bPart: row.bPart,
            fPart: row.fPart,
            points,
            variety,
          } as SeriesResult;
        } catch (err) {
          return {
            stationId: row.id,
            aPart: row.aPart,
            bPart: row.bPart,
            fPart: row.fPart,
            points: [],
            error: String(err instanceof Error ? err.message : err),
            variety,
          } as SeriesResult;
        }
      })
    );

    downloaded = downloaded + batchResults.length;

    onProgress({
      phase: "download",
      downloadDone: downloaded,
      downloadTotal: total,
    });

    results.push(...batchResults);
  }

  return results;
}

export function buildStationSummary(seriesResults: SeriesResult[], selectedStations: StationRow[]): StationSummary {
  type Flags = { touched: boolean; hasData: boolean; error: boolean };
  const flags = new Map<string, Flags>();

  selectedStations.forEach((station) => {
    flags.set(station.id, { touched: false, hasData: false, error: false });
  });

  seriesResults.forEach((result) => {
    const entry = flags.get(result.stationId) || { touched: false, hasData: false, error: false };
    entry.touched = true;

    if (result.error) {
      entry.error = true;
    } else {
      const nonNullPoints = (result.points || []).filter((p) => p.value != null);
      if (nonNullPoints.length > 0) entry.hasData = true;
    }

    flags.set(result.stationId, entry);
  });

  const withDataIds: string[] = [];
  const noDataIds: string[] = [];
  const failedIds: string[] = [];

  flags.forEach((entry, id) => {
    if (entry.error) failedIds.push(id);
    else if (entry.hasData) withDataIds.push(id);
    else if (entry.touched) noDataIds.push(id);
  });

  return {
    totalStations: selectedStations.length,
    totalSeriesRequested: seriesResults.length,
    withDataCount: withDataIds.length,
    noDataCount: noDataIds.length,
    failedCount: failedIds.length,
    withDataIds,
    noDataIds,
    failedIds,
  };
}

type RunImportOptions = {
  dataFormat: DataFormat;
  dataType: UsgsDataType;
  name: string;
  desc: string;
  projectName: string;
  varieties: TimeSeriesType[];
  selectedStations: StationRow[];
  startDate: Date | null;
  endDate: Date | null;
  retrievePor: boolean;
  timeZone: UsgsTimeZone;

  onProgress: (u: ProgressUpdate) => void;

  onDataSave?: (category: string, payload: unknown, id?: string) => void | Promise<void>;
  id?: string;
};

export async function runUsgsImport(options: RunImportOptions): Promise<StationSummary> {
  const {
    dataFormat,
    dataType,
    name,
    desc,
    projectName,
    varieties,
    selectedStations,
    startDate,
    endDate,
    retrievePor,
    timeZone,
    onProgress,
    onDataSave,
    id,
  } = options;

  const selectedVarieties: TimeSeriesType[] = varieties.length ? varieties.slice() : [TimeSeriesType.FLOW];

  const seriesResults = await fetchSeriesInBatches(
    selectedStations,
    selectedVarieties,
    dataType,
    startDate,
    endDate,
    retrievePor,
    timeZone,
    onProgress
  );

  const stationSummary = buildStationSummary(seriesResults, selectedStations);

  if (dataFormat === "JSON") {
    const interval = inferIntervalEPart(dataType);

    for (const variety of selectedVarieties) {
      const isStage = variety === TimeSeriesType.STAGE;
      const parameter = isStage ? "Stage" : "Flow";
      const units = isStage ? "FT" : "CFS";
      const category = isStage ? "Stage" : "Discharge";

      const varietySeries = seriesResults.filter((s) => s.variety === variety);

      const jsonSeriesEntries: {
        stationId: string;
        aPart: string;
        bPart: string;
        fPart: string;
        startDateTime: string;
        endDateTime: string;
        values: number[];
        times: string[];
      }[] = [];

      const totalToProcess = varietySeries.length;
      let processed = 0;

      onProgress({
        phase: "write",
        writeLabelKey: isStage ? "UsgsDataImporter_Import_Write_Stage_JSON" : "UsgsDataImporter_Import_Write_Flow_JSON",
        writeDone: 0,
        writeTotal: totalToProcess,
      });

      for (const series of varietySeries) {
        const row = selectedStations.find((r) => r.id === series.stationId);
        if (!row) continue;

        const validPoints = getValidSortedPoints(series.points);
        if (validPoints.length === 0) {
          processed = processed + 1;
          onProgress({
            phase: "write",
            writeLabelKey: isStage ? "UsgsDataImporter_Import_Write_Stage_JSON" : "UsgsDataImporter_Import_Write_Flow_JSON",
            writeDone: processed,
            writeTotal: totalToProcess,
          });
          continue;
        }

        const hecTimes = validPoints.map((p) => formatHecDateTimeFromIso(String(p.timestamp)));
        const values = validPoints.map((p) => Number(p.value));
        const startDateTime = hecTimes[0];
        const endDateTime = hecTimes[hecTimes.length - 1];

        jsonSeriesEntries.push({
          stationId: series.stationId,
          aPart: row.aPart,
          bPart: row.bPart,
          fPart: row.fPart,
          startDateTime,
          endDateTime,
          values,
          times: hecTimes,
        });

        processed = processed + 1;

        onProgress({
          phase: "write",
          writeLabelKey: isStage ? "UsgsDataImporter_Import_Write_Stage_JSON" : "UsgsDataImporter_Import_Write_Flow_JSON",
          writeDone: processed,
          writeTotal: totalToProcess,
        });
      }

      if (jsonSeriesEntries.length === 0) continue;

      const primary = jsonSeriesEntries[0];

      const tsName = name.trim().length > 0 ? name.trim() : isStage ? "USGS Stage" : "USGS Discharge";

      const description =
        desc.trim().length > 0 ? desc.trim() : `USGS ${category} imported for project ${projectName}`;

      const jsonPayload = {
        structureType: "TimeSeries",
        dataFormat: "JSON",
        dataType: parameter,
        name: tsName,
        description,
        parameter,
        units,
        interval,
        startDateTime: primary.startDateTime,
        endDateTime: primary.endDateTime,
        values: primary.values,
        times: primary.times,
        series: jsonSeriesEntries,
        source: "USGS",
      };

      if (onDataSave) await onDataSave(category, jsonPayload, id);
    }

    onProgress({ phase: "done", summary: stationSummary });
    return stationSummary;
  }

  if (dataFormat === "DSS") {
    const intervalE = inferIntervalEPart(dataType);

    for (const variety of selectedVarieties) {
      const isStage = variety === TimeSeriesType.STAGE;
      const filepath = isStage ? "stage.dss" : "discharge.dss";
      const cPart =
        dataType === UsgsDataType.ANNUAL_PEAKS
          ? (isStage ? "STAGE-ANNUAL PEAK" : "FLOW-ANNUAL PEAK")
          : (isStage ? "STAGE" : "FLOW");
      const units = isStage ? "FT" : "CFS";
      const category = isStage ? "Stage" : "Discharge";

      const varietySeries = seriesResults.filter((s) => s.variety === variety);

      const totalToProcess = varietySeries.length;
      let processed = 0;

      onProgress({
        phase: "write",
        writeLabelKey: isStage ? "UsgsDataImporter_Import_Write_Stage_DSS" : "UsgsDataImporter_Import_Write_Flow_DSS",
        writeDone: 0,
        writeTotal: totalToProcess,
      });

      const dssSeriesEntries: {
        stationId: string;
        aPart: string;
        bPart: string;
        fPart: string;
        pathname: string;
        startDateTime: string;
        values: number[];
        times: number[];
      }[] = [];

      for (const series of varietySeries) {
        const row = selectedStations.find((r) => r.id === series.stationId);
        if (!row) continue;

        const validPoints = getValidSortedPoints(series.points);
        if (validPoints.length === 0) {
          processed = processed + 1;
          onProgress({
            phase: "write",
            writeLabelKey: isStage ? "UsgsDataImporter_Import_Write_Stage_DSS" : "UsgsDataImporter_Import_Write_Flow_DSS",
            writeDone: processed,
            writeTotal: totalToProcess,
          });
          continue;
        }

        const startDateTime = validPoints[0].timestamp;
        const dPart = formatDssDateFromIso(String(startDateTime));

        const rawAPart = (row.aPart || row.id || "").trim();
        const rawBPart = (row.bPart || "").trim();
        const rawFPart = (row.fPart || "USGS").trim();

        const aPart = sanitizeDssPart(rawAPart);
        const bPart = sanitizeDssPart(rawBPart);
        const fPart = sanitizeDssPart(rawFPart);

        const pathname = `/${aPart}/${bPart}/${cPart}/${dPart}/${intervalE}/${fPart}/`;

        const values = validPoints.map((p) => p.value as number);
        const times = validPoints.map((p) => toJulianDay(new Date(p.timestamp)));

        dssSeriesEntries.push({
          stationId: series.stationId,
          aPart,
          bPart,
          fPart,
          pathname,
          startDateTime: String(startDateTime),
          values,
          times,
        });

        processed = processed + 1;

        onProgress({
          phase: "write",
          writeLabelKey: isStage ? "UsgsDataImporter_Import_Write_Stage_DSS" : "UsgsDataImporter_Import_Write_Flow_DSS",
          writeDone: processed,
          writeTotal: totalToProcess,
        });
      }

      if (dssSeriesEntries.length === 0) continue;

      const pathnameArray = dssSeriesEntries.map((s) => s.pathname);

      const tsName = name.trim().length > 0 ? name.trim() : isStage ? "USGS Stage" : "USGS Discharge";

      const description =
        desc.trim().length > 0 ? desc.trim() : `USGS ${category} imported into ${filepath} for project ${projectName}`;

      const valueType =
        dataType === UsgsDataType.INSTANTANEOUS || dataType === UsgsDataType.ANNUAL_PEAKS
          ? "INST-VAL"
          : "PER-AVER";

      const dssPayload = {
        structureType: "TimeSeries",
        dataFormat: "DSS",
        dataType: category,
        name: tsName,
        description,
        filepath,
        pathname: pathnameArray,
        units,
        valueType,
        interval: intervalE,
        series: dssSeriesEntries,
      };

      if (onDataSave) await onDataSave(category, dssPayload, id);
    }

    onProgress({ phase: "done", summary: stationSummary });
    return stationSummary;
  }

  onProgress({ phase: "done", summary: stationSummary });
  return stationSummary;
}
