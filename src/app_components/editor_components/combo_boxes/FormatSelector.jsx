import React from "react";
import { TextStore } from "../../../utils/TextStore";

export default function FormatSelector({ value, onChange }) {
  return (
    <div className="mb-3 d-flex align-items-center">
      <label className="form-label font-xs me-3" style={{ minWidth: 90 }}>
        {TextStore.interface("FormatSelector_Label")}
      </label>

      <label className="form-label font-xs me-3" style={{ fontWeight: 400 }}>
        <input
          type="radio"
          name="dataFormat"
          value="DSS"
          checked={value === "DSS"}
          onChange={(e) => onChange(e.target.value)}
        />{" "}
        {TextStore.interface("FormatSelector_DSS")}
      </label>

      <label className="form-label font-xs" style={{ fontWeight: 400 }}>
        <input
          type="radio"
          name="dataFormat"
          value="JSON"
          checked={value === "JSON"}
          onChange={(e) => onChange(e.target.value)}
        />{" "}
        {TextStore.interface("FormatSelector_JSON")}
      </label>
    </div>
  );
}
