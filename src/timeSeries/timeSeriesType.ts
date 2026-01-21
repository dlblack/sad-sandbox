export enum TimeSeriesType {
  FLOW = "FLOW",
  STAGE = "STAGE",
  ELEVATION = "ELEVATION",
  PRECIPITATION = "PRECIPITATION",
  STORAGE = "STORAGE",
  SWE = "SWE",
  TEMPERATURE = "TEMPERATURE",
  WINDSPEED = "WINDSPEED",
}

export function parseTimeSeriesType(raw: unknown): TimeSeriesType | undefined {
  if (!raw) return undefined;
  const t = String(raw).trim().toUpperCase();

  if (t === "FLOW" || t === "DISCHARGE" || t === "Q") {
    return TimeSeriesType.FLOW;
  }
  if (t === "STAGE") {
    return TimeSeriesType.STAGE;
  }
  if (t === "ELEVATION" || t === "ELEV") {
    return TimeSeriesType.ELEVATION;
  }
  if (t === "PRECIP" || t === "PRECIPITATION") {
    return TimeSeriesType.PRECIPITATION;
  }
  if (t === "STORAGE" || t === "STOR") {
    return TimeSeriesType.STORAGE;
  }
  if (t === "SWE") {
    return TimeSeriesType.SWE;
  }
  if (t === "TEMPERATURE" || t === "TEMP") {
    return TimeSeriesType.TEMPERATURE;
  }
  if (t === "WINDSPEED") {
    return TimeSeriesType.WINDSPEED;
  }

  return undefined;
}

export function timeSeriesTypeToString(t: TimeSeriesType): string {
  return t;
}
