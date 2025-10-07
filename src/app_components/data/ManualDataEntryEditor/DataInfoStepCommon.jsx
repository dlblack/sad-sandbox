import React from "react";
import ParameterComboBox from "../../editor_components/combo_boxes/ParameterComboBox";
import DataUnitComboBox from "../../editor_components/combo_boxes/DataUnitComboBox";
import DataIntervalComboBox from "../../editor_components/combo_boxes/DataIntervalComboBox.jsx";
import DataUnitTypeComboBox from "../../editor_components/combo_boxes/DataUnitTypeComboBox.jsx";
import { normalizeTimeInput } from "../../../utils/timeUtils.js";
import { TextStore } from "../../../utils/TextStore.js";
import { Card } from "@mantine/core";

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
        <div className="mb-2" />
      }

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
        <label className="font-xs" style={{ marginBottom: 0 }}>
          {TextStore.interface("ManualDataEntryEditor_StartDate")}
        </label>
        <TextInput
          size="xs"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label className="font-xs" style={{ marginBottom: 0 }}>
          {TextStore.interface("ManualDataEntryEditor_SelectParameter")}
        </label>
        <ParameterComboBox value={parameter} onChange={setParameter} />

        <label className="font-xs" style={{ marginBottom: 0 }}>
          {TextStore.interface("ManualDataEntryEditor_StartTime")}
        </label>
        <TextInput
          size="xs"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          onBlur={(e) => setStartTime(normalizeTimeInput(e.target.value))}
        />

        <label className="font-xs" style={{ marginBottom: 0 }}>
          {TextStore.interface("ManualDataEntryEditor_Interval")}
        </label>
        <DataIntervalComboBox value={dataInterval} onChange={setDataInterval} />

        <label className="font-xs" style={{ marginBottom: 0 }}>
          {TextStore.interface("ManualDataEntryEditor_EndDate")}
        </label>
        <TextInput
          size="xs"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <label className="font-xs" style={{ marginBottom: 0 }}>
          {TextStore.interface("ManualDataEntryEditor_Units")}
        </label>
        <DataUnitComboBox parameter={parameter} value={units} onChange={setUnits} />

        <label className="font-xs" style={{ marginBottom: 0 }}>
          {TextStore.interface("ManualDataEntryEditor_EndTime")}
        </label>
        <TextInput
          size="xs"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          onBlur={(e) => setEndTime(normalizeTimeInput(e.target.value))}
        />

        <label className="font-xs" style={{ marginBottom: 0 }}>
          {TextStore.interface("ManualDataEntryEditor_Type")}
        </label>
        <DataUnitTypeComboBox value={unitType} onChange={setUnitType} />
      </Card>
    </div>
  );
}
