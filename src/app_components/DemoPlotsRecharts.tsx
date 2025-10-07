import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ReferenceLine,
  ComposedChart,
  ZAxis,
} from "recharts";

// -------------------- Types --------------------

type TimeSeriesPoint = {
  date: string; // YYYY-MM-DD
  flow: number;
  precip: number;
  lo: number;
  hi: number;
  band: number; // hi - lo
};

type RatingPoint = {
  q: number; // discharge
  stage: number; // observed (noisy)
  stage_true: number; // deterministic curve (reference)
};

export interface DemoPlotsRechartsProps {
  seriesA?: TimeSeriesPoint[];
  seriesB?: TimeSeriesPoint[];
}

// Tooltip payload item (minimal subset we actually use)
type TooltipItem = {
  color?: string;
  name?: string;
  value?: number | string;
  unit?: string;
};

// Minimal tooltip props to avoid version/type drift
type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
  unitY?: string;
};

// -------------------- Helpers --------------------

function fmtDate(d: string | number | Date): string {
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

// deterministic PRNG so examples are stable
function mulberry32(seed = 1): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Time series data: daily flows with mild seasonality and noise
function makeTimeSeries({
                          days = 120,
                          start = "2024-01-01",
                          seed = 1,
                          base = 500,
                        }: {
  days?: number;
  start?: string;
  seed?: number;
  base?: number;
}): TimeSeriesPoint[] {
  const rand = mulberry32(seed);
  const t0 = new Date(start).getTime();
  const msDay = 24 * 3600 * 1000;
  return range(days).map((i) => {
    const t = new Date(t0 + i * msDay);
    const season = 1 + 0.4 * Math.sin((2 * Math.PI * i) / 60);
    const noise = (rand() - 0.5) * 150;
    const flow = Math.max(0, base * season + noise);
    const lo = Math.max(0, flow * (0.9 - 0.05 * rand()));
    const hi = flow * (1.1 + 0.05 * rand());
    return {
      date: fmtDate(t),
      flow: Math.round(flow),
      precip: Math.max(0, Math.round(rand() * 15 - 3)), // occasional storms
      lo: Math.round(lo),
      hi: Math.round(hi),
      band: Math.max(0, Math.round(hi - lo)),
    };
  });
}

// Paired data curve (e.g., stage-discharge rating) with slight scatter
function makePairedData({ n = 60, seed = 2 }: { n?: number; seed?: number }): RatingPoint[] {
  const rand = mulberry32(seed);
  return range(n).map((i) => {
    const q = 10 + i * 50;
    const a = 0.0015,
        b = 2.2; // h = a*q^b
    const stageTrue = a * Math.pow(q, b);
    const stageObs = stageTrue * (0.95 + 0.1 * rand());
    return {
      q: Math.round(q),
      stage: +stageObs.toFixed(2),
      stage_true: +stageTrue.toFixed(2),
    };
  });
}

// Monthly bars from a time series
function aggregateMonthly(data: TimeSeriesPoint[]): { month: string; total: number }[] {
  const byMonth = new Map<string, number>();
  for (const d of data) {
    const m = d.date.slice(0, 7); // YYYY-MM
    const v = byMonth.get(m) ?? 0;
    byMonth.set(m, v + d.flow);
  }
  return Array.from(byMonth.entries()).map(([month, total]) => ({ month, total }));
}

// -------------------- Small UI bits --------------------

const Card: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
                                                                                           title,
                                                                                           subtitle,
                                                                                           children,
                                                                                         }) => (
    <div className="rounded-2xl shadow p-4 mb-6 bg-white dark:bg-[#111318] border border-black/5">
      <div className="mb-2">
        <div className="text-base font-semibold">{title}</div>
        {subtitle && <div className="text-xs opacity-70">{subtitle}</div>}
      </div>
      {children}
    </div>
);

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unitY }) => {
  if (!active || !payload || !payload.length) return null;
  return (
      <div className="text-sm rounded border bg-white/90 dark:bg-[#0b0d12]/90 px-2 py-1">
        <div className="font-medium mb-1">{label}</div>
        {payload.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
          <span
              style={{ width: 10, height: 10, background: p.color, display: "inline-block" }}
          />
              <span>
            {p.name}: <b>{p.value}</b>
                {p.unit ? ` ${p.unit}` : unitY ? ` ${unitY}` : ""}
          </span>
            </div>
        ))}
      </div>
  );
};

// -------------------- Main Component --------------------

export default function DemoPlotsRecharts({ seriesA, seriesB }: DemoPlotsRechartsProps) {
  const tsA = useMemo<TimeSeriesPoint[]>(
      () => seriesA || makeTimeSeries({ seed: 3, base: 700 }),
      [seriesA]
  );
  const tsB = useMemo<TimeSeriesPoint[]>(
      () => seriesB || makeTimeSeries({ seed: 7, base: 400 }),
      [seriesB]
  );
  const rating = useMemo<RatingPoint[]>(() => makePairedData({}), []);
  const monthly = useMemo(() => aggregateMonthly(tsA), [tsA]);

  const floodWarning = 900;

  return (
      <div className="w-full">
        {/* 1) Simple time series with Brush (zoom) */}
        <Card title="Flow Time Series" subtitle="Line + Brush for zooming; grid, legend, tooltip">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={tsA} margin={{ left: 24, right: 12, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={20} />
              <YAxis dataKey="flow" />
              <Tooltip content={<CustomTooltip unitY="cfs" />} />
              <Legend />
              <ReferenceLine y={floodWarning} strokeDasharray="6 6" label="Warning" />
              <Line type="monotone" dataKey="flow" name="Flow" dot={false} strokeWidth={2} />
              <Brush dataKey="date" travellerWidth={8} height={20} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* 2) Uncertainty ribbon (lo/hi band) + median line */}
        <Card title="Uncertainty Band" subtitle="Area band (hi–lo) stacked on baseline + median line">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={tsA} margin={{ left: 24, right: 12, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={20} />
              <YAxis />
              <Tooltip content={<CustomTooltip unitY="cfs" />} />
              <Legend />
              {/* Baseline (lo) hidden area to support stack-based band */}
              <Area type="monotone" dataKey="lo" name="Lo" stackId="band" fillOpacity={0} strokeOpacity={0} />
              {/* The ribbon is (hi - lo) stacked on top of lo */}
              <Area type="monotone" dataKey="band" name="Band (hi−lo)" stackId="band" fillOpacity={0.2} strokeOpacity={0} />
              <Line type="monotone" dataKey="flow" name="Median" dot={false} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* 3) Dual-axis composed chart: precipitation (bars) + flow (line) */}
        <Card title="Flow vs Precipitation" subtitle="ComposedChart with dual axes">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={tsA} margin={{ left: 24, right: 12, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={20} />
              <YAxis yAxisId="left" orientation="left" tickFormatter={(v: number) => `${v}`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => `${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="right" dataKey="precip" name="Precip" opacity={0.7} />
              <Line yAxisId="left" type="monotone" dataKey="flow" name="Flow" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* 4) Comparison of two series with Brush & synced domains */}
        <Card title="Series Comparison" subtitle="Two lines with shared x-axis + Brush">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
                data={tsA.map((d, i) => ({ ...d, other: tsB[i]?.flow }))}
                margin={{ left: 24, right: 12, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={20} />
              <YAxis />
              <Tooltip content={<CustomTooltip unitY="cfs" />} />
              <Legend />
              <Line type="monotone" dataKey="flow" name="Series A" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="other" name="Series B" dot={false} />
              <Brush dataKey="date" travellerWidth={8} height={20} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* 5) Paired data (rating curve) as Scatter + reference power curve */}
        <Card title="Rating Curve" subtitle="Scatter with deterministic reference curve">
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ left: 24, right: 12, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="q" name="Discharge" unit=" cfs" />
              <YAxis dataKey="stage" name="Stage" unit=" ft" />
              <ZAxis range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend />
              <Scatter name="Observed" data={rating} line={false} />
              {/* reference line by sampling stage_true */}
              <Scatter
                  name="Reference"
                  data={rating}
                  line
                  lineJointType="monotone"
                  fillOpacity={0}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* 6) Monthly totals bar chart */}
        <Card title="Monthly Volume" subtitle="Aggregated bars from daily flows">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly} margin={{ left: 24, right: 12, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip unitY="cfs-days" />} />
              <Legend />
              <Bar dataKey="total" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
  );
}
