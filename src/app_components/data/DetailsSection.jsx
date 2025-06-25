import React from "react";

function DetailsSection({
  partA, setPartA,
  partB, setPartB,
  partC,
  partD,
  partE,
  partF, setPartF,
  pathname,
  startDate, setStartDate,
  startTime, setStartTime,
  endDate, setEndDate,
  endTime, setEndTime,
  startUnits,
  startType, setStartType
}) {
  return (
    <div className="manual-entry-details">
      {/* Pathname Parts */}
      <div className="pathname-section p-2 border rounded" style={{ width: "100%" }}>
        <div className="mb-2">Pathname Parts</div>
        <div className="d-flex gap-2 mb-2 flex-wrap w-100">
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">A</label>
            <input className="form-control form-control-sm" maxLength={50} value={partA} onChange={e => setPartA(e.target.value)} />
          </div>
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">B</label>
            <input className="form-control form-control-sm" maxLength={50} value={partB} onChange={e => setPartB(e.target.value)} />
          </div>
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">C</label>
            <input className="form-control form-control-sm" maxLength={50} value={partC} disabled />
          </div>
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">D</label>
            <input className="form-control form-control-sm" maxLength={50} value={partD} disabled />
          </div>
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">E</label>
            <input className="form-control form-control-sm" maxLength={50} value={partE} disabled />
          </div>
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">F</label>
            <input className="form-control form-control-sm" maxLength={50} value={partF} onChange={e => setPartF(e.target.value)} />
          </div>
        </div>
        <div className="d-flex align-items-center mb-1 w-100">
          <label className="form-label font-xs me-2 mb-0" style={{ minWidth: 70 }}>Pathname:</label>
          <input className="form-control form-control-sm flex-grow-1" value={pathname} readOnly />
        </div>
      </div>

      {/* Start/End Info */}
      <div className="startinfo-section p-2 border rounded" style={{ width: "100%" }}>
        <div className="d-flex gap-2 mb-2 flex-wrap w-100">
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">Start Date</label>
            <input className="form-control form-control-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">Start Time</label>
            <input className="form-control form-control-sm" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">End Date</label>
            <input className="form-control form-control-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">End Time</label>
            <input className="form-control form-control-sm" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">Units</label>
            <input className="form-control form-control-sm" maxLength={10} value={startUnits} disabled />
          </div>
          <div className="d-flex flex-column flex-grow-1">
            <label className="form-label font-xs">Type</label>
            <select className="form-select form-select-sm" value={startType} onChange={e => setStartType(e.target.value)}>
              <option value="">Select...</option>
              <option value="PerAver">PER-AVER</option>
              <option value="PerCum">PER-CUM</option>
              <option value="InstVal">INST-VAL</option>
              <option value="InstCum">INST-CUM</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsSection;
