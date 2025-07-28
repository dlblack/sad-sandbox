export function getParamCategory(parameter) {
  if (!parameter) return "unknown";
  const key = parameter.trim().toLowerCase();
  if (key === "flow") return "Discharge";
  if (key === "discharge") return "Discharge";
  if (key === "snow water equivalent") return "SWE";
  if (key === "swe") return "SWE";
  return parameter;
}