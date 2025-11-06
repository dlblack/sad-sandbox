export const ALERT_TEXT = {
    // --------------------------------------
    // HomePage
    // --------------------------------------
    HomePage_NeptuneFileRequired: "Please select a .neptune project file.",
    HomePage_InvalidFormat: "Invalid project file format.",
    HomePage_MissingFields: "Project file missing required fields.",
    HomePage_FileSystemAccessError: "File System Access API not supported in this browser.",

} as const;

export type AlertKey = keyof typeof ALERT_TEXT;

/** Replace {0}, {1}, ... with provided args */
export function getAlertText(key: AlertKey | string, args: unknown[] = []): string {
    const raw = (ALERT_TEXT as Record<string, string>)[key] ?? key;
    const arr = Array.isArray(args) ? args : (args == null ? [] : [args]);

    let out = raw;
    arr.forEach((arg, i) => {
        out = out.replace(new RegExp(`\\{${i}\\}`, "g"), String(arg ?? ""));
    });
    return out;
}
