import {UsgsDataType} from "./usgs/io/UsgsDataType";
import {TimeSeriesType} from "../timeSeries/timeSeriesType";

export type UsgsTimeZone = "UTC" | "LOCAL_STANDARD";

export interface UsgsStationMeta {
  id: string;
  name: string;
  location: string;
}

export interface UsgsPoint {
  timestamp: string;
  value: number | null;
}

function getParameterCode(kind: TimeSeriesType): string {
  if (kind === TimeSeriesType.STAGE) return "00065";
  if (kind === TimeSeriesType.FLOW) return "00060";
  throw new Error("Unsupported time series type for USGS parameter code");
}

/**
 * Get all stations in a state that have the requested parameter.
 * Uses NWIS "site" service with tab-delimited (rdb) output.
 */
export async function fetchStationsByState(args: {
  state: string;
  variety: TimeSeriesType;
}): Promise<UsgsStationMeta[]> {
  const parameterCd = getParameterCode(args.variety);

  const url = new URL("https://waterservices.usgs.gov/nwis/site/");
  url.searchParams.set("format", "rdb");
  url.searchParams.set("stateCd", args.state);
  url.searchParams.set("parameterCd", parameterCd);

  console.log("USGS site URL", url.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`USGS site request failed: ${response.status}`);
  }

  const text = await response.text();
  console.log("USGS site response sample", text.slice(0, 400));

  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (lines.length < 3) {
    return [];
  }

  const headerRow = lines[0].split("\t");
  const siteNoIdx = headerRow.indexOf("site_no");
  const stationNameIdx = headerRow.indexOf("station_nm");

  const result: UsgsStationMeta[] = [];
  const dataLines = lines.slice(2);

  for (const line of dataLines) {
    const cols = line.split("\t");
    const id = siteNoIdx >= 0 ? cols[siteNoIdx] : "";
    if (!id) {
      continue;
    }

    const fullName = stationNameIdx >= 0 ? cols[stationNameIdx] : "";
    const parsed = parseStationName(fullName);

    result.push({
      id,
      name: parsed.streamName,
      location: parsed.town,
    });
  }

  return result;
}

export function parseStationName(fullName: string): { streamName: string; town: string } {
  const pattern = /(.*?)(?: BELOW | NEAR | AT | NR )(.*)/i;
  const match = fullName.match(pattern);

  if (match && match[1] && match[2]) {
    return {
      streamName: match[1].trim(),
      town: match[2].trim(),
    };
  }

  return {
    streamName: fullName.trim(),
    town: "",
  };
}

export async function fetchTimeseriesViaServer({
                                                 stationId,
                                                 dataType,
                                                 variety,
                                                 startDate,
                                                 endDate,
                                                 retrievePor,
                                                 timeZone,
                                               }: {
  stationId: string;
  dataType: UsgsDataType;
  variety: TimeSeriesType;
  startDate?: Date | null;
  endDate?: Date | null;
  retrievePor?: boolean;
  timeZone?: UsgsTimeZone;
}): Promise<UsgsPoint[]> {
  const payload: any = {
    stationId,
    dataType,
    variety,
    timeZone,
  };

  if (dataType === UsgsDataType.ANNUAL_PEAKS) {
    payload.mode = UsgsDataType.ANNUAL_PEAKS;
  } else if (dataType === UsgsDataType.DAILY && retrievePor) {
    payload.retrievePor = true;
  } else if (startDate && endDate) {
    payload.startDate = startDate.toISOString().slice(0, 10);
    payload.endDate = endDate.toISOString().slice(0, 10);
  } else {
    payload.period = "P30D";
  }

  console.log("fetchTimeseriesViaServer request", payload);

  const response = await fetch("/api/usgs/timeSeries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("USGS server proxy error", response.status, text);
    throw new Error("Server failed to fetch USGS time series");
  }

  const json = await response.json();
  console.log("fetchTimeseriesViaServer response json", json);
  return (json.points ?? []) as UsgsPoint[];
}
