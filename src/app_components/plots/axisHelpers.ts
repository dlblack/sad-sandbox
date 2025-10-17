export type AnalysisShape = {
    name?: string;
    typeFolder?: string;        // e.g., "Peak Flow Frequency"
    frequencies?: string[];     // optional, preferred order
    filepath?: string;
    pathname?: string[];
};

export function getCPart(path: string): string {
    const parts = path.split("/");
    return parts.length >= 4 ? parts[3].toUpperCase() : "";
}

export function isFlowFrequency(analysis?: AnalysisShape, paths?: string[]): boolean {
    if (analysis && typeof analysis.typeFolder === "string") {
        const t = analysis.typeFolder.trim().toLowerCase();
        if (t.includes("peak") && t.includes("flow") && t.includes("frequency")) return true;
    }
    const arr = paths || analysis?.pathname || [];
    return arr.some((p) => getCPart(p) === "FLOW-FREQ");
}

// ---- Add/keep this ----
export function prettyProbLabel(p: number): string {
    // snap near common frequencies to exact labels
    const targets = [1, 0.99, 0.9, 0.5, 0.1, 0.01, 0.001];
    const tol = 1e-6;
    for (const t of targets) if (Math.abs(p - t) <= tol) return String(t);

    // otherwise format compactly without trailing junk
    if (p >= 0.1) return Number(p.toFixed(2)).toString();
    if (p >= 0.01) return Number(p.toFixed(3)).toString();
    return Number(p.toPrecision(3)).toString();
}

/** Build category x-axis for paired-data frequency plots */
export function buildPairedCategoryXAxis(labels: string[], reverse = false) {
    const arr = reverse ? [...labels].reverse() : labels.slice();
    return {
        type: "category" as const,
        categoryorder: "array" as const,
        categoryarray: arr,
        // REMOVE autorange: "reversed" — it fights categoryarray on category axes
        title: { text: "Exceedance Probability" },
        ticklabelposition: "outside" as const,
        showgrid: true,
        gridcolor: "rgba(0,0,0,0.15)",
        zeroline: false,
    };
}
