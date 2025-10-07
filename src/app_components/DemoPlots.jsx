import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";
import {
  Container,
  Grid,
  GridCol,
  Group,
  Button,
  Title,
  Divider,
  Box,
  Stack,
  Text,
} from "@mantine/core";

const AX = (xTitle, yTitle) => ({
  xaxis: { title: { text: xTitle }, automargin: true, titlefont: { size: 12 }, tickfont: { size: 11 }, title_standoff: 8 },
  yaxis: { title: { text: yTitle }, automargin: true, titlefont: { size: 12 }, tickfont: { size: 11 }, title_standoff: 8 },
  margin: { l: 64, r: 16, b: 56, t: 42 }
});

if (typeof window !== "undefined" && window.MAPBOX_TOKEN) {
  Plotly.setPlotConfig({ mapboxAccessToken: window.MAPBOX_TOKEN });
}

function plot(div, fig) {
  if (!div) return;
  Plotly.react(div, fig.data, fig.layout, fig.config || { displayModeBar: true, responsive: true });
}
function randn(n, mean=0, std=1) {
  const out = [];
  for (let i=0;i<n;i++) {
    const u = 1 - Math.random(), v = Math.random();
    const z = Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
    out.push(mean + std*z);
  }
  return out;
}
function linspace(a, b, n) {
  const arr = [];
  const step = (b - a) / (n - 1);
  for (let i=0;i<n;i++) arr.push(a + i*step);
  return arr;
}

export default function DemoPlots() {
  const refs = {
    lineErr: useRef(null),
    ribbon: useRef(null),
    hist: useRef(null),
    barErr: useRef(null),
    scatterLog: useRef(null),
    heat2d: useRef(null),
    boxOnly: useRef(null),
    boxViolin: useRef(null),
    candlestick: useRef(null),
    heatmapTiles: useRef(null),
    subplots: useRef(null),
    inset: useRef(null),
    contour: useRef(null),
    ribbon3d: useRef(null),
    rangeSlider: useRef(null),
    tileMapLayer: useRef(null),
    tileDensity: useRef(null),
  };

  const plotList = [
    { ref: () => refs.lineErr.current,      title: "Hydrograph with Error Bars" },
    { ref: () => refs.ribbon.current,       title: "Flow with Three Confidence Ribbons" },
    { ref: () => refs.hist.current,         title: "Histogram of Annual Peak Flows" },
    { ref: () => refs.barErr.current,       title: "Bar with CI" },
    { ref: () => refs.scatterLog.current,   title: "Frequency Curve (Log–Log)" },
    { ref: () => refs.heat2d.current,       title: "2D Density" },
    { ref: () => refs.boxOnly.current,      title: "Seasonal Flow Distributions (Box)" },
    { ref: () => refs.boxViolin.current,    title: "Seasonal Flow Distributions (Violin)" },
    { ref: () => refs.candlestick.current,  title: "Daily Stage Range (ft)" },
    { ref: () => refs.heatmapTiles.current, title: "Rainfall Intensity (Tile Heatmap)" },
    { ref: () => refs.subplots.current,     title: "Subplots (2×1)" },
    { ref: () => refs.inset.current,        title: "Hydrograph with Inset" },
    { ref: () => refs.contour.current,      title: "Contour Plot (Stage Surface)" },
    { ref: () => refs.ribbon3d.current,     title: "3D Ribbon Surface (Ensemble Hydrographs)" },
    { ref: () => refs.rangeSlider.current,  title: "Time Series with Range Slider" },
    { ref: () => refs.tileMapLayer.current, title: "USGS Tile Map Layer (Sites)" },
    { ref: () => refs.tileDensity.current,  title: "Tile Density Heat Map (Flow Events)" },
  ];

  async function exportGalleryPNG() {
    const images = [];
    const padding = 16;
    const titleHeight = 22;
    const font = "14px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial";

    for (const item of plotList) {
      const div = item.ref();
      if (!div) continue;
      try {
        const dataUrl = await Plotly.toImage(div, { format: "png", scale: 2 });
        const img = await new Promise((resolve, reject) => {
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

    const canvasWidth = Math.max(...images.map(x => x.img.naturalWidth)) + padding * 2;
    const canvasHeight = images.reduce((acc, x) => acc + padding + titleHeight + x.img.naturalHeight + padding, 0);

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");

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

  function downsample(xs, ys, every = 4) {
    const x = [];
    const y = [];
    for (let i = 0; i < xs.length; i += every) {
      x.push(xs[i]);
      y.push(ys[i]);
    }
    return { x, y };
  }

  useEffect(() => {
    const t = linspace(0, 24, 40);
    const base = t.map(x => 800 + 300*Math.sin((Math.PI/12)*x));
    const noise = randn(t.length, 0, 40);
    const flow = base.map((b,i)=>b+noise[i]);
    const err = t.map(()=> 50 + Math.random()*40);

    // 1) Line + error bars
    plot(refs.lineErr.current, {
      data: [{
        x: t, y: flow, type: "scatter", mode: "lines+markers",
        error_y: { type: "data", array: err, visible: true }, name: "Flow"
      }],
      layout: {
        ...AX("Hour", "Discharge (cfs)"),
        title: "Hydrograph with Error Bars",
        height: 320
      }
    });

    // 2) Confidence ribbon with three distinct series
    const upper1 = flow.map((y, i) => y + (err[i] * 0.8));
    const lower1 = flow.map((y, i) => y - (err[i] * 0.8));

    const base2  = t.map(x => 950 + 200 * Math.cos((Math.PI / 12) * x));
    const noise2 = randn(t.length, 0, 60);
    const flow2  = base2.map((b, i) => b + noise2[i]);
    const err2   = t.map(() => 80 + Math.random() * 50);
    const upper2 = flow2.map((y, i) => y + (err2[i] * 0.8));
    const lower2 = flow2.map((y, i) => y - (err2[i] * 0.8));

    const base3  = t.map(x => 880 + 180 * Math.sin((Math.PI / 8) * x + Math.PI / 3));
    const noise3 = randn(t.length, 0, 45);
    const flow3  = base3.map((b, i) => b + noise3[i]);
    const err3   = t.map(() => 60 + Math.random() * 40);
    const upper3 = flow3.map((y, i) => y + (err3[i] * 0.8));
    const lower3 = flow3.map((y, i) => y - (err3[i] * 0.8));


// Keep every Nth point (adjust this to taste)
    const dsStep = 4;

    const f1 = downsample(t, flow,   dsStep);
    const u1 = downsample(t, upper1, dsStep);
    const l1 = downsample(t, lower1, dsStep);

    const f2 = downsample(t, flow2,  dsStep);
    const u2 = downsample(t, upper2, dsStep);
    const l2 = downsample(t, lower2, dsStep);

    const f3 = downsample(t, flow3,  dsStep);
    const u3 = downsample(t, upper3, dsStep);
    const l3 = downsample(t, lower3, dsStep);


    plot(refs.ribbon.current, {
      data: [
        // Ribbon for series 1 (use thinned arrays)
        { x: u1.x, y: u1.y, line: { width: 0 }, showlegend: false },
        { x: l1.x, y: l1.y, line: { width: 0 }, fill: "tonexty", fillcolor: "rgba(100,181,246,0.25)", showlegend: false },
        { x: f1.x, y: f1.y, type: "scatter", mode: "lines", name: "American River", line: { color: "rgb(33,150,243)", width: 2 } },

        // Ribbon for series 2 (use thinned arrays)
        { x: u2.x, y: u2.y, line: { width: 0 }, showlegend: false },
        { x: l2.x, y: l2.y, line: { width: 0 }, fill: "tonexty", fillcolor: "rgba(255,99,71,0.25)", showlegend: false },
        { x: f2.x, y: f2.y, type: "scatter", mode: "lines", name: "Sacramento River", line: { color: "rgb(255,99,71)", width: 2 } },

        // Ribbon for series 3 (use thinned arrays)
        { x: u3.x, y: u3.y, line: { width: 0 }, showlegend: false },
        { x: l3.x, y: l3.y, line: { width: 0 }, fill: "tonexty", fillcolor: "rgba(76,175,80,0.25)", showlegend: false },
        { x: f3.x, y: f3.y, type: "scatter", mode: "lines", name: "Feather River", line: { color: "rgb(76,175,80)", width: 2 } },
      ],
      layout: {
        ...AX("Hour", "Discharge (cfs)"),
        title: "Flow with Three Confidence Ribbons",
        height: 320
      }
    });

    // 3) Histogram
    const peaks = randn(500, 12000, 2500).map(v=>Math.max(200, v));
    plot(refs.hist.current, {
      data: [{ x: peaks, type: "histogram", nbinsx: 30, name: "Peaks" }],
      layout: {
        ...AX("Peak Flow (cfs)", "Frequency"),
        title: "Histogram of Annual Peak Flows",
        height: 320
      }
    });

    // 4) Bar + CI
    const cats = ["A","B","C","D","E"];
    const means = [3.2, 4.1, 2.8, 3.9, 4.4];
    const ci = [0.4, 0.35, 0.5, 0.3, 0.25];
    plot(refs.barErr.current, {
      data: [{ x: cats, y: means, type: "bar", error_y: { type:"data", array: ci, visible: true } }],
      layout: {
        ...AX("Category", "Value"),
        title: "Bar with CI",
        height: 320
      }
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
        title: "Frequency Curve (Log–Log)",
        height: 320
      }
    });

    // 6) 2D density
    const x2 = randn(1000, 0, 1.0);
    const y2 = x2.map(v => 0.6*v + randn(1,0,0.8)[0]);
    plot(refs.heat2d.current, {
      data: [{ x: x2, y: y2, type: "histogram2d", colorscale: "Viridis" }],
      layout: {
        ...AX("Variable X", "Variable Y"),
        title: "2D Density",
        height: 320
      }
    });

    // Box plots (grouped seasonal distributions)
    const springBox = randn(220, 1500, 420);
    const summerBox = randn(220, 900, 260);
    const fallBox   = randn(220, 1800, 520);
    const winterBox = randn(220, 2200, 740);

    plot(refs.boxOnly.current, {
      data: [
        { y: springBox, name: "Spring", type: "box", boxmean: true, jitter: 0.35, pointpos: 0, marker: { size: 3 }, line: { width: 1.5 } },
        { y: summerBox, name: "Summer", type: "box", boxmean: true, jitter: 0.35, pointpos: 0, marker: { size: 3 }, line: { width: 1.5 } },
        { y: fallBox,   name: "Fall",   type: "box", boxmean: true, jitter: 0.35, pointpos: 0, marker: { size: 3 }, line: { width: 1.5 } },
        { y: winterBox, name: "Winter", type: "box", boxmean: true, jitter: 0.35, pointpos: 0, marker: { size: 3 }, line: { width: 1.5 } },
      ],
      layout: {
        ...AX("Season", "Discharge (cfs)"),
        title: "Seasonal Flow Distributions (Box)",
        boxmode: "group",
        height: 320
      }
    });

    // 7) Violin distributions
    const spring = randn(200, 1500, 400), summer = randn(200, 900, 250),
      fall   = randn(200, 1800, 500), winter = randn(200, 2200, 700);
    plot(refs.boxViolin.current, {
      data: [
        { y: spring, x: spring.map(()=> "Spring"), type: "violin", name: "Spring", points: "outliers" },
        { y: summer, x: summer.map(()=> "Summer"), type: "violin", name: "Summer", points: "outliers" },
        { y: fall,   x: fall.map(()=> "Fall"),     type: "violin", name: "Fall",   points: "outliers" },
        { y: winter, x: winter.map(()=> "Winter"), type: "violin", name: "Winter", points: "outliers" }
      ],
      layout: {
        ...AX("Season", "Discharge (cfs)"),
        title: "Seasonal Flow Distributions (Violin)",
        height: 320
      }
    });

    // 8) Candlestick (daily stage range)
    const days = linspace(1, 30, 30).map(d=>`Day ${Math.round(d)}`);
    const open = randn(30, 10, 0.6), close = open.map(v=>v+randn(1,0,0.6)[0]);
    const high = open.map((v,i)=> Math.max(v, close[i]) + 0.8 + Math.random()*0.6);
    const low  = open.map((v,i)=> Math.min(v, close[i]) - 0.8 - Math.random()*0.6);
    plot(refs.candlestick.current, {
      data: [{ type: "candlestick", x: days, open, high, low, close }],
      layout: {
        ...AX("Day", "Stage (ft)"),
        title: "Daily Stage Range (ft)",
        height: 320
      }
    });

    // 9) Tile heatmap (rainfall intensity)
    const xh = linspace(0, 24, 25), yh = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const z = yh.map(()=> xh.map(()=> Math.max(0, randn(1, 0.25, 0.35)[0])));
    plot(refs.heatmapTiles.current, {
      data: [{ z, x: xh, y: yh, type: "heatmap", colorscale: "Blues" }],
      layout: {
        ...AX("Hour", "Day of Week"),
        title: "Rainfall Intensity (in/hr) – Tile Heatmap",
        height: 320
      }
    });

    // 10) Subplots (2×1)
    const gX = linspace(0, 10, 200);
    const s1 = gX.map(x=> Math.sin(x));
    const s2 = gX.map(x=> Math.cos(x));
    plot(refs.subplots.current, {
      data: [
        { x: gX, y: s1, type: "scatter", mode: "lines", xaxis: "x1", yaxis: "y1", name: "sin" },
        { x: gX, y: s2, type: "scatter", mode: "lines", xaxis: "x2", yaxis: "y2", name: "cos" }
      ],
      layout: {
        grid: { rows: 2, columns: 1, pattern: "independent" },
        xaxis:  { title: { text: "X (radians)" }, automargin: true },
        yaxis:  { title: { text: "sin(x)" },      automargin: true },
        xaxis2: { title: { text: "X (radians)" }, automargin: true },
        yaxis2: { title: { text: "cos(x)" },      automargin: true },
        margin: { l: 64, r: 16, b: 56, t: 42 },
        title: "Subplots (2×1)",
        height: 320
      }
    });

    // 11) Inset plot
    const mainX = linspace(0, 72, 289);
    const mainY = mainX.map(x=> 1000 + 600*Math.exp(-Math.pow((x-36)/10, 2)) + randn(1,0,25)[0]);
    const insetX = linspace(30, 42, 60);
    const insetY = insetX.map(x=> 1000 + 600*Math.exp(-Math.pow((x-36)/10, 2)));
    plot(refs.inset.current, {
      data: [
        { x: mainX, y: mainY, type: "scatter", mode: "lines", name: "Observed" },
        { x: insetX, y: insetY, type: "scatter", mode: "lines", name: "Model", xaxis: "x2", yaxis: "y2" }
      ],
      layout: {
        ...AX("Hour", "Discharge (cfs)"),
        xaxis2: { domain: [0.62, 0.98], anchor: "y2", title: { text: "Hour (Inset)" } },
        yaxis2: { domain: [0.55, 0.95], anchor: "x2", title: { text: "Discharge (cfs)" } },
        showlegend: true,
        title: "Hydrograph with Inset",
        height: 420
      }
    });

    // 12) Contour plot (e.g., stage as a function of X/Y)
    {
      const x = linspace(-5, 5, 80);
      const y = linspace(-5, 5, 80);
      const z = y.map((yv) =>
        x.map((xv) => 10*Math.exp(-((xv*xv + yv*yv)/10)) + 0.5*xv - 0.3*yv)
      );
      plot(refs.contour.current, {
        data: [{
          x, y, z, type: "contour",
          contours: { coloring: "heatmap" },
          colorbar: { title: "Stage (ft)" }
        }],
        layout: {
          ...AX("X", "Y"),
          title: "Contour Plot (Stage Surface)",
          height: 320
        }
      });
    }

    // 13) 3D Ribbon (surface built from multiple profiles)
    {
      const xs = linspace(0, 24, 60);
      const scenarios = 20;
      const z = [];
      for (let i=0;i<scenarios;i++) {
        const phase = (i / scenarios) * Math.PI;
        z.push(xs.map(x => 900 + 250*Math.sin((Math.PI/12)*x + phase) + randn(1,0,15)[0]));
      }
      plot(refs.ribbon3d.current, {
        data: [{
          type: "surface",
          x: xs, // time
          y: linspace(1, scenarios, scenarios),
          z: z,
          showscale: true,
          colorbar: { title: "cfs" }
        }],
        layout: {
          title: "3D Ribbon Surface (Ensemble Hydrographs)",
          scene: {
            xaxis: { title: "Hour" },
            yaxis: { title: "Scenario" },
            zaxis: { title: "Discharge (cfs)" }
          },
          margin: { l: 0, r: 0, b: 0, t: 40 },
          height: 420
        }
      });
    }

    // 14) Time series with range slider
    {
      const time = linspace(0, 365, 365);
      const series = time.map(d => 1500 + 500*Math.sin(2*Math.PI*d/365) + randn(1,0,80)[0]);
      plot(refs.rangeSlider.current, {
        data: [{
          x: time.map(d => new Date(2024, 0, 1 + d)),
          y: series,
          type: "scatter",
          mode: "lines",
          name: "Daily Flow"
        }],
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
                { step: "all" }
              ]
            }
          },
          title: "Time Series with Range Slider",
          height: 320
        }
      });
    }

    // 15) USGS Tile Map Layer with gage points
    {
      const lats = [ 21.36,  21.317,  21.34,  21.35];
      const lons = [-157.88, -157.858, -157.89, -157.91];
      const names = ["Gage A", "Gage B", "Gage C", "Gage D"];

      plot(refs.tileMapLayer.current, {
        data: [{
          type: "scattermapbox",
          lat: lats,
          lon: lons,
          mode: "markers+text",
          marker: { size: 10 },
          text: names,
          textposition: "top right",
          name: "Sites"
        }],
        layout: {
          title: "USGS Tile Map Layer (Sites)",
          mapbox: {
            style: "open-street-map",
            center: { lat: 21.34, lon: -157.89 },
            zoom: 11,
            layers: [
              {
                sourcetype: "raster",
                source: [
                  "https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}"
                ],
                below: "traces"
              }
            ]
          },
          margin: { l: 0, r: 0, t: 40, b: 0 },
          height: 360
        },
        config: { displayModeBar: true, responsive: true }
      });
    }

    // 16) Tile Density Heat Map (flow-related events)
    {
      const center = { lat: 21.34, lon: -157.89 };
      const N = 400;
      const lat = [], lon = [], mag = [];
      for (let i=0;i<N;i++) {
        const r = Math.abs(randn(1,0,0.02)[0]);
        const theta = Math.random()*2*Math.PI;
        lat.push(center.lat + r*Math.cos(theta));
        lon.push(center.lon + r*Math.sin(theta));
        mag.push(1000 + Math.abs(randn(1,0,700)[0]));
      }

      plot(refs.tileDensity.current, {
        data: [{
          type: "densitymapbox",
          lat, lon,
          z: mag,
          radius: 25,
          name: "Flow Events"
        }],
        layout: {
          title: "Tile Density Heat Map (High-Flow Event Density)",
          mapbox: {
            style: "open-street-map",
            center: center,
            zoom: 10.8
          },
          margin: { l: 0, r: 0, t: 40, b: 0 },
          height: 360
        },
        config: { displayModeBar: true, responsive: true }
      });
    }
  }, []);

  return (
    <Container size="xl" px="md" py="md">
      {/* sticky header */}
      <Box
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: "var(--mantine-color-body)",
        }}
      >
        <Group justify="space-between" py="xs">
          <Title order={4} m={0}>Plotly Demo Gallery</Title>
          <Button size="xs" onClick={exportGalleryPNG}>
            Export gallery as PNG
          </Button>
        </Group>
        <Divider />
      </Box>

      <Stack gap="lg" mt="md">
        <Grid gutter="lg">
          <GridCol span={12}>
            <Text ta="center" fw={600}>Hydrograph with Error Bars</Text>
            <div ref={refs.lineErr} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Flow with Three Confidence Ribbons</Text>
            <div ref={refs.ribbon} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Histogram of Annual Peak Flows</Text>
            <div ref={refs.hist} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Bar with CI</Text>
            <div ref={refs.barErr} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Frequency Curve (Log–Log)</Text>
            <div ref={refs.scatterLog} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>2D Density</Text>
            <div ref={refs.heat2d} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Seasonal Flow Distributions (Box)</Text>
            <div ref={refs.boxOnly} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Seasonal Flow Distributions (Violin)</Text>
            <div ref={refs.boxViolin} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Daily Stage Range (ft)</Text>
            <div ref={refs.candlestick} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Rainfall Intensity (Tile Heatmap)</Text>
            <div ref={refs.heatmapTiles} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Subplots (2×1)</Text>
            <div ref={refs.subplots} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Hydrograph with Inset</Text>
            <div ref={refs.inset} style={{ height: 500 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Contour Plot (Stage Surface)</Text>
            <div ref={refs.contour} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>3D Ribbon Surface (Ensemble Hydrographs)</Text>
            <div ref={refs.ribbon3d} style={{ height: 500 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Time Series with Range Slider</Text>
            <div ref={refs.rangeSlider} style={{ height: 420 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>USGS Tile Map Layer (Sites)</Text>
            <div ref={refs.tileMapLayer} style={{ height: 500 }} />
          </GridCol>

          <GridCol span={12}>
            <Text ta="center" fw={600}>Tile Density Heat Map</Text>
            <div ref={refs.tileDensity} style={{ height: 500 }} />
          </GridCol>
        </Grid>
      </Stack>
    </Container>
  );
}
