export type FlowRow = {
  year: number;
  peak: string;
  low: string;
  high: string;
  dataType: "Systematic" | "Historical" | "Censored";
};

export type ThresholdRow = {
  id: string;
  startYear: number;
  endYear: number;
  low: string;
  high: string;
  comment: string;
};

export const DATA_TYPES: FlowRow["dataType"][] = ["Systematic", "Historical", "Censored"];

export function parseNum(v: string): number | null {
  const s = (v ?? "").toString().trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function clampInt(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

export function buildYears(startYear: number, endYear: number): number[] {
  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) return [];
  if (endYear < startYear) return [];
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) years.push(y);
  return years;
}

export function syncRowsToYears(existing: FlowRow[] | undefined, years: number[]): FlowRow[] {
  const byYear = new Map<number, FlowRow>();
  (existing ?? []).forEach((r) => byYear.set(r.year, r));
  return years.map((year) => {
    const found = byYear.get(year);
    return (
      found ?? {
        year,
        peak: "",
        low: "",
        high: "",
        dataType: "Censored",
      }
    );
  });
}

export function parseClipboardGrid(text: string): string[][] {
  return (text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((r) => r.length > 0)
    .map((r) => r.split("\t"));
}

export function defaultThresholdRow(startYear: number, endYear: number): ThresholdRow {
  return {
    id: crypto.randomUUID(),
    startYear,
    endYear,
    low: "",
    high: "",
    comment: "",
  };
}

function clampZeroToOne(x: number) {
  return Math.max(0, Math.min(1, x));
}

function interpolateLinear(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function pinkShade(index: number, total: number, alpha: number) {
  const t = total <= 1 ? 0 : clampZeroToOne(index / (total - 1));
  const r = Math.round(interpolateLinear(255, 200, t));
  const g = Math.round(interpolateLinear(170, 70, t));
  const b = Math.round(interpolateLinear(170, 70, t));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function parseDateUTC(v: unknown): Date | null {
  if (v == null) return null;
  if (v instanceof Date && Number.isFinite(v.getTime())) return v;

  if (typeof v === "number" && Number.isFinite(v)) {
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d : null;
  }

  const s = String(v).trim();
  if (!s) return null;

  const iso = Date.parse(s);
  if (Number.isFinite(iso)) return new Date(iso);

  const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1) {
    const mm = Number(m1[1]);
    const dd = Number(m1[2]);
    const yyyy = Number(m1[3]);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) return new Date(Date.UTC(yyyy, mm - 1, dd));
  }

  const m2 = s.match(/^(\d{1,2})([A-Za-z]{3})(\d{4})$/);
  if (m2) {
    const dd = Number(m2[1]);
    const mon = m2[2].toLowerCase();
    const yyyy = Number(m2[3]);
    const monthMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const mm = monthMap[mon];
    if (mm != null && dd >= 1 && dd <= 31) return new Date(Date.UTC(yyyy, mm, dd));
  }

  return null;
}

export function waterYearFromDate(d: Date): number {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth(); // 0=Jan
  return m >= 9 ? y + 1 : y; // Oct(9)–Dec -> next WY
}
