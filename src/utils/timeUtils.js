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

/**
 * Converts a Date to HEC Julian day.
 */
export function toJulianDay(date) {
    const msPerDay = 86400000;
    const HEC_EPOCH = Date.UTC(1899, 11, 31, 0, 0);
    return (date.getTime() - HEC_EPOCH) / msPerDay;
}

/**
 * Format a JS Date as 01Jan2000 08:00
 */
export function formatDateTime(dt) {
    if (!(dt instanceof Date)) return "";
    const pad = (n) => n.toString().padStart(2, "0");
    const day = pad(dt.getDate());
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = months[dt.getMonth()];
    const year = dt.getFullYear();
    const hour = pad(dt.getHours());
    const min = pad(dt.getMinutes());
    return `${day}${month}${year} ${hour}:${min}`;
}

/**
 * Parse date/time input ("01Jan2000", "08:00") into JS Date.
 */
export function parseDateTime(dateStr, timeStr) {
    try {
        if (!dateStr || !timeStr) return null;
        const dateWithSpaces =
            dateStr.length === 9
                ? `${dateStr.slice(0, 2)} ${dateStr.slice(2, 5)} ${dateStr.slice(5)}`
                : dateStr;
        const dtStr = `${dateWithSpaces} ${timeStr}`;
        return new Date(dtStr);
    } catch {
        return null;
    }
}

/**
 * Add an interval to a date, using DataIntervalComboBox option
 */
export function addInterval(dt, amount, unit) {
    const newDt = new Date(dt);
    if (unit === "minute") newDt.setMinutes(newDt.getMinutes() + amount);
    else if (unit === "hour") newDt.setHours(newDt.getHours() + amount);
    else if (unit === "day") newDt.setDate(newDt.getDate() + amount);
    else if (unit === "week") newDt.setDate(newDt.getDate() + 7 * amount);
    else if (unit === "month") newDt.setMonth(newDt.getMonth() + amount);
    else if (unit === "year") newDt.setFullYear(newDt.getFullYear() + amount);
    return newDt;
}

export function isAfter(a, b) {
    return a.getTime() > b.getTime();
}

/**
 * Generate array of dateTime strings from start to end, given interval option
 * - intervalOpt: { value, label, amount, unit }
 */
export function generateDateTimeRows(startDate, startTime, endDate, endTime, intervalOpt) {
    const startDt = parseDateTime(startDate, startTime);
    const endDt = parseDateTime(endDate, endTime);
    if (!startDt || !endDt || !intervalOpt) return [];
    const rowTimes = [];
    let current = new Date(startDt);
    while (!isAfter(current, endDt) && rowTimes.length < 1000) {
        rowTimes.push(formatDateTime(current));
        current = addInterval(current, intervalOpt.amount, intervalOpt.unit);
    }
    return rowTimes;
}
