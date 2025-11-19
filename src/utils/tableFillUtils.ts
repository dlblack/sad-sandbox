export type TableFillMode =
    | "linear"
    | "repeat"
    | "repeatToEnd"
    | "addConstant"
    | "multiplyConstant";

export interface TableFillRequest {
    mode: TableFillMode;
    constant?: number;
}

/**
 * Apply a fill operation to an array of string/number values.
 * Returns a new array; does not mutate the input.
 *
 * `selected` is assumed to be a sorted list of row indices, but the
 * function will sort it defensively.
 */
export function applyTableFill(
    values: Array<string | number>,
    selected: number[],
    req: TableFillRequest
): string[] {
    if (!values.length || !selected.length) return values.map(v => String(v));

    const out = values.map((v) => v);
    const indices = Array.from(new Set(selected)).sort((a, b) => a - b);

    switch (req.mode) {
        case "linear":
            applyLinearFill(out, indices);
            break;
        case "repeat":
            applyRepeatFill(out, indices);
            break;
        case "repeatToEnd":
            applyRepeatToEndFill(out, indices);
            break;
        case "addConstant":
            if (typeof req.constant === "number") {
                applyAddConstant(out, indices, req.constant);
            }
            break;
        case "multiplyConstant":
            if (typeof req.constant === "number") {
                applyMultiplyConstant(out, indices, req.constant);
            }
            break;
    }

    return out.map((v) => (typeof v === "number" ? String(v) : v));
}

function toNumber(v: string | number): number | null {
    if (typeof v === "number") {
        if (Number.isFinite(v)) return v;
        return null;
    }
    const n = parseFloat(v);
    if (!Number.isFinite(n)) return null;
    return n;
}

/** Linear interpolation between first and last selected rows. */
function applyLinearFill(
    out: Array<string | number>,
    indices: number[]
): void {
    if (indices.length < 2) return;

    const first = indices[0];
    const last = indices[indices.length - 1];

    const startVal = toNumber(out[first]);
    const endVal = toNumber(out[last]);
    if (startVal === null || endVal === null) return;

    const span = last - first;
    if (!span) return;

    for (let i = first + 1; i < last; i++) {
        const t = (i - first) / span;
        out[i] = startVal + (endVal - startVal) * t;
    }
}

/** Repeat the first selected value into all selected rows. */
function applyRepeatFill(
    out: Array<string | number>,
    indices: number[]
): void {
    const first = indices[0];
    const base = toNumber(out[first]);
    if (base === null) return;

    for (let i = 1; i < indices.length; i++) {
        const index = indices[i];
        out[index] = base;
    }
}

/** Repeat the first selected value from its row to the end of the table. */
function applyRepeatToEndFill(
    out: Array<string | number>,
    indices: number[]
): void {
    const first = indices[0];
    const base = toNumber(out[first]);
    if (base === null) return;

    for (let i = first + 1; i < out.length; i++) {
        out[i] = base;
    }
}

/** Add constant to selected rows. */
function applyAddConstant(
    out: Array<string | number>,
    indices: number[],
    constant: number
): void {
    indices.forEach((idx) => {
        const current = toNumber(out[idx]) ?? 0;
        out[idx] = current + constant;
    });
}

/** Multiply selected rows by constant. */
function applyMultiplyConstant(
    out: Array<string | number>,
    indices: number[],
    constant: number
): void {
    indices.forEach((idx) => {
        const current = toNumber(out[idx]) ?? 0;
        out[idx] = current * constant;
    });
}
