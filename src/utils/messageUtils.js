import { getText } from "./TextStore";

function formatTimestamp(date = new Date()) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d)) return "";

  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();

  // Format time as H:MM:SS AM/PM
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const timeStr = `${hours}:${minutes}:${seconds} ${ampm}`;
  return `${day}${month}${year} ${timeStr}`;
}

export function makeMessage(id, args = [], type = "info", extra = {}) {
  const msg = getText(id, args);
  const timestamp = formatTimestamp();
  return {
    text: `${timestamp}: ${msg}`,
    type,
    ...extra,
  };
}
