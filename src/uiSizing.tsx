import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  PropsWithChildren,
} from "react";

const KEY = "uiSizing.v2";

// Detect Electron without augmenting Window
function isElectronRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { process?: any };
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  return Boolean(w?.process?.versions?.electron) || /Electron/i.test(ua);
}

// Baselines: Browser and Electron baselines do not align
const WEB_BASELINE = 0.8;
const ELECTRON_BASELINE = 1.5;

// Scale and density limits
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.5;
const MIN_DENSITY = 0.8;
const MAX_DENSITY = 1.3;

type UISizingContextValue = {
  // current values
  scale: number; // 1.00 shows as "100%" in the UI
  density: number;
  effectiveScale: number;

  // controls
  setScale: (v: number) => void;
  setDensity: (v: number) => void;
  setScalePercent: (percent: number) => void;
  bumpScale: (deltaPercent: number) => void;
  reset: () => void;
};

const Ctx = createContext<UISizingContextValue | null>(null);

export function UISizingProvider({ children }: PropsWithChildren<{}>) {
  const isElectron = isElectronRuntime();

  const [scale, setScale] = useState<number>(() => {
    try {
      if (typeof window === "undefined") return 1;
      const raw = window.localStorage.getItem(KEY);
      const saved = raw ? JSON.parse(raw) : undefined;
      return Number.isFinite(saved?.scale)
          ? clamp(saved.scale as number, MIN_SCALE, MAX_SCALE)
          : 1;
    } catch {
      return 1;
    }
  });

  const [density, setDensity] = useState<number>(() => {
    try {
      if (typeof window === "undefined") return 1;
      const raw = window.localStorage.getItem(KEY);
      const saved = raw ? JSON.parse(raw) : undefined;
      return Number.isFinite(saved?.density)
          ? clamp(saved.density as number, MIN_DENSITY, MAX_DENSITY)
          : 1;
    } catch {
      return 1;
    }
  });

  useEffect(() => {
    const runtimeBaseline = isElectron ? ELECTRON_BASELINE : WEB_BASELINE;
    const effectiveScale = scale * runtimeBaseline;

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--ui-scale", String(effectiveScale));
      root.style.setProperty("--ui-density", String(density));
    }

    // persist raw values (unmultiplied)
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ scale, density }));
      } catch {
        // ignore write failures (e.g., private mode)
      }
    }
  }, [scale, density, isElectron]);

  const value = useMemo<UISizingContextValue>(
      () => ({
        // current values
        scale, // 1.00 shows as "100%" in the UI
        density,
        effectiveScale: scale * (isElectron ? ELECTRON_BASELINE : WEB_BASELINE),

        // controls
        setScale: (v: number) => setScale(clamp(v, MIN_SCALE, MAX_SCALE)),
        setDensity: (v: number) => setDensity(clamp(v, MIN_DENSITY, MAX_DENSITY)),
        setScalePercent: (p: number) =>
            setScale(clamp(p / 100, MIN_SCALE, MAX_SCALE)),
        bumpScale: (deltaPercent: number) =>
            setScale((s) => {
              const nextPct = Math.round((s * 100 + deltaPercent) / 10) * 10;
              return clamp(nextPct / 100, MIN_SCALE, MAX_SCALE);
            }),
        reset: () => {
          setScale(1);
          setDensity(1);
        },
      }),
      [scale, density, isElectron]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUISizing(): UISizingContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUISizing must be used within UISizingProvider");
  return ctx;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
