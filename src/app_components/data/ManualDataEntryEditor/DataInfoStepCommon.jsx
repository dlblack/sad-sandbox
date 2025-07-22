import React from "react";
import ParameterComboBox from '../../editor_components/combo_boxes/ParameterComboBox';
import DataUnitComboBox from "../../editor_components/combo_boxes/DataUnitComboBox";
import DataIntervalComboBox from "../../editor_components/combo_boxes/DataIntervalComboBox.jsx";
import DataUnitTypeComboBox from "../../editor_components/combo_boxes/DataUnitTypeComboBox.jsx";
import { normalizeTimeInput } from "@/utils/timeUtils.js";

export default function DataInfoStepCommon({
                                               parameter, setParameter,
                                               units, setUnits,
                                               unitType, setUnitType,
                                               dataInterval, setDataInterval,
                                               startDate, setStartDate,
                                               startTime, setStartTime,
                                               endDate, setEndDate,
                                               endTime, setEndTime,
                                               showParameterCombo = false
                                           }) {
    return (
        <div>
            {showParameterCombo &&
                <div className="mb-2">

                </div>
            }
            <div
                className="startinfo-section p-1 border rounded mb-3"
                style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto 1fr",
                    rowGap: "0.5em",
                    columnGap: "1em",
                    alignItems: "center",
                }}
            >
                <label className="form-label font-xs mb-0">Start Date</label>
                <input className="form-control form-control-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <label className="form-label font-xs me-2">Select Parameter</label>
                <ParameterComboBox value={parameter} onChange={setParameter} />

                <label className="form-label font-xs mb-0">Start Time</label>
                <input className="form-control form-control-sm" value={startTime} onChange={e => setStartTime(e.target.value)} onBlur={e => setStartTime(normalizeTimeInput(e.target.value))} />
                <label className="form-label font-xs mb-0">Interval</label>
                <DataIntervalComboBox value={dataInterval} onChange={setDataInterval} />

                <label className="form-label font-xs mb-0">End Date</label>
                <input className="form-control form-control-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <label className="form-label font-xs mb-0">Units</label>
                <DataUnitComboBox parameter={parameter} value={units} onChange={setUnits} />

                <label className="form-label font-xs mb-0">End Time</label>
                <input className="form-control form-control-sm" value={endTime} onChange={e => setEndTime(e.target.value)} onBlur={e => setEndTime(normalizeTimeInput(e.target.value))} />
                <label className="form-label font-xs mb-0">Type</label>
                <DataUnitTypeComboBox value={unitType} onChange={setUnitType} />
            </div>
        </div>
    );
}
