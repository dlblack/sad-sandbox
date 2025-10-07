/** Map of known parameter aliases -> canonical category */
const PARAM_CATEGORY_MAP: Record<string, string> = {
  flow: "Discharge",
  discharge: "Discharge",
  "snow water equivalent": "SWE",
  swe: "SWE",
};

/**
 * Returns a canonical parameter category for a given parameter name.
 * Falls back to the original parameter string if no mapping exists.
 */
export function getParamCategory(parameter?: string): string {
  if (!parameter) return "unknown";
  const key = parameter.trim().toLowerCase();
  return PARAM_CATEGORY_MAP[key] ?? parameter;
}
