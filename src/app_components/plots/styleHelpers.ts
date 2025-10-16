// src/app_components/plots/styleHelpers.ts

/** Pull the F-part (or last token) from a DSS pathname. */
export function seriesKeyFromPath(path: string): string {
    // Typical: /A/B/C/D/E/F/
    const m = String(path).trim().match(/\/([^/]+)\/?$/);
    return (m?.[1] || "").toUpperCase();
}

/** DemoPlot-consistent styles & labels for Peak Flow Frequency series. */
export function styleForPeakFlowFreq(path: string) {
    const key = seriesKeyFromPath(path);
    switch (key) {
        case "CL-05":
            return {
                trace: { mode: "lines" as const, line: { width: 2, dash: "dash", color: "rgb(220,50,47)" } },
                label: "5th Confidence Limit"
            };
        case "CL-95":
            return {
                trace: { mode: "lines" as const, line: { width: 2, dash: "dash", color: "rgb(220,50,47)" } },
                label: "95th Confidence Limit"
            };
        case "COMPUTED":
            return {
                trace: { mode: "lines" as const, line: { width: 3, color: "black" } },
                label: "Computed Curve"
            };
        case "SYSTEMATIC":
            return {
                trace: { mode: "markers" as const, marker: { size: 6, symbol: "diamond", color: "rgb(30,30,30)", opacity: 0.9 } },
                label: "Systematic Record"
            };
        default:
            return {
                trace: { mode: "lines" as const, line: { width: 2 } },
                label: key || path
            };
    }
}
