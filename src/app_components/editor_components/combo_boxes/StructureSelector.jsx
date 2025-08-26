import React from "react";
import { TextStore } from "../../../utils/TextStore";

export default function StructureSelector({ value, onChange }) {
  return (
    <div className="mb-3 d-flex align-items-center">
      <label className="form-label font-xs me-3" style={{ minWidth: 90 }}>
        {TextStore.interface("StructureSelector_Label")}
      </label>

      <label className="form-label font-xs me-3" style={{ fontWeight: 400 }}>
        <input
          type="radio"
          name="dataStructure"
          value="TimeSeries"
          checked={value === "TimeSeries"}
          onChange={(e) => onChange(e.target.value)}
        />{" "}
        {TextStore.interface("StructureSelector_TimeSeries")}
      </label>

      <label className="form-label font-xs" style={{ fontWeight: 400 }}>
        <input
          type="radio"
          name="dataStructure"
          value="PairedData"
          checked={value === "PairedData"}
          onChange={(e) => onChange(e.target.value)}
        />{" "}
        {TextStore.interface("StructureSelector_PairedData")}
      </label>
    </div>
  );
}
