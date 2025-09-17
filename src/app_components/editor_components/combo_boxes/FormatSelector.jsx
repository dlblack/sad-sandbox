import React from "react";
import { TextStore } from "../../../utils/TextStore";

export default function FormatSelector({ value, onChange }) {
  return (
    <div className="manual-entry-row">
      <label className="manual-entry-label">
        {TextStore.interface("FormatSelector_Label")}
      </label>

      <div className="manual-entry-field manual-entry-radio-group">
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            id="format_dss"
            name="dataFormat"
            value="DSS"
            checked={value === "DSS"}
            onChange={(e) => onChange(e.target.value)}
          />
          <label className="form-check-label font-xs" htmlFor="format_dss">
            {TextStore.interface("FormatSelector_DSS")}
          </label>
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            id="format_json"
            name="dataFormat"
            value="JSON"
            checked={value === "JSON"}
            onChange={(e) => onChange(e.target.value)}
          />
          <label className="form-check-label font-xs" htmlFor="format_json">
            {TextStore.interface("FormatSelector_JSON")}
          </label>
        </div>
      </div>
    </div>
  );
}
