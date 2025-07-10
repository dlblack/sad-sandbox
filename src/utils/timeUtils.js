/**
 * Normalizes time input: accepts 8, 08, 830, 0830, 8:30, etc., returns hh:mm.
 */
export function normalizeTimeInput(value) {
  if (/^\d{1,2}:\d{2}$/.test(value)) return value;
  if (/^\d{4}$/.test(value)) return value.slice(0,2) + ":" + value.slice(2);
  if (/^\d{3}$/.test(value)) return "0" + value[0] + ":" + value.slice(1);
  if (/^\d{2}$/.test(value)) return value + ":00";
  if (/^\d{1}$/.test(value)) return "0" + value + ":00";
  if (value.trim() === "") return "";
  return value;
}
