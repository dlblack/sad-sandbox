import React from "react";
import { TextStore } from "../../../utils/TextStore";

const INTERVAL_OPTIONS = [
  {value: "IRDay", labelKey: "DataInterval_IRDay", amount: 1, unit: "day"},
  {value: "IRMonth", labelKey: "DataInterval_IRMonth", amount: 1, unit: "month"},
  {value: "IRYear", labelKey: "DataInterval_IRYear", amount: 1, unit: "year"},
  {value: "IRDecade", labelKey: "DataInterval_IRDecade", amount: 10, unit: "year"},
  {value: "IRCentury",labelKey: "DataInterval_IRCentury", amount: 100, unit: "year"},
  {value: "1MIN", labelKey: "DataInterval_1MIN", amount: 1, unit: "minute"},
  {value: "2MIN", labelKey: "DataInterval_2MIN", amount: 2, unit: "minute"},
  {value: "3MIN", labelKey: "DataInterval_3MIN", amount: 3, unit: "minute"},
  {value: "4MIN", labelKey: "DataInterval_4MIN", amount: 4, unit: "minute"},
  {value: "5MIN", labelKey: "DataInterval_5MIN", amount: 5, unit: "minute"},
  {value: "6MIN", labelKey: "DataInterval_6MIN", amount: 6, unit: "minute"},
  {value: "10MIN", labelKey: "DataInterval_10MIN", amount: 10, unit: "minute"},
  {value: "12MIN", labelKey: "DataInterval_12MIN", amount: 12, unit: "minute"},
  {value: "15MIN", labelKey: "DataInterval_15MIN", amount: 15, unit: "minute"},
  {value: "20MIN", labelKey: "DataInterval_20MIN", amount: 20, unit: "minute"},
  {value: "30MIN", labelKey: "DataInterval_30MIN", amount: 30, unit: "minute"},
  {value: "1HOUR", labelKey: "DataInterval_1HOUR", amount: 1, unit: "hour"},
  {value: "2HOUR", labelKey: "DataInterval_2HOUR", amount: 2, unit: "hour"},
  {value: "3HOUR", labelKey: "DataInterval_3HOUR", amount: 3, unit: "hour"},
  {value: "4HOUR", labelKey: "DataInterval_4HOUR", amount: 4, unit: "hour"},
  {value: "6HOUR", labelKey: "DataInterval_6HOUR", amount: 6, unit: "hour"},
  {value: "8HOUR", labelKey: "DataInterval_8HOUR", amount: 8, unit: "hour"},
  {value: "12HOUR", labelKey: "DataInterval_12HOUR", amount: 12, unit: "hour"},
  {value: "1DAY", labelKey: "DataInterval_1DAY", amount: 1, unit: "day"},
  {value: "1WK", labelKey: "DataInterval_1WK", amount: 1, unit: "week"},
  {value: "1MON", labelKey: "DataInterval_1MON", amount: 1, unit: "month"},
  {value: "1YEAR", labelKey: "DataInterval_1YEAR", amount: 1, unit: "year"},
  {value: "TriMonth", labelKey: "DataInterval_TriMonth", amount: 3, unit: "month"},
  {value: "SemiMonth",labelKey: "DataInterval_SemiMonth", amount: 0.5, unit: "month"},
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
      <option value="">{TextStore.interface("DataInterval_Placeholder")}</option>
      {INTERVAL_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{TextStore.interface(opt.labelKey)}</option>
      ))}
    </select>
  );
}
