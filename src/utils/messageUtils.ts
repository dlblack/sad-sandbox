import { TextStore } from "./TextStore";

/** Format: DDMonYYYY H:MM:SS AM/PM (local time) */
function formatTimestamp(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";

  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const timeStr = `${hours}:${minutes}:${seconds} ${ampm}`;
  return `${day}${month}${year} ${timeStr}`;
}

export type MessageVisualType =
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "text-body"
    | "text-body-secondary"
    | (string & {}); // allow custom class names

export interface UiLogMessage {
  /** Full rendered text including timestamp prefix. */
  text: string;
  /** Visual severity or css class hint. */
  type: MessageVisualType;
  /** Any extra shape you want to append. */
  [key: string]: any;
}

/**
 * Build a UI log message using MessageResources via TextStore.message().
 * Example:
 *   makeMessage(10001, ["Peak Flow", "Wizard"], "text-body")
 */
export function makeMessage(
    id: number | string,
    args: unknown[] = [],
    type: MessageVisualType = "info",
    extra: Record<string, any> = {}
): UiLogMessage {
  const msg = TextStore.message(id, args);
  const timestamp = formatTimestamp();
  return {
    text: `${timestamp}: ${msg}`,
    type,
    ...extra,
  };
}

export { formatTimestamp };
