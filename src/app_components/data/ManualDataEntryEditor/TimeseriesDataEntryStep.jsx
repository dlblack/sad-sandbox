import React, {useMemo} from "react";
import TableSectionStep from "./TableSectionStep";
import {INTERVAL_OPTIONS} from "../../editor_components/combo_boxes/DataIntervalComboBox";
import {generateDateTimeRows} from "@/utils/timeUtils.js";

// Utility: build rows for submission
function updateDataRowsWithValues(autoDateTimes, dataRows) {
  // If autoDateTimes is available, sync value fields from current dataRows
  return autoDateTimes.map((dt, i) => ({
    dateTime: dt,
    value: (dataRows[i] && dataRows[i].value) || ""
  }));
}

export default function TimeseriesDataEntryStep({
                                                  dataRows,
                                                  setDataRows,
                                                  startDate,
                                                  startTime,
                                                  endDate,
                                                  endTime,
                                                  dataInterval,
                                                }) {
  // Compute the intervalOpt from the dropdown value
  const intervalOpt = INTERVAL_OPTIONS.find(opt => opt.value === dataInterval);

  // Generate auto date times if all fields present
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

  // If in auto-fill mode, keep dataRows in sync with auto rows
  React.useEffect(() => {
    if (autoDateTimes.length > 0) {
      setDataRows(rows => updateDataRowsWithValues(autoDateTimes, rows));
    }
    // eslint-disable-next-line
  }, [autoDateTimes.join("|")]);

  // Handlers
  function handleRowChange(idx, field, value) {
    setDataRows(rows => {
      const updated = [...rows];
      if (!updated[idx]) updated[idx] = {dateTime: "", value: ""};
      updated[idx][field] = value;
      return updated;
    });
  }

  function handleValueChange(idx, value) {
    // Only allow numbers/empty
    if (/^-?\d*\.?\d*$/.test(value)) {
      handleRowChange(idx, "value", value);
    }
  }

  return (
    <div>
      <h5>Step 3: Enter Timeseries Data</h5>
      <div className="mb-2 font-xs text-muted">
        {autoDateTimes.length
          ? "Date/times auto-filled from interval and range. Enter or paste values for each date/time."
          : "Enter date/time and values manually."}
      </div>
      <TableSectionStep
        dataRows={dataRows}
        handleRowChange={handleRowChange}
        handleValueChange={handleValueChange}
        startDate={startDate}
        startTime={startTime}
        endDate={endDate}
        endTime={endTime}
        intervalOpt={intervalOpt}
      />
    </div>
  );
}
