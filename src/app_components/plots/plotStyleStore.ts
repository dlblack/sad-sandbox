import type { PlotStyleDefaults } from "./plotStyleTypes";

const LS_KEY = "plotStyleOverridesV1";

/** ---- minimal, always-present base so UI/plots can start instantly ---- */
const BASE_DEFAULTS: PlotStyleDefaults = {
    rules: [
        { match: { kind: "time_series",     parameter: "FLOW" }, style: { drawLine: true,  drawPoints: false, lineWidth: 2, lineDash: "solid" } },
        { match: { kind: "paired_xy",       parameter: "FLOW" }, style: { drawLine: true,  drawPoints: false, lineWidth: 2, lineDash: "solid" } },
        { match: { kind: "frequency_curve", parameter: "FLOW" }, style: { drawLine: true,  drawPoints: false, lineWidth: 2, lineDash: "solid" } }
    ]
};

/** ---- runtime merged cache + subscribers ---- */
let mergedDefaultsCache: PlotStyleDefaults | null = null;
const subs = new Set<() => void>();

function notify() {
    for (const fn of subs) {
        try { fn(); } catch {}
    }
}
export function mergeDefaults(base: PlotStyleDefaults, user: PlotStyleDefaults): PlotStyleDefaults {
    const baseRules = Array.isArray(base.rules) ? base.rules : [];
    const userRules = Array.isArray(user.rules) ? user.rules : [];
    return { rules: baseRules.concat(userRules) };
}

export function getMergedDefaultsSync(): PlotStyleDefaults | null {
    return mergedDefaultsCache;
}

export function setMergedDefaults(d: PlotStyleDefaults) {
    mergedDefaultsCache = d;
    notify();
}

/** ---- load/save user overrides ---- */
export async function loadUserOverrides(): Promise<PlotStyleDefaults> {
    try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : null;
        if (!raw) return { rules: [] };
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.rules)) return parsed as PlotStyleDefaults;
        return { rules: [] };
    } catch {
        return { rules: [] };
    }
}

export async function saveUserOverrides(d: PlotStyleDefaults): Promise<void> {
    try {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(LS_KEY, JSON.stringify(d));
            // keep cache coherent immediately
            if (mergedDefaultsCache) {
                setMergedDefaults(mergeDefaults(BASE_DEFAULTS, d));
            }
        }
    } catch {
        // ignore
    }
}

/** ---- base defaults (if you later fetch a file, swap this impl) ---- */
export async function loadBaseDefaults(): Promise<PlotStyleDefaults> {
    return BASE_DEFAULTS;
}

/** ---- auto-init on module load ---- */
async function init() {
    try {
        const user = await loadUserOverrides();
        setMergedDefaults(mergeDefaults(BASE_DEFAULTS, user));
    } catch {
        setMergedDefaults(BASE_DEFAULTS);
    }
}
void init();

/** ---- keep in sync if another tab updates localStorage ---- */
if (typeof window !== "undefined") {
    window.addEventListener("storage", async (ev) => {
        if (ev.key === LS_KEY) {
            const user = await loadUserOverrides();
            setMergedDefaults(mergeDefaults(BASE_DEFAULTS, user));
        }
    });
}
