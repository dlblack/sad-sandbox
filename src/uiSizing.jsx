import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "uiSizing.v2";

// Detect Electron
const isElectron =
  typeof window !== "undefined" &&
  (
    (window.process && window.process.versions && window.process.versions.electron) ||
    (navigator && /Electron/i.test(navigator.userAgent || ""))
  );

// Baselines: Browser and Electron baselines do not align
const WEB_BASELINE = 0.8;
const ELECTRON_BASELINE = 1.5;

// Scale and density limits
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.5;
const MIN_DENSITY = 0.8;
const MAX_DENSITY = 1.3;

const Ctx = createContext(null);

export function UISizingProvider({ children }) {
  const [scale, setScale] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return isFinite(saved?.scale) ? clamp(saved.scale, MIN_SCALE, MAX_SCALE) : 1;
    } catch {
      return 1;
    }
  });

  const [density, setDensity] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return isFinite(saved?.density) ? clamp(saved.density, MIN_DENSITY, MAX_DENSITY) : 1;
    } catch {
      return 1;
    }
  });

  useEffect(() => {
    const runtimeBaseline = isElectron ? ELECTRON_BASELINE : WEB_BASELINE;
    const effectiveScale = scale * runtimeBaseline;

    const root = document.documentElement;
    root.style.setProperty("--ui-scale", String(effectiveScale));
    root.style.setProperty("--ui-density", String(density));

    // persist raw values (unmultiplied)
    localStorage.setItem(KEY, JSON.stringify({ scale, density }));
  }, [scale, density]);

  const value = useMemo(() => ({
    // current values
    scale,                  // 1.00 shows as "100%" in the UI
    density,
    effectiveScale: scale * (isElectron ? ELECTRON_BASELINE : WEB_BASELINE),

    // controls
    setScale: (v) => setScale(clamp(v, MIN_SCALE, MAX_SCALE)),
    setDensity: (v) => setDensity(clamp(v, MIN_DENSITY, MAX_DENSITY)),
    setScalePercent: (p) => setScale(clamp(p / 100, MIN_SCALE, MAX_SCALE)),
    bumpScale: (deltaPercent) => setScale((s) => {
      const nextPct = Math.round((s * 100 + deltaPercent) / 10) * 10;
      return clamp(nextPct / 100, MIN_SCALE, MAX_SCALE);
    }),
    reset: () => { setScale(1); setDensity(1); },
  }), [scale, density]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUISizing() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUISizing must be used within UISizingProvider");
  return ctx;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
