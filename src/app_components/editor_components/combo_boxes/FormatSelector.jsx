export default function FormatSelector({value, onChange}) {
  return (
    <div className="mb-3 d-flex align-items-center">
      <label className="form-label font-xs me-3" style={{minWidth: 90}}>Data Format:</label>
      <label className="form-label font-xs me-3" style={{fontWeight: 400}}>
        <input
          type="radio"
          name="dataFormat"
          value="DSS"
          checked={value === "DSS"}
          onChange={e => onChange(e.target.value)}
        />{" "}
        DSS
      </label>
      <label className="form-label font-xs" style={{fontWeight: 400}}>
        <input
          type="radio"
          name="dataFormat"
          value="JSON"
          checked={value === "JSON"}
          onChange={e => onChange(e.target.value)}
        />{" "}
        JSON
      </label>
    </div>
  );
}
