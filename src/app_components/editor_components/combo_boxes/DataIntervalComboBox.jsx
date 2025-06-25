import React from "react";

const INTERVAL_OPTIONS = [
  { value: "IRDay", label: "IR-Day", amount: 1, unit: "day" },
  { value: "IRMonth", label: "IR-Month", amount: 1, unit: "month" },
  { value: "IRYear", label: "IR-Year", amount: 1, unit: "year" },
  { value: "IRDecade", label: "IR-Decade", amount: 10, unit: "year" },
  { value: "IRCentury", label: "IR-Century", amount: 100, unit: "year" },
  { value: "1Min", label: "1 Minute", amount: 1, unit: "minute" },
  { value: "2Min", label: "2 Minute", amount: 2, unit: "minute" },
  { value: "3Min", label: "3 Minute", amount: 3, unit: "minute" },
  { value: "4Min", label: "4 Minute", amount: 4, unit: "minute" },
  { value: "5Min", label: "5 Minute", amount: 5, unit: "minute" },
  { value: "6Min", label: "6 Minute", amount: 6, unit: "minute" },
  { value: "10Min", label: "10 Minute", amount: 10, unit: "minute" },
  { value: "12Min", label: "12 Minute", amount: 12, unit: "minute" },
  { value: "15Min", label: "15 Minutes", amount: 15, unit: "minute" },
  { value: "20Min", label: "20 Minute", amount: 20, unit: "minute" },
  { value: "30Min", label: "30 Minutes", amount: 30, unit: "minute" },
  { value: "1Hr", label: "1 Hour", amount: 1, unit: "hour" },
  { value: "2Hr", label: "2 Hours", amount: 2, unit: "hour" },
  { value: "3Hr", label: "3 Hours", amount: 3, unit: "hour" },
  { value: "4Hr", label: "4 Hours", amount: 4, unit: "hour" },
  { value: "6Hr", label: "6 Hours", amount: 6, unit: "hour" },
  { value: "8Hr", label: "8 Hours", amount: 8, unit: "hour" },
  { value: "12Hr", label: "12 Hours", amount: 12, unit: "hour" },
  { value: "1Day", label: "1 Day", amount: 1, unit: "day" },
  { value: "1Wk", label: "1 Week", amount: 1, unit: "week" },
  { value: "1Month", label: "1 Month", amount: 1, unit: "month" },
  { value: "1Yr", label: "1 Year", amount: 1, unit: "year" },
  { value: "TriMonth", label: "Tri-Month", amount: 3, unit: "month" },
  { value: "SemiMonth", label: "Semi-Month", amount: 0.5, unit: "month" }
];

export { INTERVAL_OPTIONS };
export default function DataIntervalComboBox({ value, onChange, ...props }) {
  return (
    <select
      className="form-select font-xs"
      value={value}
      onChange={e => onChange(e.target.value)}
      {...props}
    >
      <option value="">Select Data Interval</option>
      {INTERVAL_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
