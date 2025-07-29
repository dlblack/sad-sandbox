// src/app_components/data/manual_data_entry_editor/TableSectionStep.jsx
import React, {useMemo} from "react";
import {generateDateTimeRows} from "@/utils/timeUtils.js";

/**
 * TableSectionStep
 * If all start/end/interval are present, auto-fill left column.
 * If not, let user enter dates manually.
 */
function TableSectionStep({
                            dataRows,
                            handleRowChange,
                            handleValueChange,
                            startDate,
                            startTime,
                            endDate,
                            endTime,
                            intervalOpt
                          }) {
  // Compute auto dates (only if all fields are present)
  const autoDateTimes = useMemo(() => {
    if (
      startDate && startTime &&
      endDate && endTime &&
      intervalOpt
    ) {
      return generateDateTimeRows(startDate, startTime, endDate, endTime, intervalOpt);
    }
    return [];
  }, [startDate, startTime, endDate, endTime, intervalOpt]);

  // Build the rows: fill from autoDateTimes if available
  const rows = autoDateTimes.length
    ? autoDateTimes.map((dt, i) => ({
      dateTime: dt,
      value: (dataRows[i] && dataRows[i].value) || ""
    }))
    : dataRows;

  return (
    <div className="manual-entry-table-panel">
      <table className="manual-entry-table table table-sm table-striped compact-table">
        <thead>
        <tr>
          <th className="manual-entry-th">Date Time</th>
          <th className="manual-entry-th">Value</th>
        </tr>
        </thead>
        <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            <td>
              <input
                type="text"
                className="manual-entry-input form-control font-xs"
                value={row.dateTime}
                onChange={e => handleRowChange(idx, "dateTime", e.target.value)}
                pattern="\d{2}[A-Za-z]{3}\d{4} \d{2}:\d{2}"
                autoComplete="off"
                tabIndex={-1}
                readOnly={!!autoDateTimes.length} // Auto mode: always readOnly
              />
            </td>
            <td>
              <input
                type="number"
                inputMode="decimal"
                className="manual-entry-input form-control font-xs"
                value={row.value}
                onChange={e => handleValueChange(idx, e.target.value)}
                style={{MozAppearance: "textfield"}}
              />
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableSectionStep;
