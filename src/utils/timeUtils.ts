/** Accepts 8, 08, 830, 0830, 8:30, etc., and returns "hh:mm" (24-hour). */
export function normalizeTimeInput(value: string): string {
  if (/^\d{1,2}:\d{2}$/.test(value)) return value;
  if (/^\d{4}$/.test(value)) return `${value.slice(0, 2)}:${value.slice(2)}`;
  if (/^\d{3}$/.test(value)) return `0${value[0]}:${value.slice(1)}`;
  if (/^\d{2}$/.test(value)) return `${value}:00`;
  if (/^\d$/.test(value)) return `0${value}:00`;
  if (value.trim() === "") return "";
  return value;
}

/** Converts a Date to HEC Julian day. */
export function toJulianDay(date: Date): number {
  const msPerDay = 86_400_000;
  const HEC_EPOCH = Date.UTC(1899, 11, 31, 0, 0);
  return (date.getTime() - HEC_EPOCH) / msPerDay;
}

/** Format a JS Date as `01Jan2000 08:00` (local time). */
export function formatDateTime(dt: Date): string {
  if (!(dt instanceof Date) || Number.isNaN(dt.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const day = pad(dt.getDate());
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
  const month = months[dt.getMonth()] ?? "Jan";
  const year = dt.getFullYear();
  const hour = pad(dt.getHours());
  const min = pad(dt.getMinutes());
  return `${day}${month}${year} ${hour}:${min}`;
}

/** Parse date/time input like ("01Jan2000", "08:00") into JS Date (local). */
export function parseDateTime(dateStr?: string, timeStr?: string): Date | null {
  try {
    if (!dateStr || !timeStr) return null;
    const dateWithSpaces =
        dateStr.length === 9
            ? `${dateStr.slice(0, 2)} ${dateStr.slice(2, 5)} ${dateStr.slice(5)}`
            : dateStr;
    const dtStr = `${dateWithSpaces} ${timeStr}`;
    const d = new Date(dtStr);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export type IntervalUnit = "minute" | "hour" | "day" | "week" | "month" | "year";

export type IntervalOption = {
  value: string;
  amount: number;
  unit: IntervalUnit;
  /** Optional fields to stay compatible with various option sources */
  label?: string;
  labelKey?: string;
};

/** Add an interval to a date using amount/unit. (Returns a new Date.) */
export function addInterval(dt: Date, amount: number, unit: IntervalUnit): Date {
  const newDt = new Date(dt);
  if (unit === "minute") newDt.setMinutes(newDt.getMinutes() + amount);
  else if (unit === "hour") newDt.setHours(newDt.getHours() + amount);
  else if (unit === "day") newDt.setDate(newDt.getDate() + amount);
  else if (unit === "week") newDt.setDate(newDt.getDate() + 7 * amount);
  else if (unit === "month") newDt.setMonth(newDt.getMonth() + amount);
  else if (unit === "year") newDt.setFullYear(newDt.getFullYear() + amount);
  return newDt;
}

export function isAfter(a: Date, b: Date): boolean {
  return a.getTime() > b.getTime();
}

/**
 * Generate array of date/time strings from start to end, given interval option.
 * Produces strings formatted as `DDMonYYYY HH:mm`.
 */
export function generateDateTimeRows(
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
    intervalOpt?: Pick<IntervalOption, "amount" | "unit"> | null
): string[] {
  const startDt = parseDateTime(startDate, startTime);
  const endDt = parseDateTime(endDate, endTime);
  if (!startDt || !endDt || !intervalOpt) return [];

  const out: string[] = [];
  let current = new Date(startDt);

  // Safety cap to avoid accidental infinite loops
  const MAX_ROWS = 1000;
  while (!isAfter(current, endDt) && out.length < MAX_ROWS) {
    out.push(formatDateTime(current));
    current = addInterval(current, intervalOpt.amount, intervalOpt.unit);
  }
  return out;
}
