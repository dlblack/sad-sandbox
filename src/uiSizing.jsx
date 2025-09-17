import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "uiSizing.v1";
const BASELINE = 1.25;        // 100% now renders at 125%
const MIN_SCALE = 0.6;
const MAX_SCALE = 2.0;
const MIN_DENSITY = 0.8;
const MAX_DENSITY = 1.3;

const Ctx = createContext(null);

export function UISizingProvider({ children }) {
  const [scale, setScale] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return isFinite(saved?.scale) ? clamp(saved.scale, MIN_SCALE, MAX_SCALE) : 1;
    } catch { return 1; }
  });

  const [density, setDensity] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return isFinite(saved?.density) ? clamp(saved.density, MIN_DENSITY, MAX_DENSITY) : 1;
    } catch { return 1; }
  });

  useEffect(() => {
    const effectiveScale = scale * BASELINE;

    const root = document.documentElement;
    root.style.setProperty("--ui-scale", String(effectiveScale));
    root.style.setProperty("--ui-density", String(density));

    // persist raw (un-multiplied) values
    localStorage.setItem(KEY, JSON.stringify({ scale, density }));

    // IMPORTANT: do NOT use mount.style.zoom; it causes the giant page scrollbars.
  }, [scale, density]);

  const value = useMemo(() => ({
    // values
    scale,                   // 1.00 shows as 100% in UI (renders 1.25x)
    density,
    effectiveScale: scale * BASELINE,

    // controls (used by ComponentInterfaceSize)
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

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
