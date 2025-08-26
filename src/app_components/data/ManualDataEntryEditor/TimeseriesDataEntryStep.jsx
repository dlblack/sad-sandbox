import React, {useMemo} from "react";
import TableSectionStep from "./TableSectionStep";
import {INTERVAL_OPTIONS} from "../../editor_components/combo_boxes/DataIntervalComboBox";
import {generateDateTimeRows} from "../../../utils/timeUtils.js";
import { TextStore } from "../../../utils/TextStore";

function updateDataRowsWithValues(autoDateTimes, dataRows) {
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

  const intervalOpt = INTERVAL_OPTIONS.find(opt => opt.value === dataInterval);

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

  React.useEffect(() => {
    if (autoDateTimes.length > 0) {
      setDataRows(rows => updateDataRowsWithValues(autoDateTimes, rows));
    }
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
    if (/^-?\d*\.?\d*$/.test(value)) {
      handleRowChange(idx, "value", value);
    }
  }

  return (
    <div>
      <h5>Step 3: Enter Timeseries Data</h5>
      <div className="mb-2 font-xs text-muted">
        {autoDateTimes.length
          ? TextStore.interface("ManualDataEntryEditor_DateTimeAutoFilled")
          : TextStore.interface("ManualDataEntryEditor_DateTimeManual")}
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
