import { appendProjectDir, getJSON } from "./apiClient";
import type { UnitSystem } from "../units/types";

export type ProjectMetadata = {
  projectName?: string;
  directory?: string;
  unitSystem?: UnitSystem;
  [k: string]: unknown;
};

export async function fetchProjectMetadata(apiPrefix: string): Promise<ProjectMetadata> {
  const url = appendProjectDir(`${apiPrefix}/metadata`);
  return getJSON<ProjectMetadata>(url);
}

export function coerceUnitSystem(value: unknown, fallback: UnitSystem = "US"): UnitSystem {
  return value === "SI" || value === "US" ? value : fallback;
}
