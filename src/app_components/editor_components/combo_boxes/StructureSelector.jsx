export default function StructureSelector({value, onChange}) {
  return (
    <div className="mb-3 d-flex align-items-center">
      <label className="form-label font-xs me-3" style={{minWidth: 90}}>Data Structure:</label>
      <label className="form-label font-xs me-3" style={{fontWeight: 400}}>
        <input
          type="radio"
          name="dataStructure"
          value="TimeSeries"
          checked={value === "TimeSeries"}
          onChange={e => onChange(e.target.value)}
        />{" "}
        Time Series
      </label>
      <label className="form-label font-xs" style={{fontWeight: 400}}>
        <input
          type="radio"
          name="dataStructure"
          value="PairedData"
          checked={value === "PairedData"}
          onChange={e => onChange(e.target.value)}
        />{" "}
        Paired Data
      </label>
    </div>
  );
}
