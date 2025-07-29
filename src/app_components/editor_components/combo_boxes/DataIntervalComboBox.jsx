import React from "react";

const INTERVAL_OPTIONS = [
  {value: "IRDay", label: "IR-Day", amount: 1, unit: "day"},
  {value: "IRMonth", label: "IR-Month", amount: 1, unit: "month"},
  {value: "IRYear", label: "IR-Year", amount: 1, unit: "year"},
  {value: "IRDecade", label: "IR-Decade", amount: 10, unit: "year"},
  {value: "IRCentury", label: "IR-Century", amount: 100, unit: "year"},
  {value: "1MIN", label: "1 Minute", amount: 1, unit: "minute"},
  {value: "2MIN", label: "2 Minute", amount: 2, unit: "minute"},
  {value: "3MIN", label: "3 Minute", amount: 3, unit: "minute"},
  {value: "4MIN", label: "4 Minute", amount: 4, unit: "minute"},
  {value: "5MIN", label: "5 Minute", amount: 5, unit: "minute"},
  {value: "6MIN", label: "6 Minute", amount: 6, unit: "minute"},
  {value: "10MIN", label: "10 Minute", amount: 10, unit: "minute"},
  {value: "12MIN", label: "12 Minute", amount: 12, unit: "minute"},
  {value: "15MIN", label: "15 Minutes", amount: 15, unit: "minute"},
  {value: "20MIN", label: "20 Minute", amount: 20, unit: "minute"},
  {value: "30MIN", label: "30 Minutes", amount: 30, unit: "minute"},
  {value: "1HOUR", label: "1 Hour", amount: 1, unit: "hour"},
  {value: "2HOUR", label: "2 Hours", amount: 2, unit: "hour"},
  {value: "3HOUR", label: "3 Hours", amount: 3, unit: "hour"},
  {value: "4HOUR", label: "4 Hours", amount: 4, unit: "hour"},
  {value: "6HOUR", label: "6 Hours", amount: 6, unit: "hour"},
  {value: "8HOUR", label: "8 Hours", amount: 8, unit: "hour"},
  {value: "12HOUR", label: "12 Hours", amount: 12, unit: "hour"},
  {value: "1DAY", label: "1 Day", amount: 1, unit: "day"},
  {value: "1WK", label: "1 Week", amount: 1, unit: "week"},
  {value: "1MON", label: "1 Month", amount: 1, unit: "month"},
  {value: "1YEAR", label: "1 Year", amount: 1, unit: "year"},
  {value: "TriMonth", label: "Tri-Month", amount: 3, unit: "month"},
  {value: "SemiMonth", label: "Semi-Month", amount: 0.5, unit: "month"}
];

export {INTERVAL_OPTIONS};
export default function DataIntervalComboBox({value, onChange, ...props}) {
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
