import React from "react";
import DataInfoStepCommon from "./DataInfoStepCommon.jsx";

export default function PairedDataInfoStep({
                                               parameter, setParameter,
                                               units, setUnits,
                                               unitType, setUnitType,
                                               dataInterval, setDataInterval,
                                               startDate, setStartDate,
                                               startTime, setStartTime,
                                               endDate, setEndDate,
                                               endTime, setEndTime
                                           }) {
    return (
        <div>
            <h5>Define Paired Data Properties</h5>
            <DataInfoStepCommon
                parameter={parameter}
                units={units} setUnits={setUnits}
                unitType={unitType} setUnitType={setUnitType}
                dataInterval={dataInterval} setDataInterval={setDataInterval}
                startDate={startDate} setStartDate={setStartDate}
                startTime={startTime} setStartTime={setStartTime}
                endDate={endDate} setEndDate={setEndDate}
                endTime={endTime} setEndTime={setEndTime}
            />
        </div>
    );
}
