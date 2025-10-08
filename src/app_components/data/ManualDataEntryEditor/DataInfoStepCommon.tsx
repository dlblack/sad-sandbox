import React from "react";
import ParameterComboBox from "../../editor_components/combo_boxes/ParameterComboBox";
import DataUnitComboBox from "../../editor_components/combo_boxes/DataUnitComboBox";
import DataIntervalComboBox from "../../editor_components/combo_boxes/DataIntervalComboBox";
import DataUnitTypeComboBox, { DataUnitType } from "../../editor_components/combo_boxes/DataUnitTypeComboBox";
import { normalizeTimeInput } from "../../../utils/timeUtils";
import { TextStore } from "../../../utils/TextStore";
import { Card, TextInput } from "@mantine/core";

export interface DataInfoStepCommonProps {
    // parameter & units
    parameter?: string;
    setParameter: (v: string) => void;

    units?: string;
    setUnits: (v: string) => void;

    /** Unit type is constrained to the DataUnitType union (or empty string for none) */
    unitType?: DataUnitType | "";
    setUnitType: (v: DataUnitType | "") => void;

    dataInterval?: string;
    setDataInterval: (v: string) => void;

    // date/time (ISO date strings like "2024-01-31"; time "HH:MM")
    startDate?: string;
    setStartDate: (v: string) => void;

    startTime?: string;
    setStartTime: (v: string) => void;

    endDate?: string;
    setEndDate: (v: string) => void;

    endTime?: string;
    setEndTime: (v: string) => void;

    // UI
    showParameterCombo?: boolean;
}

export default function DataInfoStepCommon({
                                               parameter,
                                               setParameter,
                                               units,
                                               setUnits,
                                               unitType,
                                               setUnitType,
                                               dataInterval,
                                               setDataInterval,
                                               startDate,
                                               setStartDate,
                                               startTime,
                                               setStartTime,
                                               endDate,
                                               setEndDate,
                                               endTime,
                                               setEndTime,
                                               showParameterCombo = false,
                                           }: DataInfoStepCommonProps) {
    return (
        <div>
            {showParameterCombo && <div className="mb-2" />}

            <Card
                withBorder
                radius="md"
                padding="xs"
                style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto 1fr",
                    rowGap: "0.5em",
                    columnGap: "1em",
                    alignItems: "center",
                }}
            >
                {/* Start date */}
                <label className="font-xs" style={{ marginBottom: 0 }}>
                    {TextStore.interface("ManualDataEntryEditor_StartDate")}
                </label>
                <TextInput size="xs" value={startDate ?? ""} onChange={(e) => setStartDate(e.currentTarget.value)} />

                {/* Parameter */}
                <label className="font-xs" style={{ marginBottom: 0 }}>
                    {TextStore.interface("ManualDataEntryEditor_SelectParameter")}
                </label>
                <ParameterComboBox value={parameter ?? ""} onChange={setParameter} />

                {/* Start time */}
                <label className="font-xs" style={{ marginBottom: 0 }}>
                    {TextStore.interface("ManualDataEntryEditor_StartTime")}
                </label>
                <TextInput
                    size="xs"
                    value={startTime ?? ""}
                    onChange={(e) => setStartTime(e.currentTarget.value)}
                    onBlur={(e) => setStartTime(normalizeTimeInput(e.currentTarget.value))}
                />

                {/* Interval */}
                <label className="font-xs" style={{ marginBottom: 0 }}>
                    {TextStore.interface("ManualDataEntryEditor_Interval")}
                </label>
                <DataIntervalComboBox value={dataInterval ?? ""} onChange={setDataInterval} />

                {/* End date */}
                <label className="font-xs" style={{ marginBottom: 0 }}>
                    {TextStore.interface("ManualDataEntryEditor_EndDate")}
                </label>
                <TextInput size="xs" value={endDate ?? ""} onChange={(e) => setEndDate(e.currentTarget.value)} />

                {/* Units */}
                <label className="font-xs" style={{ marginBottom: 0 }}>
                    {TextStore.interface("ManualDataEntryEditor_Units")}
                </label>
                <DataUnitComboBox parameter={parameter ?? ""} value={units ?? ""} onChange={setUnits} />

                {/* End time */}
                <label className="font-xs" style={{ marginBottom: 0 }}>
                    {TextStore.interface("ManualDataEntryEditor_EndTime")}
                </label>
                <TextInput
                    size="xs"
                    value={endTime ?? ""}
                    onChange={(e) => setEndTime(e.currentTarget.value)}
                    onBlur={(e) => setEndTime(normalizeTimeInput(e.currentTarget.value))}
                />

                {/* Unit type */}
                <label className="font-xs" style={{ marginBottom: 0 }}>
                    {TextStore.interface("ManualDataEntryEditor_Type")}
                </label>
                <DataUnitTypeComboBox value={unitType ?? ""} onChange={setUnitType} />
            </Card>
        </div>
    );
}
