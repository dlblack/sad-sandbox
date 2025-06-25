import React, { useContext, useState } from "react";
import { StyleContext } from "../../styles/StyleContext";
import MetadataSection from "./MetadataSection";
import FieldsSection from "./FieldsSection";
import TableSection from "./TableSection";
import DetailsSection from "./DetailsSection";
import DataIntervalComboBox, { INTERVAL_OPTIONS } from "../editor_components/combo_boxes/DataIntervalComboBox";

// Utilities
function getSelectedIntervalOption(value) {
  return INTERVAL_OPTIONS.find(opt => opt.value === value);
}
function parseDateTime(dateStr, timeStr) {
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
function formatDateTime(dt) {
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
function addInterval(dt, amount, unit) {
  const newDt = new Date(dt);
  if (unit === "minute") newDt.setMinutes(newDt.getMinutes() + amount);
  else if (unit === "hour") newDt.setHours(newDt.getHours() + amount);
  else if (unit === "day") newDt.setDate(newDt.getDate() + amount);
  else if (unit === "week") newDt.setDate(newDt.getDate() + 7 * amount);
  else if (unit === "month") newDt.setMonth(newDt.getMonth() + amount);
  else if (unit === "year") newDt.setFullYear(newDt.getFullYear() + amount);
  return newDt;
}
function isAfter(a, b) {
  return a.getTime() > b.getTime();
}

function ManualDataEntryEditor(props) {
  const { style } = useContext(StyleContext);

  // ---- METADATA STATE (top panel) ----
  const [datasetName, setDatasetName] = useState("");
  const [description, setDescription] = useState("");
  const [studyDssFile, setStudyDssFile] = useState("");

  // ---- FIELD STATE (combo fields, middle panel) ----
  const [dataType, setDataType] = useState("");
  const [parameter, setParameter] = useState("");
  const [dataUnit, setDataUnit] = useState("");
  const [dataInterval, setDataInterval] = useState("");
  const [partA, setPartA] = useState("");
  const [partB, setPartB] = useState("");
  const [partF, setPartF] = useState("");
  const partC = parameter || "";
  const partD = "";
  const partE = dataInterval || "";
  const pathname = `/${partA}/${partB}/${partC}/${partD}/${partE}/${partF}/`;

  // ---- DATE/TIME/TYPE STATE (bottom panel) ----
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const startUnits = dataUnit || "";
  const [startType, setStartType] = useState("");

  // ---- DATA ROWS (table) ----
  const [dataRows, setDataRows] = useState([{ dateTime: '', value: '' }]);

  // ---- TABLE HANDLERS ----
  const handleRowChange = (idx, field, val) => {
    const newRows = dataRows.map((row, i) =>
      i === idx ? { ...row, [field]: val } : row
    );
    setDataRows(newRows);
    if (
      idx === dataRows.length - 1 &&
      newRows[idx].dateTime &&
      newRows[idx].value &&
      (newRows[idx].dateTime !== '' && newRows[idx].value !== '')
    ) {
      setDataRows([...newRows, { dateTime: '', value: '' }]);
    }
  };

  const handleValueChange = (idx, val) => {
    if (/^-?\d*\.?\d*$/.test(val)) {
      handleRowChange(idx, "value", val);
    }
  };

  // ---- DUPLICATE & VALIDATION LOGIC ----
  let paramCategory = (parameter || "unknown").trim();
  if (paramCategory.toLowerCase() === "flow") paramCategory = "Discharge";
  const existing = (props.data?.[paramCategory] || []);
  const nameIsDuplicate = existing.some(
    (d) => d.name?.trim().toLowerCase() === datasetName.trim().toLowerCase()
  );
  const saveDisabled =
    nameIsDuplicate ||
    !datasetName.trim() ||
    !studyDssFile.trim() ||
    !parameter.trim();

  // ---- SAVE HANDLER ----
  const handleSave = (e) => {
    e.preventDefault();
    if (props.onDataSave) {
      props.onDataSave(
        paramCategory,
        {
          name: datasetName,
          description,
          filepath: studyDssFile,
          pathname,
        },
        props.id
      );
    }
  };

  // ---- AUTO-POPULATE TABLE ----
  React.useEffect(() => {
    if (
      dataType === "TimeSeries" &&
      startDate && startTime &&
      endDate && endTime &&
      dataInterval
    ) {
      const intervalOpt = getSelectedIntervalOption(dataInterval);
      if (!intervalOpt) return;
      const startDt = parseDateTime(startDate, startTime);
      const endDt = parseDateTime(endDate, endTime);
      if (!startDt || !endDt || isAfter(startDt, endDt)) {
        setDataRows([{ dateTime: formatDateTime(startDt), value: '' }]);
        return;
      }
      const rowTimes = [];
      let current = new Date(startDt);
      while (!isAfter(current, endDt) && rowTimes.length < 1000) {
        rowTimes.push(formatDateTime(current));
        current = addInterval(current, intervalOpt.amount, intervalOpt.unit);
      }
      setDataRows((oldRows) =>
        rowTimes.map((dtStr, idx) => ({
          dateTime: dtStr,
          value: (oldRows[idx] && oldRows[idx].value) || ""
        }))
      );
    } else if (dataType === "TimeSeries" && startDate && startTime) {
      const dt = parseDateTime(startDate, startTime);
      setDataRows([{ dateTime: formatDateTime(dt), value: "" }]);
    }
  }, [dataType, startDate, startTime, endDate, endTime, dataInterval]);

  return (
    <div className={`${style} wizard-fixed-size`}>
      <MetadataSection
        datasetName={datasetName} setDatasetName={setDatasetName}
        description={description} setDescription={setDescription}
        studyDssFile={studyDssFile} setStudyDssFile={setStudyDssFile}
      />
      
      <div className="manual-entry-fields-container border rounded">
        <div className="manual-entry-fields-left">
          <FieldsSection
            dataType={dataType} setDataType={setDataType}
            parameter={parameter} setParameter={setParameter}
            dataUnit={dataUnit} setDataUnit={setDataUnit}
            dataInterval={dataInterval} setDataInterval={setDataInterval}
          />
        </div>
        <TableSection
          dataRows={dataRows}
          handleRowChange={handleRowChange}
          handleValueChange={handleValueChange}
        />
      </div>

      {dataType === "TimeSeries" && (
        <DetailsSection
          partA={partA} setPartA={setPartA}
          partB={partB} setPartB={setPartB}
          partC={partC}
          partD={partD}
          partE={partE}
          partF={partF} setPartF={setPartF}
          pathname={pathname}
          startDate={startDate} setStartDate={setStartDate}
          startTime={startTime} setStartTime={setStartTime}
          endDate={endDate} setEndDate={setEndDate}
          endTime={endTime} setEndTime={setEndTime}
          startUnits={startUnits}
          startType={startType} setStartType={setStartType}
        />
      )}

      {/* Save Button at bottom right of full editor */}
      <div
        className="wizard-footer d-flex justify-content-end"
        style={{
          padding: "10px 18px",
          borderTop: "1px solid #333",
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saveDisabled}
        >
          Save As New Data Set
        </button>
      </div>
    </div>
  );
}

export default ManualDataEntryEditor;
