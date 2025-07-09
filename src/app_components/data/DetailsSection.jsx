import React from "react";
import { normalizeTimeInput } from "../../utils/timeUtils";

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
      <div className="pathname-section p-1 border rounded" style={{ width: "100%" }}>
        <div className="font-xs mb-2">Pathname Parts</div>
        {/* First Row: A B C */}
        <div className="compact-field d-flex gap-1 mb-1 flex-nowrap">
          <div className="d-flex align-items-center flex-grow-1">
            <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 16 }}>A</label>
            <input className="form-control form-control-sm" maxLength={50} value={partA} onChange={e => setPartA(e.target.value)} />
          </div>
          <div className="compact-field d-flex align-items-center flex-grow-1">
            <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 16 }}>B</label>
            <input className="form-control form-control-sm" maxLength={50} value={partB} onChange={e => setPartB(e.target.value)} />
          </div>
          <div className="compact-field d-flex align-items-center flex-grow-1">
            <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 16 }}>C</label>
            <input className="form-control form-control-sm" maxLength={50} value={partC} disabled />
          </div>
        </div>
        {/* Second Row: D E F */}
        <div className="compact-field d-flex gap-1 mb-1 flex-nowrap">
          <div className="d-flex align-items-center flex-grow-1">
            <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 16 }}>D</label>
            <input className="form-control form-control-sm" maxLength={50} value={partD} disabled />
          </div>
          <div className="compact-field d-flex align-items-center flex-grow-1">
            <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 16 }}>E</label>
            <input className="form-control form-control-sm" maxLength={50} value={partE} disabled />
          </div>
          <div className="compact-field d-flex align-items-center flex-grow-1">
            <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 16 }}>F</label>
            <input className="form-control form-control-sm" maxLength={50} value={partF} onChange={e => setPartF(e.target.value)} />
          </div>
        </div>
        {/* Pathname */}
        <div className="d-flex align-items-center mb-1 w-100">
          <label className="form-label font-xs me-2 mb-0" style={{ minWidth: 70 }}>Pathname:</label>
          <input className="form-control form-control-sm flex-grow-1" value={pathname} readOnly />
        </div>
      </div>

      {/* Start/End Info */}
      <div
        className="startinfo-section p-1 border rounded"
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          rowGap: "0.5em",
          columnGap: "1em",
          alignItems: "center",
        }}
      >
        {/* First Row */}
        <div className="compact-field d-flex align-items-center">
          <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 58 }}>
            Start Date
          </label>
          <input
            className="form-control form-control-sm"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="compact-field d-flex align-items-center">
          <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 58 }}>
            Start Time
          </label>
          <input
            className="form-control form-control-sm"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            onBlur={e => setStartTime(normalizeTimeInput(e.target.value))}
          />
        </div>
        <div className="compact-field d-flex align-items-center">
          <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 38 }}>
            Units
          </label>
          <input
            className="form-control form-control-sm"
            maxLength={10}
            value={startUnits}
            disabled
          />
        </div>

        {/* Second Row */}
        <div className="compact-field d-flex align-items-center">
          <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 58 }}>
            End Date
          </label>
          <input
            className="form-control form-control-sm"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        <div className="compact-field d-flex align-items-center">
          <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 58 }}>
            End Time
          </label>
          <input
            className="form-control form-control-sm"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            onBlur={e => setEndTime(normalizeTimeInput(e.target.value))}
          />
        </div>
        <div className="compact-field d-flex align-items-center">
          <label className="form-label font-xs compact-label mb-0 me-1" style={{ minWidth: 38 }}>
            Type
          </label>
          <select
            className="form-select form-select-sm"
            value={startType}
            onChange={e => setStartType(e.target.value)}
          >
            <option value="">Select...</option>
            <option value="PerAver">PER-AVER</option>
            <option value="PerCum">PER-CUM</option>
            <option value="InstVal">INST-VAL</option>
            <option value="InstCum">INST-CUM</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default DetailsSection;
