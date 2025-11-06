import type { RecentProject } from "../api/recentProjects";

export const isNeptuneFile = (name: string) => /\.neptune$/i.test(name || "");

export function validateProjectMeta(meta: any): meta is RecentProject {
    return !!meta
        && typeof meta.projectName === "string"
        && typeof meta.directory === "string"
        && meta.projectName.trim().length > 0
        && meta.directory.trim().length > 0;
}

export type ParseResult =
    | { ok: true; meta: RecentProject }
    | { ok: false; code: "NEPTUNE_REQUIRED" | "INVALID_FORMAT" | "MISSING_FIELDS" };

export function tryParseProjectFile(name: string, raw: string): ParseResult {
    if (!isNeptuneFile(name)) {
        return { ok: false, code: "NEPTUNE_REQUIRED" };
    }
    let parsed: any;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return { ok: false, code: "INVALID_FORMAT" };
    }
    if (!validateProjectMeta(parsed)) {
        return { ok: false, code: "MISSING_FIELDS" };
    }
    return { ok: true, meta: parsed };
}

export type ParseErrorCode = Extract<ParseResult, { ok: false }>["code"];
