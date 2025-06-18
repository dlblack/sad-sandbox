import React, { useContext, useState } from "react";
import { StyleContext } from "../../styles/StyleContext";

import DataTypeComboBox from "../editor_components/combo_boxes/DataTypeComboBox";
import ParameterComboBox from "../editor_components/combo_boxes/ParameterComboBox";
import DataUnitComboBox from "../editor_components/combo_boxes/DataUnitComboBox";
import DataIntervalComboBox from "../editor_components/combo_boxes/DataIntervalComboBox";

function ManualDataEntryEditor(props) {
  const { style } = useContext(StyleContext);

  const [name, setName] = useState("");
  const [dataType, setDataType] = useState("");
  const [parameter, setParameter] = useState("");
  const [dataUnit, setDataUnit] = useState("");
  const [dataInterval, setDataInterval] = useState("");

  // Table rows state
  const [dataRows, setDataRows] = useState(
    Array(8).fill({ dateTime: '', value: '' })
  );

  // Update row handler
  const handleRowChange = (idx, field, val) => {
    const newRows = dataRows.map((row, i) =>
      i === idx ? { ...row, [field]: val } : row
    );
    setDataRows(newRows);

    // If bottom row is just filled, add another blank
    if (
      idx === dataRows.length - 1 &&
      newRows[idx].dateTime &&
      newRows[idx].value &&
      (newRows[idx].dateTime !== '' && newRows[idx].value !== '')
    ) {
      setDataRows([...newRows, { dateTime: '', value: '' }]);
    }
  };

  // Only allow numbers in Value
  const handleValueChange = (idx, val) => {
    // Remove non-numeric except period
    if (/^-?\d*\.?\d*$/.test(val)) {
      handleRowChange(idx, "value", val);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (props.onFinish) {
      props.onFinish({
        name, dataType, parameter, dataUnit, dataInterval, dataRows
      }, props.id);
    }
  };

  return (
    <div className={`${style} d-flex flex-column h-100`}>
      {/* Main content: two columns */}
      <div className="d-flex flex-row flex-grow-1">
        {/* LEFT: fields/combos */}
        <div style={{ flex: 1, minWidth: 260, maxWidth: 350, paddingRight: 5 }}>
          <form
            className="card-text flex-grow-1 d-flex flex-column p-3"
            onSubmit={e => e.preventDefault()}
          >
            {/* Name */}
            <div className="form-group row align-items-center mb-2">
              <label htmlFor="name" className="col-auto col-form-label font-xs" style={{ minWidth: 110 }}>
                Dataset Name:
              </label>
              <div className="col ps-0">
                <input
                  className="form-control form-control-sm font-xs"
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
            {/* Data Type */}
            <div className="form-group row align-items-center mb-2">
              <label htmlFor="dataType" className="col-auto col-form-label font-xs" style={{ minWidth: 110 }}>
                Data Type:
              </label>
              <div className="col ps-0">
                <DataTypeComboBox value={dataType} onChange={setDataType} id="dataType" />
              </div>
            </div>
            {/* Parameter */}
            <div className="form-group row align-items-center mb-2">
              <label htmlFor="parameter" className="col-auto col-form-label font-xs" style={{ minWidth: 110 }}>
                Parameter:
              </label>
              <div className="col ps-0">
                <ParameterComboBox value={parameter} onChange={setParameter} id="parameter" />
              </div>
            </div>
            {/* Data Unit */}
            <div className="form-group row align-items-center mb-2">
              <label htmlFor="dataUnit" className="col-auto col-form-label font-xs" style={{ minWidth: 110 }}>
                Data Unit:
              </label>
              <div className="col ps-0">
                <DataUnitComboBox parameter={parameter} value={dataUnit} onChange={setDataUnit} id="dataUnit" />
              </div>
            </div>
            {/* Data Interval */}
            <div className="form-group row align-items-center mb-2">
              <label htmlFor="dataInterval" className="col-auto col-form-label font-xs" style={{ minWidth: 110 }}>
                Data Interval:
              </label>
              <div className="col ps-0">
                <DataIntervalComboBox value={dataInterval} onChange={setDataInterval} id="dataInterval" />
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT: Data Table */}
        <div
          className="manual-entry-table-panel"
          style={{ flex: 2, minWidth: 300, overflow: "auto" }}
        >
          <table
            className="manual-entry-table table table-sm table-striped compact-table"
            style={{
              fontSize: "0.8em",
              width: "300px",
              background: "#f8f9fa"
            }}
          >
            <thead>
              <tr>
                <th className="manual-entry-th">Date Time</th>
                <th className="manual-entry-th">Value</th>
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      className="manual-entry-input form-control font-xs"
                      value={row.dateTime}
                      onChange={e => handleRowChange(idx, "dateTime", e.target.value)}
                      pattern="\d{2}[A-Za-z]{3}\d{4} \d{2}:\d{2}"
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="manual-entry-input form-control font-xs"
                      value={row.value}
                      onChange={e => handleValueChange(idx, e.target.value)}
                      style={{ MozAppearance: "textfield" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
        >
          Save As New Data Set
        </button>
      </div>
    </div>
  );
}

export default ManualDataEntryEditor;
