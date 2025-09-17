import React from "react";
import { TextStore } from "../../../utils/TextStore";

export default function StructureSelector({ value, onChange }) {
  return (
    <div className="manual-entry-row">
      <label className="manual-entry-label">
        {TextStore.interface("StructureSelector_Label")}
      </label>

      <div className="manual-entry-field manual-entry-radio-group">
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            id="structure_timeseries"
            name="dataStructure"
            value="TimeSeries"
            checked={value === "TimeSeries"}
            onChange={(e) => onChange(e.target.value)}
          />
          <label className="form-check-label font-xs" htmlFor="structure_timeseries">
            {TextStore.interface("StructureSelector_TimeSeries")}
          </label>
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            id="structure_paireddata"
            name="dataStructure"
            value="PairedData"
            checked={value === "PairedData"}
            onChange={(e) => onChange(e.target.value)}
          />
          <label className="form-check-label font-xs" htmlFor="structure_paireddata">
            {TextStore.interface("StructureSelector_PairedData")}
          </label>
        </div>
      </div>
    </div>
  );
}
