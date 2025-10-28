import React, { JSX, useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  GridCol,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";

type Fig = { data: any[]; layout?: any; config?: any };

const AX = (xTitle: string, yTitle: string) => ({
  xaxis: {
    title: { text: xTitle },
    automargin: true,
    titlefont: { size: 12 },
    tickfont: { size: 11 },
    title_standoff: 8,
  },
  yaxis: {
    title: { text: yTitle },
    automargin: true,
    titlefont: { size: 12 },
    tickfont: { size: 11 },
    title_standoff: 8,
  },
  margin: { l: 64, r: 16, b: 56, t: 42 },
});

// Optional Mapbox token
if (typeof window !== "undefined" && (window as any).MAPBOX_TOKEN) {
  Plotly.setPlotConfig({ mapboxAccessToken: (window as any).MAPBOX_TOKEN });
}
const PUBLIC_OSM_STYLE_URL = "https://demotiles.maplibre.org/style.json";

function waitForMapLoaded(
    gd: any,
    key: "mapbox" | `mapbox${number}` = "mapbox",
    timeoutMs = 8000
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const start = performance.now();
    function tick() {
      const sub = gd?._fullLayout?.[key]?._subplot;
      const map = sub?.map;
      if (map && typeof map.loaded === "function" && map.loaded()) return resolve();
      if (performance.now() - start > timeoutMs)
        return reject(new Error("Map style load timeout"));
      requestAnimationFrame(tick);
    }
    tick();
  });
}

function plot(div: HTMLDivElement | null, fig: Fig) {
  if (!div) return;
  Plotly.react(
      div,
      fig.data,
      fig.layout,
      fig.config || { displayModeBar: true, responsive: true }
  );
}

function randn(n: number, mean = 0, std = 1) {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    out.push(mean + std * z);
  }
  return out;
}
function linspace(a: number, b: number, n: number) {
  const arr: number[] = [];
  const step = (b - a) / (n - 1);
  for (let i = 0; i < n; i++) arr.push(a + i * step);
  return arr;
}

export default function DemoPlots(): JSX.Element {
  const refs = {
    lineErr: useRef<HTMLDivElement | null>(null),
    ribbon: useRef<HTMLDivElement | null>(null),
    hist: useRef<HTMLDivElement | null>(null),
    barErr: useRef<HTMLDivElement | null>(null),
    scatterLog: useRef<HTMLDivElement | null>(null),
    heat2d: useRef<HTMLDivElement | null>(null),
    boxOnly: useRef<HTMLDivElement | null>(null),
    boxViolin: useRef<HTMLDivElement | null>(null),
    candlestick: useRef<HTMLDivElement | null>(null),
    heatmapTiles: useRef<HTMLDivElement | null>(null),
    subplots: useRef<HTMLDivElement | null>(null),
    inset: useRef<HTMLDivElement | null>(null),
    contour: useRef<HTMLDivElement | null>(null),
    ribbon3d: useRef<HTMLDivElement | null>(null),
    rangeSlider: useRef<HTMLDivElement | null>(null),
    tileMapLayer: useRef<HTMLDivElement | null>(null),
    tileDensity: useRef<HTMLDivElement | null>(null),
    freq: useRef<HTMLDivElement | null>(null),
    // NEW demo:
    copula: useRef<HTMLDivElement | null>(null),
  };

  const plotList = [
    { ref: () => refs.lineErr.current, title: "Hydrograph with Error Bars" },
    { ref: () => refs.ribbon.current, title: "Flow with Three Confidence Ribbons" },
    { ref: () => refs.hist.current, title: "Histogram of Annual Peak Flows" },
    { ref: () => refs.barErr.current, title: "Bar with CI" },
    { ref: () => refs.scatterLog.current, title: "Frequency Curve (Log–Log)" },
    { ref: () => refs.freq.current, title: "Flow Frequency (Exceedance Probability)" },
    { ref: () => refs.copula.current, title: "Copula Quantile-Isolines (p = 0.01)" },
    { ref: () => refs.heat2d.current, title: "2D Density" },
    { ref: () => refs.boxOnly.current, title: "Seasonal Flow Distributions (Box)" },
    { ref: () => refs.boxViolin.current, title: "Seasonal Flow Distributions (Violin)" },
    { ref: () => refs.candlestick.current, title: "Daily Stage Range (ft)" },
    { ref: () => refs.heatmapTiles.current, title: "Rainfall Intensity (Tile Heatmap)" },
    { ref: () => refs.subplots.current, title: "Subplots (2×1)" },
    { ref: () => refs.inset.current, title: "Hydrograph with Inset" },
    { ref: () => refs.contour.current, title: "Contour Plot (Stage Surface)" },
    { ref: () => refs.ribbon3d.current, title: "3D Ribbon Surface (Ensemble Hydrographs)" },
    { ref: () => refs.rangeSlider.current, title: "Time Series with Range Slider" },
    { ref: () => refs.tileMapLayer.current, title: "USGS Tile Map Layer (Sites)" },
    { ref: () => refs.tileDensity.current, title: "Tile Density Heat Map (Flow Events)" },
  ] as const;

  async function exportGalleryPNG() {
    const images: Array<{ title: string; img: HTMLImageElement }> = [];
    const padding = 16;
    const titleHeight = 22;
    const font = "14px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial";

    for (const item of plotList) {
      const div = item.ref();
      if (!div) continue;
      try {
        // @ts-expect-error Plotly types
        const dataUrl: string = await Plotly.toImage(div, { format: "png", scale: 2 });
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = dataUrl;
        });
        images.push({ title: item.title, img });
      } catch (e) {
        console.warn("Export failed for", item.title, e);
      }
    }

    if (images.length === 0) return;

    const canvasWidth = Math.max(...images.map((x) => x.img.naturalWidth)) + padding * 2;
    const canvasHeight = images.reduce(
        (acc, x) => acc + padding + titleHeight + x.img.naturalHeight + padding,
        0
    );

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.font = font;
    ctx.fillStyle = "#111827";
    ctx.textBaseline = "top";

    let y = 0;
    for (const { title, img } of images) {
      y += padding;
      ctx.fillText(title, padding, y);
      y += titleHeight;

      const x = Math.max(padding, Math.floor((canvasWidth - img.naturalWidth) / 2));
      ctx.drawImage(img, x, y);
      y += img.naturalHeight + padding;
    }

    const out = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = out;
    a.download = "DemoPlots-gallery.png";
    a.click();
  }

  function downsample(xs: number[], ys: number[], every = 4) {
    const x: number[] = [];
    const y: number[] = [];
    for (let i = 0; i < xs.length; i += every) {
      x.push(xs[i]);
      y.push(ys[i]);
    }
    return { x, y };
  }

  async function renderSitesMap(div: HTMLDivElement | null) {
    if (!div) return;

    const lats = [21.36, 21.317, 21.34, 21.35];
    const lons = [-157.88, -157.858, -157.89, -157.91];
    const names = ["Gage A", "Gage B", "Gage C", "Gage D"];

    await Plotly.react(
        div,
        [],
        {
          mapbox: { style: PUBLIC_OSM_STYLE_URL, center: { lat: 21.34, lon: -157.89 }, zoom: 11 },
          margin: { l: 0, r: 0, t: 40, b: 0 },
          height: 360,
          title: { text: "USGS Tile Map Layer (Sites)" },
        },
        { displayModeBar: true, responsive: true }
    );

    await waitForMapLoaded(div).catch(() => {});

    await Plotly.react(
        div,
        [
          {
            type: "scattermapbox",
            lat: lats,
            lon: lons,
            mode: "markers",
            marker: { size: 10 },
            hovertext: names,
            hoverinfo: "text",
            name: "Sites",
          },
        ],
        {
          mapbox: {
            style: PUBLIC_OSM_STYLE_URL,
            center: { lat: 21.34, lon: -157.89 },
            zoom: 11,
            layers: [
              {
                sourcetype: "raster",
                source: [
                  "https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
                ],
                below: "traces",
              },
            ],
          },
          margin: { l: 0, r: 0, t: 40, b: 0 },
          height: 360,
          title: { text: "USGS Tile Map Layer (Sites)" },
        },
        { displayModeBar: true, responsive: true }
    );
  }

  async function renderDensityMap(div: HTMLDivElement | null) {
    if (!div) return;

    const center = { lat: 21.34, lon: -157.89 };
    const N = 400;
    const lat: number[] = [];
    const lon: number[] = [];
    const mag: number[] = [];
    for (let i = 0; i < N; i++) {
      const r = Math.abs(randn(1, 0, 0.02)[0]);
      const theta = Math.random() * 2 * Math.PI;
      lat.push(center.lat + r * Math.cos(theta));
      lon.push(center.lon + r * Math.sin(theta));
      mag.push(1000 + Math.abs(randn(1, 0, 700)[0]));
    }

    await Plotly.react(
        div,
        [],
        {
          mapbox: { style: PUBLIC_OSM_STYLE_URL, center, zoom: 10.8 },
          margin: { l: 0, r: 0, t: 40, b: 0 },
          height: 360,
          title: { text: "Tile Density Heat Map (High-Flow Event Density)" },
        },
        { displayModeBar: true, responsive: true }
    );

    await waitForMapLoaded(div).catch(() => {});

    await Plotly.react(
        div,
        [
          ({
            type: "densitymapbox",
            lat,
            lon,
            z: mag,
            radius: 25,
            name: "Flow Events",
          } as any),
        ],
        {
          mapbox: { style: PUBLIC_OSM_STYLE_URL, center, zoom: 10.8 },
          margin: { l: 0, r: 0, t: 40, b: 0 },
          height: 360,
          title: { text: "Tile Density Heat Map (High-Flow Event Density)" },
        },
        { displayModeBar: true, responsive: true }
    );
  }

  useEffect(() => {
    const t = linspace(0, 24, 40);
    const base = t.map((x) => 800 + 300 * Math.sin((Math.PI / 12) * x));
    const noise = randn(t.length, 0, 40);
    const flow = base.map((b, i) => b + noise[i]);
    const err = t.map(() => 50 + Math.random() * 40);

    // 1) Line + error bars
    plot(refs.lineErr.current, {
      data: [
        {
          x: t,
          y: flow,
          type: "scatter",
          mode: "lines+markers",
          error_y: { type: "data", array: err, visible: true },
          name: "Flow",
        },
      ],
      layout: { ...AX("Hour", "Discharge (cfs)"), title: { text: "Hydrograph with Error Bars" }, height: 320 },
    });

    // 2) Confidence ribbons
    const upper1 = flow.map((y, i) => y + err[i] * 0.8);
    const lower1 = flow.map((y, i) => y - err[i] * 0.8);

    const base2 = t.map((x) => 950 + 200 * Math.cos((Math.PI / 12) * x));
    const noise2 = randn(t.length, 0, 60);
    const flow2 = base2.map((b, i) => b + noise2[i]);
    const err2 = t.map(() => 80 + Math.random() * 50);
    const upper2 = flow2.map((y, i) => y + err2[i] * 0.8);
    const lower2 = flow2.map((y, i) => y - err2[i] * 0.8);

    const base3 = t.map((x) => 880 + 180 * Math.sin((Math.PI / 8) * x + Math.PI / 3));
    const noise3 = randn(t.length, 0, 45);
    const flow3 = base3.map((b, i) => b + noise3[i]);
    const err3 = t.map(() => 60 + Math.random() * 40);
    const upper3 = flow3.map((y, i) => y + err3[i] * 0.8);
    const lower3 = flow3.map((y, i) => y - err3[i] * 0.8);

    const dsStep = 4;
    const f1 = downsample(t, flow, dsStep);
    const u1 = downsample(t, upper1, dsStep);
    const l1 = downsample(t, lower1, dsStep);

    const f2 = downsample(t, flow2, dsStep);
    const u2 = downsample(t, upper2, dsStep);
    const l2 = downsample(t, lower2, dsStep);

    const f3 = downsample(t, flow3, dsStep);
    const u3 = downsample(t, upper3, dsStep);
    const l3 = downsample(t, lower3, dsStep);

    plot(refs.ribbon.current, {
      data: [
        { x: u1.x, y: u1.y, line: { width: 0 }, showlegend: false },
        { x: l1.x, y: l1.y, line: { width: 0 }, fill: "tonexty", fillcolor: "rgba(100,181,246,0.25)", showlegend: false },
        { x: f1.x, y: f1.y, type: "scatter", mode: "lines", name: "American River", line: { color: "rgb(33,150,243)", width: 2 } },

        { x: u2.x, y: u2.y, line: { width: 0 }, showlegend: false },
        { x: l2.x, y: l2.y, line: { width: 0 }, fill: "tonexty", fillcolor: "rgba(255,99,71,0.25)", showlegend: false },
        { x: f2.x, y: f2.y, type: "scatter", mode: "lines", name: "Sacramento River", line: { color: "rgb(255,99,71)", width: 2 } },

        { x: u3.x, y: u3.y, line: { width: 0 }, showlegend: false },
        { x: l3.x, y: l3.y, line: { width: 0 }, fill: "tonexty", fillcolor: "rgba(76,175,80,0.25)", showlegend: false },
        { x: f3.x, y: f3.y, type: "scatter", mode: "lines", name: "Feather River", line: { color: "rgb(76,175,80)", width: 2 } },
      ],
      layout: { ...AX("Hour", "Discharge (cfs)"), title: { text: "Flow with Three Confidence Ribbons" }, height: 320 },
    });

    // 3) Histogram
    const peaks = randn(500, 12000, 2500).map((v) => Math.max(200, v));
    plot(refs.hist.current, {
      data: [{ x: peaks, type: "histogram", nbinsx: 30, name: "Peaks" }],
      layout: { ...AX("Peak Flow (cfs)", "Frequency"), title: { text: "Histogram of Annual Peak Flows" }, height: 320 },
    });

    // 4) Bar + CI
    const cats = ["A", "B", "C", "D", "E"];
    const means = [3.2, 4.1, 2.8, 3.9, 4.4];
    const ci = [0.4, 0.35, 0.5, 0.3, 0.25];
    plot(refs.barErr.current, {
      data: [{ x: cats, y: means, type: "bar", error_y: { type: "data", array: ci, visible: true } }],
      layout: { ...AX("Category", "Value"), title: { text: "Bar with CI" }, height: 320 },
    });

    // 5) Log–log scatter (frequency curve)
    const q = [500, 900, 1500, 2500, 4000, 7000, 12000, 20000, 35000];
    const p = [0.9, 0.7, 0.5, 0.4, 0.2, 0.1, 0.04, 0.02, 0.01];
    plot(refs.scatterLog.current, {
      data: [{ x: p, y: q, mode: "markers+lines", name: "Freq Curve" }],
      layout: {
        ...AX("Exceedance Probability", "Discharge (cfs)"),
        xaxis: { type: "log", autorange: true, title: { text: "Exceedance Probability" }, automargin: true },
        yaxis: { type: "log", autorange: true, title: { text: "Discharge (cfs)" }, automargin: true },
        title: { text: "Frequency Curve (Log–Log)" },
        height: 320,
      },
    });

    // 6) Flow Frequency (custom axis)
    {
      const pTicks = [1, 0.99, 0.9, 0.5, 0.1, 0.01, 0.001];
      const xPos = [0, 1, 2, 3, 4, 5, 6];
      const logPT = pTicks.map((v) => Math.log10(v));
      function probFromX(x: number) {
        if (x <= xPos[0]) return pTicks[0];
        if (x >= xPos[xPos.length - 1]) return pTicks[pTicks.length - 1];
        const i = Math.floor(x);
        const t = x - xPos[i];
        const l0 = logPT[i];
        const l1 = logPT[i + 1];
        const lp = l0 * (1 - t) + l1 * t;
        return Math.pow(10, lp);
      }
      const cQuad = 0.02;
      const aLog10 = 2.494448508572121;
      const bLog10 = 0.47979400086720386;
      function flowFromX(x: number) {
        const partA = Math.pow(10, aLog10);
        const partB = Math.pow(10, bLog10 * x);
        const partC = Math.pow(10, cQuad * x * x);
        return (partA * partB) / partC;
      }
      const n = 360;
      const xs = Array.from({ length: n }, (_, k) => (6 * k) / (n - 1));
      xs.map((x) => probFromX(x));
      const computed = xs.map((x) => flowFromX(x));
      function widen(x: number) {
        const t = x / 6;
        return 0.16 + 0.1 * t;
      }
      const hiBand = xs.map((x, i) => computed[i] * Math.exp(Math.log1p(widen(x))));
      const loBand = xs.map((x, i) => computed[i] / Math.exp(Math.log1p(widen(x))));
      function pickEvery<T>(arr: T[], step: number): T[] {
        const out: T[] = [];
        for (let i = 0; i < arr.length; i += step) out.push(arr[i]);
        return out;
      }
      const xSys = pickEvery(xs, 3);
      const sysFlows = xSys.map((x, i) => {
        const base = flowFromX(x);
        const wave = Math.exp(0.06 * Math.sin(i * 0.8));
        const jitterSeq = [1.0, 1.02, 0.98, 1.03, 0.97, 1.01, 0.99];
        const jitter = jitterSeq[i % jitterSeq.length];
        return base * wave * jitter;
      });
      const yMin = 100;
      const yMax = Math.pow(10, Math.ceil(Math.log10(Math.max(...computed))));
      const decadeTicks = [100, 1000, 10000, 100000].filter((v) => v >= yMin && v <= yMax);

      plot(refs.freq.current, {
        data: [
          { x: xs, y: loBand, type: "scatter", mode: "lines", name: "5th Confidence Limit", line: { width: 2, color: "rgb(220,50,47)", dash: "dash" } },
          { x: xs, y: hiBand, type: "scatter", mode: "lines", name: "95th Confidence Limit", line: { width: 2, color: "rgb(220,50,47)", dash: "dash" } },
          { x: xs, y: computed, type: "scatter", mode: "lines", name: "Computed Curve", line: { width: 3, color: "black" } },
          { x: xSys, y: sysFlows, type: "scatter", mode: "markers", name: "Systematic Record", marker: { size: 6, symbol: "diamond", color: "rgb(30,30,30)", opacity: 0.9 } },
        ],
        layout: {
          title: { text: "Flow Frequency (Exceedance Probability)" },
          xaxis: {
            title: { text: "Exceedance Probability" },
            type: "linear",
            range: [-0.6, 6.6],
            tickmode: "array",
            tickvals: xPos,
            ticktext: ["1", "0.99", "0.9", "0.5", "0.1", "0.01", "0.001"],
            ticklabelposition: "outside",
            showgrid: true,
            gridcolor: "rgba(0,0,0,0.15)",
            zeroline: false,
          },
          yaxis: {
            title: { text: "Flow (cfs)" },
            type: "log",
            range: [Math.log10(yMin), Math.log10(yMax)],
            tickmode: "array",
            tickvals: decadeTicks,
            ticktext: decadeTicks.map((v) => v.toLocaleString()),
            ticks: "",
            ticklen: 0,
            showgrid: true,
            gridcolor: "rgba(0,0,0,0.22)",
            gridwidth: 1.2,
            minor: { showgrid: true, dtick: "D1", gridcolor: "rgba(0,0,0,0.12)", gridwidth: 0.7 },
          },
          legend: { orientation: "v", x: 1.03, y: 0.5, xanchor: "left", yanchor: "middle", bgcolor: "rgba(255,255,255,0.85)" },
          margin: { l: 92, r: 220, b: 64, t: 52 },
          height: 450,
        },
      });
    }

    // ******** Copula Quantile-Isolines (p = 0.01) ********
    {
      const xMin = 0, xMax = 12000;
      const yMin = 0, yMax = 1000;

      function pchipInterp(xs: number[], ys: number[], xq: number[]): number[] {
        const n = xs.length;
        const h = Array(n - 1).fill(0).map((_, i) => xs[i + 1] - xs[i]);
        const slope = Array(n - 1).fill(0).map((_, i) => (ys[i + 1] - ys[i]) / h[i]);

        const m = new Array(n).fill(0);
        m[0] = slope[0];
        m[n - 1] = slope[n - 2];
        for (let i = 1; i < n - 1; i++) {
          if (slope[i - 1] * slope[i] > 0) {
            const w1 = 2 * h[i] + h[i - 1];
            const w2 = h[i] + 2 * h[i - 1];
            m[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
          } else {
            m[i] = 0;
          }
        }

        function evalAt(x: number): number {
          // clamp to range
          if (x <= xs[0]) return ys[0];
          if (x >= xs[n - 1]) return ys[n - 1];
          // find interval
          let k = 0;
          while (k < n - 2 && x > xs[k + 1]) k++;
          const t = (x - xs[k]) / h[k];
          const t2 = t * t, t3 = t2 * t;

          const yk = ys[k], yk1 = ys[k + 1];
          const mk = m[k], mk1 = m[k + 1];
          const hk = h[k];

          // Hermite basis
          const h00 = (2 * t3 - 3 * t2 + 1);
          const h10 = (t3 - 2 * t2 + t) * hk;
          const h01 = (-2 * t3 + 3 * t2);
          const h11 = (t3 - t2) * hk;

          return h00 * yk + h10 * mk + h01 * yk1 + h11 * mk1;
        }

        return xq.map(evalAt);
      }

      const redXmain = [500, 2000, 4000, 6000, 8000, 9500, 10200, 10500];
      const redYmain = [590, 590, 590, 590, 590, 590, 480, 400];

      const redCurveX = linspace(500, 10500, 240);
      const redCurveY = pchipInterp(redXmain, redYmain, redCurveX);

      // ----- RED ISOLINE: flat, smooth Bézier turn, then vertical drop -----
      const redFlatX = linspace(500, 8000, 40);
      const redFlatY = redFlatX.map(() => 590);

      const P0 = { x: 8000,  y: 590  };
      const P1 = { x: 9200,  y: 590  };
      const P2 = { x: 10500, y: 590  };
      const P3 = { x: 10500, y: 400  };

      function cubicBezier(n = 80) {
        const bx: number[] = [];
        const by: number[] = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const u = 1 - t;
          const uu = u * u;
          const tt = t * t;
          const uuu = uu * u;
          const ttt = tt * t;
          const x = uuu * P0.x + 3 * uu * t * P1.x + 3 * u * tt * P2.x + ttt * P3.x;
          const y = uuu * P0.y + 3 * uu * t * P1.y + 3 * u * tt * P2.y + ttt * P3.y;
          bx.push(x);
          by.push(y);
        }
        return { x: bx, y: by };
      }
      const redArc = cubicBezier(80);

      const redDropX = [10500, 10500];
      const redDropY = [400, 0];

      const redLineX = [...redFlatX, ...redArc.x, ...redDropX];
      const redLineY = [...redFlatY, ...redArc.y, ...redDropY];

      // ----- BLUE ISOLINE: flat, smooth Bézier turn, then vertical drop -----
      const blueFlatX = linspace(500, 4000, 40);
      const blueFlatY = blueFlatX.map(() => 900);

      const B0 = { x: 4000, y: 900 };
      const B1 = { x: 5200, y: 900 };
      const B2 = { x: 8200, y: 880 };
      const B3 = { x: 8500, y: 400 };

      function cubicBezierBlue(n = 100) {
        const bx: number[] = [];
        const by: number[] = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const u = 1 - t;
          const uu = u * u;
          const tt = t * t;
          const uuu = uu * u;
          const ttt = tt * t;
          const x = uuu * B0.x + 3 * uu * t * B1.x + 3 * u * tt * B2.x + ttt * B3.x;
          const y = uuu * B0.y + 3 * uu * t * B1.y + 3 * u * tt * B2.y + ttt * B3.y;
          bx.push(x);
          by.push(y);
        }
        return { x: bx, y: by };
      }
      const blueArc = cubicBezierBlue(100);

      const blueDropX = [B3.x, B3.x];
      const blueDropY = [B3.y, 0];

      const blueLineX = [...blueFlatX, ...blueArc.x, ...blueDropX];
      const blueLineY = [...blueFlatY, ...blueArc.y, ...blueDropY];

      const redLineData = [
        { x: redFlatX, y: redFlatY, color: "rgb(0,0,0)" },  // Black from start to Triangle 3
        { x: redArc.x, y: redArc.y, color: "rgb(220,50,47)" }, // Red from Triangle 3 to Triangle 5
        { x: redDropX, y: redDropY, color: "rgb(0,0,0)" }     // Black from Triangle 5 to end
      ];

      const blueLineData = [
        { x: blueFlatX, y: blueFlatY, color: "rgb(0,0,0)" },  // Black from start to Triangle 1
        { x: blueArc.x, y: blueArc.y, color: "rgb(220,50,47)" }, // Red from Triangle 1 to Triangle 3
        { x: blueDropX, y: blueDropY, color: "rgb(0,0,0)" }    // Black from Triangle 3 to end
      ];

      const pickIdx = [
        40,
        95,
        165,
        210,
        240
      ];

      const modX = pickIdx.map(i => {
        if (i <= 120) return blueLineX[i];  // Blue line portion
        return redLineX[i - 120];  // Red line portion
      });

      const modY = pickIdx.map(i => {
        if (i <= 120) return blueLineY[i];
        return redLineY[i - 120];
      });

      const obsA_X = randn(42, 6500, 2500).map((v) => Math.min(Math.max(v, 800), 11500));
      const obsA_Y = obsA_X.map((x) => 700 * Math.exp(-Math.pow(x / 7000, 1.2)) + randn(1, 0, 120)[0]);
      const obsB_X = randn(42, 5000, 2700).map((v) => Math.min(Math.max(v, 600), 11200));
      const obsB_Y = obsB_X.map((x) => 680 * Math.exp(-Math.pow(x / 6200, 1.1)) + randn(1, 0, 140)[0]);

      const labels = modX.map((x, i) => ({ x, y: modY[i], text: String(i + 1) }));

      plot(refs.copula.current, {
        data: [
          { x: obsA_X, y: obsA_Y, mode: "markers", type: "scatter", name: "Observations M_max–T_sim", marker: { symbol: "circle", size: 8, color: "rgba(0,0,0,0)", line: { color: "black", width: 1 } } },
          { x: obsB_X, y: obsB_Y, mode: "markers", type: "scatter", name: "Observations M_sim–T_max", marker: { symbol: "x", size: 9, color: "black" } },

          { x: modX, y: modY, mode: "markers", type: "scatter", name: "Modeled Flow Combinations", marker: { symbol: "triangle-up", size: 10, color: "rgb(0,160,70)" } },

          // Add individual segments for the blue and red lines
          ...redLineData.map(segment => ({
            x: segment.x, y: segment.y, mode: "lines", type: "scatter", line: { width: 3, color: segment.color }
          })),

          ...blueLineData.map(segment => ({
            x: segment.x, y: segment.y, mode: "lines", type: "scatter", line: { width: 3, color: segment.color }
          })),

          { x: [10500, 10500], y: [400, 0], mode: "lines", type: "scatter",
            showlegend: false, line: { color: "rgb(220,50,47)", width: 3 } },

          { x: modX, y: modY, mode: "markers", type: "scatter", name: "Modeled Flow Combinations", marker: { symbol: "triangle-up", size: 10, color: "rgb(0,160,70)" } },
        ],
        layout: {
          title: { text: "Copula Quantile-Isolines (p = 0.01)" },
          ...AX("Main Stream (m³/s)", "Tributary (m³/s)"),
          xaxis: { range: [xMin, xMax], gridcolor: "rgba(0,0,0,0.12)" },
          yaxis: { range: [yMin, yMax], gridcolor: "rgba(0,0,0,0.12)" },
          legend: { bgcolor: "rgba(255,255,255,0.9)" },
          height: 420,
          annotations: labels.map((p, i) => ({
            x: p.x,
            y: p.y,
            text: String(i + 1),
            showarrow: true,
            arrowhead: 3,
            arrowsize: 1,
            ax: i % 2 === 0 ? -25 : 25,
            ay: -20,
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.5)",
          })),
        },
      });
    }
    // ******** end new demo ********


    // 7) 2D density
    const x2 = randn(1000, 0, 1.0);
    const y2 = x2.map((v) => 0.6 * v + randn(1, 0, 0.8)[0]);
    plot(refs.heat2d.current, {
      data: [{ x: x2, y: y2, type: "histogram2d", colorscale: "Viridis" }],
      layout: { ...AX("Variable X", "Variable Y"), title: { text: "2D Density" }, height: 320 },
    });

    // 8) Box plots
    const springBox = randn(220, 1500, 420);
    const summerBox = randn(220, 900, 260);
    const fallBox = randn(220, 1800, 520);
    const winterBox = randn(220, 2200, 740);
    plot(refs.boxOnly.current, {
      data: [
        { y: springBox, name: "Spring", type: "box", boxmean: true, jitter: 0.35, pointpos: 0, marker: { size: 3 }, line: { width: 1.5 } },
        { y: summerBox, name: "Summer", type: "box", boxmean: true, jitter: 0.35, pointpos: 0, marker: { size: 3 }, line: { width: 1.5 } },
        { y: fallBox, name: "Fall", type: "box", boxmean: true, jitter: 0.35, pointpos: 0, marker: { size: 3 }, line: { width: 1.5 } },
        { y: winterBox, name: "Winter", type: "box", boxmean: true, jitter: 0.35, pointpos: 0, marker: { size: 3 }, line: { width: 1.5 } },
      ],
      layout: { ...AX("Season", "Discharge (cfs)"), title: { text: "Seasonal Flow Distributions (Box)" }, boxmode: "group", height: 320 },
    });

    // 9) Violin
    const spring = randn(200, 1500, 400);
    const summer = randn(200, 900, 250);
    const fall = randn(200, 1800, 500);
    const winter = randn(200, 2200, 700);
    plot(refs.boxViolin.current, {
      data: [
        { y: spring, x: spring.map(() => "Spring"), type: "violin", name: "Spring", points: "outliers" },
        { y: summer, x: summer.map(() => "Summer"), type: "violin", name: "Summer", points: "outliers" },
        { y: fall, x: fall.map(() => "Fall"), type: "violin", name: "Fall", points: "outliers" },
        { y: winter, x: winter.map(() => "Winter"), type: "violin", name: "Winter", points: "outliers" },
      ],
      layout: { ...AX("Season", "Discharge (cfs)"), title: { text: "Seasonal Flow Distributions (Violin)" }, height: 320 },
    });

    // 10) Candlestick
    const days = linspace(1, 30, 30).map((d) => `Day ${Math.round(d)}`);
    const open = randn(30, 10, 0.6);
    const close = open.map((v) => v + randn(1, 0, 0.6)[0]);
    const high = open.map((v, i) => Math.max(v, close[i]) + 0.8 + Math.random() * 0.6);
    const low = open.map((v, i) => Math.min(v, close[i]) - 0.8 - Math.random() * 0.6);
    plot(refs.candlestick.current, {
      data: [{ type: "candlestick", x: days, open, high, low, close }],
      layout: { ...AX("Day", "Stage (ft)"), title: { text: "Daily Stage Range (ft)" }, height: 320 },
    });

    // 11) Tile heatmap
    const xh = linspace(0, 24, 25);
    const yh = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const z = yh.map(() => xh.map(() => Math.max(0, randn(1, 0.25, 0.35)[0])));
    plot(refs.heatmapTiles.current, {
      data: [{ z, x: xh, y: yh, type: "heatmap", colorscale: "Blues" }],
      layout: { ...AX("Hour", "Day of Week"), title: { text: "Rainfall Intensity (in/hr) – Tile Heatmap" }, height: 320 },
    });

    // 12) Subplots (2×1)
    const gX = linspace(0, 10, 200);
    const s1 = gX.map((x) => Math.sin(x));
    const s2 = gX.map((x) => Math.cos(x));
    plot(refs.subplots.current, {
      data: [
        { x: gX, y: s1, type: "scatter", mode: "lines", xaxis: "x1", yaxis: "y1", name: "sin" },
        { x: gX, y: s2, type: "scatter", mode: "lines", xaxis: "x2", yaxis: "y2", name: "cos" },
      ],
      layout: {
        grid: { rows: 2, columns: 1, pattern: "independent" },
        xaxis: { title: { text: "X (radians)" }, automargin: true },
        yaxis: { title: { text: "sin(x)" }, automargin: true },
        xaxis2: { title: { text: "X (radians)" }, automargin: true },
        yaxis2: { title: { text: "cos(x)" }, automargin: true },
        margin: { l: 64, r: 16, b: 56, t: 42 },
        title: { text: "Subplots (2×1)" },
        height: 320,
      },
    });

    // 13) Inset
    const mainX = linspace(0, 72, 289);
    const mainY = mainX.map(
        (x) => 1000 + 600 * Math.exp(-Math.pow((x - 36) / 10, 2)) + randn(1, 0, 25)[0]
    );
    const insetX = linspace(30, 42, 60);
    const insetY = insetX.map((x) => 1000 + 600 * Math.exp(-Math.pow((x - 36) / 10, 2)));
    plot(refs.inset.current, {
      data: [
        { x: mainX, y: mainY, type: "scatter", mode: "lines", name: "Observed" },
        { x: insetX, y: insetY, type: "scatter", mode: "lines", name: "Model", xaxis: "x2", yaxis: "y2" },
      ],
      layout: {
        ...AX("Hour", "Discharge (cfs)"),
        xaxis2: { domain: [0.62, 0.98], anchor: "y2", title: { text: "Hour (Inset)" } },
        yaxis2: { domain: [0.55, 0.95], anchor: "x2", title: { text: "Discharge (cfs)" } },
        showlegend: true,
        title: { text: "Hydrograph with Inset" },
        height: 420,
      },
    });

    // 14) Contour
    {
      const x = linspace(-5, 5, 80);
      const y = linspace(-5, 5, 80);
      const z2 = y.map((yv) =>
          x.map((xv) => 10 * Math.exp(-((xv * xv + yv * yv) / 10)) + 0.5 * xv - 0.3 * yv)
      );
      plot(refs.contour.current, {
        data: [{ x, y, z: z2, type: "contour", contours: { coloring: "heatmap" }, colorbar: { title: "Stage (ft)" } }],
        layout: { ...AX("X", "Y"), title: { text: "Contour Plot (Stage Surface)" }, height: 320 },
      });
    }

    // 15) 3D ribbon
    {
      const xs = linspace(0, 24, 60);
      const scenarios = 20;
      const z3: number[][] = [];
      for (let i = 0; i < scenarios; i++) {
        const phase = (i / scenarios) * Math.PI;
        z3.push(xs.map((x) => 900 + 250 * Math.sin((Math.PI / 12) * x + phase) + randn(1, 0, 15)[0]));
      }
      plot(refs.ribbon3d.current, {
        data: [{ type: "surface", x: xs, y: linspace(1, scenarios, scenarios), z: z3, showscale: true, colorbar: { title: "cfs" } }],
        layout: {
          title: { text: "3D Ribbon Surface (Ensemble Hydrographs)" },
          scene: { xaxis: { title: "Hour" }, yaxis: { title: "Scenario" }, zaxis: { title: "Discharge (cfs)" } },
          margin: { l: 0, r: 0, b: 0, t: 40 },
          height: 420,
        },
      });
    }

    // 16) Time series with range slider
    {
      const time = linspace(0, 365, 365);
      const series = time.map(
          (d) => 1500 + 500 * Math.sin((2 * Math.PI * d) / 365) + randn(1, 0, 80)[0]
      );
      plot(refs.rangeSlider.current, {
        data: [{ x: time.map((d) => new Date(2024, 0, 1 + d)), y: series, type: "scatter", mode: "lines", name: "Daily Flow" }],
        layout: {
          ...AX("Date", "Discharge (cfs)"),
          xaxis: {
            title: { text: "Date" },
            rangeslider: { visible: true },
            rangeselector: {
              buttons: [
                { count: 7, label: "1w", step: "day", stepmode: "backward" },
                { count: 1, label: "1m", step: "month", stepmode: "backward" },
                { count: 6, label: "6m", step: "month", stepmode: "backward" },
                { step: "all" },
              ],
            },
          },
          title: { text: "Time Series with Range Slider" },
          height: 320,
        },
      });
    }

    // 17) Map (sites)
    (async () => { await renderSitesMap(refs.tileMapLayer.current); })();

    // 18) Map (density)
    (async () => { await renderDensityMap(refs.tileDensity.current); })();
  }, []);

  return (
      <Container size="xl" px="md" py="md">
        <Box style={{ position: "sticky", top: 0, zIndex: 5, background: "var(--mantine-color-body)" }}>
          <Group justify="space-between" py="xs">
            <Title order={4} m={0}>Plotly Demo Gallery</Title>
            <Button size="xs" onClick={exportGalleryPNG}>Export gallery as PNG</Button>
          </Group>
          <Divider />
        </Box>

        <Stack gap="lg" mt="md">
          <Grid gutter="lg">
            <GridCol span={12}><Text ta="center" fw={600}>Hydrograph with Error Bars</Text><div ref={refs.lineErr} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Flow with Three Confidence Ribbons</Text><div ref={refs.ribbon} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Histogram of Annual Peak Flows</Text><div ref={refs.hist} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Bar with CI</Text><div ref={refs.barErr} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Frequency Curve (Log–Log)</Text><div ref={refs.scatterLog} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Flow Frequency (Exceedance Probability)</Text><div ref={refs.freq} style={{ height: 450 }} /></GridCol>

            {/* NEW grid cell */}
            <GridCol span={12}>
              <Text ta="center" fw={600}>Copula Quantile-Isolines (p = 0.01)</Text>
              <div ref={refs.copula} style={{ height: 440 }} />
            </GridCol>

            <GridCol span={12}><Text ta="center" fw={600}>2D Density</Text><div ref={refs.heat2d} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Seasonal Flow Distributions (Box)</Text><div ref={refs.boxOnly} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Seasonal Flow Distributions (Violin)</Text><div ref={refs.boxViolin} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Daily Stage Range (ft)</Text><div ref={refs.candlestick} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Rainfall Intensity (Tile Heatmap)</Text><div ref={refs.heatmapTiles} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Subplots (2×1)</Text><div ref={refs.subplots} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Hydrograph with Inset</Text><div ref={refs.inset} style={{ height: 500 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Contour Plot (Stage Surface)</Text><div ref={refs.contour} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>3D Ribbon Surface (Ensemble Hydrographs)</Text><div ref={refs.ribbon3d} style={{ height: 500 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Time Series with Range Slider</Text><div ref={refs.rangeSlider} style={{ height: 420 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>USGS Tile Map Layer (Sites)</Text><div ref={refs.tileMapLayer} style={{ height: 500 }} /></GridCol>
            <GridCol span={12}><Text ta="center" fw={600}>Tile Density Heat Map</Text><div ref={refs.tileDensity} style={{ height: 500 }} /></GridCol>
          </Grid>
        </Stack>
      </Container>
  );
}
