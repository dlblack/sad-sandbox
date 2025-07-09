function TableSection({ dataRows, handleRowChange, handleValueChange }) {
  return (
    <div className="manual-entry-table-panel">
      <table className="manual-entry-table table table-sm table-striped compact-table">
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
                  tabIndex={-1}     // <-- Remove from tab order
                  readOnly={!!row.dateTime} // Optional: make uneditable if value exists
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
                  // No tabIndex: tabbable as normal
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default TableSection;
