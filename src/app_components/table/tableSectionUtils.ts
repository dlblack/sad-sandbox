export function getSelectedIndices(
    startIdx: number | null,
    endIdx: number | null,
    rowCount: number
): number[] {
    if (startIdx == null || endIdx == null) return [];
    const from = Math.min(startIdx, endIdx);
    const to = Math.max(startIdx, endIdx);

    const result = [];
    for (let i = from; i <= to && i < rowCount; i++) {
        result.push(i);
    }
    return result;
}

export function isCellSelected(
    idx: number,
    startIdx: number | null,
    endIdx: number | null
): boolean {
    if (startIdx == null || endIdx == null) return false;
    return idx >= Math.min(startIdx, endIdx) && idx <= Math.max(startIdx, endIdx);
}

export function parseClipboard(text: string): string[] {
    return text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}
