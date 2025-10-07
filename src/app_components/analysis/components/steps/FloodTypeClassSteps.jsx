import React from "react";
import {
  FlowTimeSeriesComboBox,
  PrecipTimeSeriesComboBox,
  SweTimeSeriesComboBox
} from "../inputs/TimeSeriesComboBoxes.jsx";
import { TextStore } from "../../../../utils/TextStore.js";
import TimeField from "../../../common/TimeField.jsx";

/** Helpers */
const L = (k) => TextStore.interface?.(k);

/** ===== Flow Data Source ===== */
export function makeFlowDataSourceStep() {
  return {
    label: TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData"),
    render: (ctx) => {
      const { bag, setBag, selectedDataset, data = {} } = ctx;
      const inputNarrow = { width: "50ch" };

      return (
        <>
          <div className="mb-2 pb-3 fw-bold">
            {TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_Label")}
          </div>

          <div className="wizard-grid">
            {/* Flow time series */}
            <label htmlFor="ft-flow-ts" className="wizard-grid-label">
              {TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_TimeSeries")}
            </label>
            <div className="wizard-grid-field">
              <FlowTimeSeriesComboBox
                id="ft-flow-ts"
                style={inputNarrow}
                datasets={data?.["Discharge"] || []}
                value={bag.flowTimeSeries}
                selectedDataset={selectedDataset}
                onChange={(val) =>
                  setBag((prev) => ({ ...prev, flowTimeSeries: val }))
                }
              />
            </div>

            {/* Start date */}
            <label htmlFor="ft-start-date" className="wizard-grid-label">
              {TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_StartDate")}
            </label>
            <div className="wizard-grid-field">
              <input
                id="ft-start-date"
                style={inputNarrow}
                type="date"
                className="form-control form-control-sm font-xs"
                value={bag.classStartDate}
                onChange={(e) =>
                  setBag((prev) => ({ ...prev, classStartDate: e.target.value }))
                }
              />
            </div>

            {/* Start time */}
            <label htmlFor="ft-start-time" className="wizard-grid-label">
              {TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_StartTime")}
            </label>
            <div className="wizard-grid-field">
              <TimeField
                id="ft-start-time"
                className="form-control form-control-sm font-xs"
                value={bag.classStartTime || ""}
                onChange={(val) => setBag((p) => ({ ...p, classStartTime: val }))}
              />
            </div>

            {/* End date */}
            <label htmlFor="ft-end-date" className="wizard-grid-label">
              {TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_EndDate")}
            </label>
            <div className="wizard-grid-field">
              <input
                id="ft-end-date"
                style={inputNarrow}
                type="date"
                className="form-control form-control-sm font-xs"
                value={bag.classEndDate}
                onChange={(e) =>
                  setBag((prev) => ({ ...prev, classEndDate: e.target.value }))
                }
              />
            </div>

            {/* End time */}
            <label htmlFor="ft-end-time" className="wizard-grid-label">
              {TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_EndTime")}
            </label>
            <div className="wizard-grid-field">
              <TimeField
                id="ft-end-time"
                className="form-control form-control-sm font-xs"
                value={bag.classEndTime || ""}
                onChange={(val) => setBag((p) => ({ ...p, classEndTime: val }))}
              />
            </div>
          </div>
        </>
      );
    },
  };
}

export function FlowDataSourceSummary({ bag }) {
  return (
    <ul className="list-unstyled mb-2 font-xs">
      <li>
        <strong>{L("Wizard_Summary_Dataset")}</strong>
        {bag.flowTimeSeries}
      </li>
      <li>
        <strong>{L("FloodTypeClass_Wizard_StepFlowData_StartDate")}</strong>
        {bag.classStartDate}
      </li>
      <li>
        <strong>{L("FloodTypeClass_Wizard_StepFlowData_StartTime")}</strong>
        {bag.classStartTime}
      </li>
      <li>
        <strong>{L("FloodTypeClass_Wizard_StepFlowData_EndDate")}</strong>
        {bag.classEndDate}
      </li>
      <li>
        <strong>{L("FloodTypeClass_Wizard_StepFlowData_EndTime")}</strong>
        {bag.classEndTime}
      </li>
    </ul>
  );
}

/** ===== Flood Type Classification ===== */
const PRESETS = [
  "FloodTypeClass_Wizard_StepFloodTypeClass_HumidEastDelawareRiver",
  "FloodTypeClass_Wizard_StepFloodTypeClass_HumidEastTrinityRiver",
  "FloodTypeClass_Wizard_StepFloodTypeClass_MountainousWestPugetSound",
  "FloodTypeClass_Wizard_StepFloodTypeClass_MountainousWestUpperColoradoRiver",
  "FloodTypeClass_Wizard_StepFloodTypeClass_CentralPlainsRedRiver",
  "FloodTypeClass_Wizard_StepFloodTypeClass_CentralPlainsIowaRiver",
];

export function makeFloodTypeStep() {
  return {
    label: L("FloodTypeClass_Wizard_StepFloodTypeClass"),
    render: ({ bag, setBag }) => (
      <>
        <div className="mb-2 pb-3 fw-bold">
          {L("FloodTypeClass_Wizard_StepFloodTypeClass_Label")}
        </div>

        <div className="wizard-grid">
          <div className="wizard-grid-label">&nbsp;</div>
          <div className="wizard-grid-field">
            {PRESETS.map((key, i) => {
              const p = L(key) || key;
              const id = `ft-preset-${i}`;
              return (
                <div className="form-check mb-1" key={id}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="ft-preset"
                    id={id}
                    value={p}
                    checked={(bag.floodTypePreset || "") === p}
                    onChange={(e) =>
                      setBag((prev) => ({
                        ...prev,
                        floodTypePreset: e.target.value,
                      }))
                    }
                  />
                  <label className="form-check-label" htmlFor={id}>
                    {p}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </>
    ),
  };
}

export function FloodTypeSummary({ bag }) {
  return (
    <ul className="list-unstyled mb-2 font-xs">
      <li>
        <strong>
          {L("FloodTypeClass_Wizard_StepFloodTypeClass")}
        </strong>
        {bag.floodTypePreset}
      </li>
    </ul>
  );
}

/** ===== Data Sources (Precip / SWE) ===== */
export function makeDataSourcesStep() {
  return {
    label: L("FloodTypeClass_Wizard_StepDataSources"),
    render: (ctx) => {
      const { bag, setBag, selectedDataset, data = {} } = ctx;
      const inputNarrow = { width: "50ch" };

      return (
        <>
          <div className="mb-2 pb-3 fw-bold">
            {L("FloodTypeClass_Wizard_StepDataSources_Label")}
          </div>

          <div className="wizard-grid">
            {/* Precip TS */}
            <label htmlFor="ft-precip" className="wizard-grid-label">
              {L("FloodTypeClass_Wizard_StepDataSources_PrecipTS")}
            </label>
            <div className="wizard-grid-field">
              <PrecipTimeSeriesComboBox
                id="ft-precip"
                style={inputNarrow}
                datasets={data.Precipitation || []}
                value={bag.precipTimeSeries}
                selectedDataset={selectedDataset}
                onChange={(val) =>
                  setBag((prev) => ({ ...prev, precipTimeSeries: val }))
                }
              />
            </div>

            {/* SWE TS */}
            <label htmlFor="ft-swe" className="wizard-grid-label">
              {L("FloodTypeClass_Wizard_StepDataSources_SweTS")}
            </label>
            <div className="wizard-grid-field">
              <SweTimeSeriesComboBox
                id="ft-swe"
                style={inputNarrow}
                datasets={data.SWE || data["Snow Water Equivalent"] || []}
                value={bag.sweTimeSeries}
                selectedDataset={selectedDataset}
                onChange={(val) =>
                  setBag((prev) => ({ ...prev, sweTimeSeries: val }))
                }
              />
            </div>
          </div>
        </>
      );
    },
  };
}

export function DataSourcesSummary({ bag }) {
  return (
    <ul className="list-unstyled mb-2 font-xs">
      <li>
        <strong>
          {L("FloodTypeClass_Wizard_StepDataSources_PrecipTS")}
        </strong>{" "}
        {bag.precipTimeSeries}
      </li>
      <li>
        <strong>
          {L("FloodTypeClass_Wizard_StepDataSources_SweTS")}
        </strong>{" "}
        {bag.sweTimeSeries}
      </li>
    </ul>
  );
}

/** ===== Thresholds ===== */
export function makeThresholdsStep() {
  return {
    label: L("FloodTypeClass_Wizard_StepThresholds"),
    render: ({ bag, setBag }) => {
      const inputNarrow = { width: "10ch" };

      return (
        <>
          <div className="mb-2 pb-3 fw-bold">
            {L("FloodTypeClass_Wizard_StepThresholds_Label")}
          </div>

          <div className="wizard-grid">
            {/* Precip accumulation (in) */}
            <label htmlFor="ft-thr-precip" className="wizard-grid-label">
              {L("FloodTypeClass_Wizard_StepThresholds_Precip")}
            </label>
            <div className="wizard-grid-field">
              <input
                id="ft-thr-precip"
                type="number"
                step="0.0001"
                min="0"
                className="form-control form-control-sm font-xs"
                style={inputNarrow}
                value={bag.thrPrecipAccumIn ?? ""}
                onChange={(e) =>
                  setBag((prev) => ({ ...prev, thrPrecipAccumIn: e.target.value }))
                }
              />
            </div>

            {/* SWE depletion (in) */}
            <label htmlFor="ft-thr-swe" className="wizard-grid-label">
              {L("FloodTypeClass_Wizard_StepThresholds_SWE")}
            </label>
            <div className="wizard-grid-field">
              <input
                id="ft-thr-swe"
                type="number"
                step="0.0001"
                min="0"
                className="form-control form-control-sm font-xs"
                style={inputNarrow}
                value={bag.thrSWEDepletionIn ?? ""}
                onChange={(e) =>
                  setBag((prev) => ({ ...prev, thrSWEDepletionIn: e.target.value }))
                }
              />
            </div>

            {/* Snowmelt fraction */}
            <label htmlFor="ft-thr-snowfrac" className="wizard-grid-label">
              {L("FloodTypeClass_Wizard_StepThresholds_SnowmeltFrac")}
            </label>
            <div className="wizard-grid-field">
              <input
                id="ft-thr-snowfrac"
                type="number"
                step="0.0001"
                min="0"
                max="1"
                className="form-control form-control-sm font-xs"
                style={inputNarrow}
                value={bag.thrSnowmeltFrac ?? ""}
                onChange={(e) =>
                  setBag((prev) => ({ ...prev, thrSnowmeltFrac: e.target.value }))
                }
              />
            </div>

            {/* Rain fraction */}
            <label htmlFor="ft-thr-rainfrac" className="wizard-grid-label">
              {L("FloodTypeClass_Wizard_StepThresholds_RainFrac")}
            </label>
            <div className="wizard-grid-field">
              <input
                id="ft-thr-rainfrac"
                type="number"
                step="0.0001"
                min="0"
                max="1"
                className="form-control form-control-sm font-xs"
                style={inputNarrow}
                value={bag.thrRainFrac ?? ""}
                onChange={(e) =>
                  setBag((prev) => ({ ...prev, thrRainFrac: e.target.value }))
                }
              />
            </div>
          </div>
        </>
      );
    },
  };
}

export function ThresholdsSummary({ bag }) {
  return (
    <ul className="list-unstyled mb-2 font-xs">
      <li>
        <strong>
          {L("FloodTypeClass_Wizard_StepLookback_PrecipLabel")}
        </strong>{" "}
        {bag.thrPrecipAccumIn}
      </li>
      <li>
        <strong>
          {L("FloodTypeClass_Wizard_StepLookback_SWELabel")}
        </strong>{" "}
        {bag.thrSWEDepletionIn}
      </li>
      <li>
        <strong>
          {L("FloodTypeClass_Wizard_StepThresholds_SnowmeltFrac")}
        </strong>{" "}
        {bag.thrSnowmeltFrac}
      </li>
      <li>
        <strong>
          {L("FloodTypeClass_Wizard_StepThresholds_RainFrac")}
        </strong>{" "}
        {bag.thrRainFrac}
      </li>
    </ul>
  );
}

/** ===== Lookback Period ===== */
export function makeLookbackStep() {
  return {
    label: L("FloodTypeClass_Wizard_StepLookback"),
    render: ({ bag, setBag }) => {
      const t = (k) => L(k);
      const set = (patch) => setBag((prev) => ({ ...prev, ...patch }));

      // state
      const flowMode = bag.flowLookbackMode || "custom";
      const flowDays = bag.flowLookbackDays ?? "";
      const flowDA = bag.flowDrainageArea ?? "";

      const sweMode = bag.sweLookbackMode || "custom";
      const sweDays = bag.sweLookbackDays ?? "";
      const sweDA = bag.sweDrainageArea ?? "";

      const prcpMode = bag.precipLookbackMode || "custom";
      const prcpDays = bag.precipLookbackDays ?? "";
      const prcpDA = bag.precipDrainageArea ?? "";

      // shared layout
      const rowsIndent = { marginLeft: 32 };
      const row = {
        display: "grid",
        gridTemplateColumns: "1fr 160px 220px",
        alignItems: "center",
        columnGap: 12,
        maxWidth: 760,
        marginBottom: 6,
      };
      const rightLabel = "text-end pe-1";
      const rightInput = { width: "20ch", justifySelf: "end" };

      return (
        <>
          <div className="mb-2 pb-3 fw-bold">
            {t("FloodTypeClass_Wizard_StepLookback_Label")}
          </div>

          {/* FLOW */}
          <div className="mb-3">
            <div className="mb-1">
              {t("FloodTypeClass_Wizard_StepLookback_Flow_Label")}
            </div>
            <div style={rowsIndent}>
              <div style={row}>
                <div className="form-check m-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="lb-flow-custom"
                    name="lb-flow-mode"
                    checked={flowMode === "custom"}
                    onChange={() => set({ flowLookbackMode: "custom" })}
                  />
                  <label className="form-check-label ms-1" htmlFor="lb-flow-custom">
                    {t("FloodTypeClass_Wizard_StepLookback_Lookback_UserSpecified")}
                  </label>
                </div>
                <div className={rightLabel}>
                  {t("FloodTypeClass_Wizard_StepLookback_Lookback_Days")}
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="form-control form-control-sm"
                  style={rightInput}
                  disabled={flowMode !== "custom"}
                  value={flowDays}
                  onChange={(e) => set({ flowLookbackDays: e.target.value })}
                />
              </div>

              <div style={row}>
                <div className="form-check m-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="lb-flow-da"
                    name="lb-flow-mode"
                    checked={flowMode === "da"}
                    onChange={() => set({ flowLookbackMode: "da" })}
                  />
                  <label className="form-check-label ms-1" htmlFor="lb-flow-da">
                    {t("FloodTypeClass_Wizard_StepLookback_Lookback_Ceiling")}
                  </label>
                </div>
                <div className={rightLabel}>
                  {t("FloodTypeClass_Wizard_StepLookback_Lookback_DrainageArea")}
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-control form-control-sm"
                  style={rightInput}
                  disabled={flowMode !== "da"}
                  value={flowDA}
                  onChange={(e) => set({ flowDrainageArea: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SWE */}
          <div className="mb-3">
            <div className="mb-1">
              {t("FloodTypeClass_Wizard_StepLookback_SWELabel")}
            </div>
            <div style={rowsIndent}>
              <div style={row}>
                <div className="form-check m-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="lb-swe-custom"
                    name="lb-swe-mode"
                    checked={sweMode === "custom"}
                    onChange={() => set({ sweLookbackMode: "custom" })}
                  />
                  <label className="form-check-label ms-1" htmlFor="lb-swe-custom">
                    {t("FloodTypeClass_Wizard_StepLookback_Lookback_UserSpecified")}
                  </label>
                </div>
                <div className={rightLabel}>
                  {t("FloodTypeClass_Wizard_StepLookback_Lookback_Days")}
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="form-control form-control-sm"
                  style={rightInput}
                  disabled={sweMode !== "custom"}
                  value={sweDays}
                  onChange={(e) => set({ sweLookbackDays: e.target.value })}
                />
              </div>

              <div style={row}>
                <div className="form-check m-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="lb-swe-da"
                    name="lb-swe-mode"
                    checked={sweMode === "da"}
                    onChange={() => set({ sweLookbackMode: "da" })}
                  />
                  <label className="form-check-label ms-1" htmlFor="lb-swe-da">
                    {t("FloodTypeClass_Wizard_StepLookback_Lookback_Ceiling")}
                  </label>
                </div>
                <div className={rightLabel}>
                  {t("FloodTypeClass_Wizard_StepLookback_Lookback_DrainageArea")}
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-control form-control-sm"
                  style={rightInput}
                  disabled={sweMode !== "da"}
                  value={sweDA}
                  onChange={(e) => set({ sweDrainageArea: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* PRECIP */}
          <div className="mb-2">
            <div className="mb-1">
              {t("FloodTypeClass_Wizard_StepLookback_PrecipLabel")}
            </div>
            <div style={rowsIndent}>
              <div style={row}>
                <div className="form-check m-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="lb-prcp-custom"
                    name="lb-prcp-mode"
                    checked={prcpMode === "custom"}
                    onChange={() => set({ precipLookbackMode: "custom" })}
                  />
                  <label className="form-check-label ms-1" htmlFor="lb-prcp-custom">
                    {t("FloodTypeClass_Wizard_StepLookback_Lookback_UserSpecified")}
                  </label>
                </div>
                <div className={rightLabel}>
                  {t("FloodTypeClass_Wizard_StepLookback_Lookback_Days")}
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="form-control form-control-sm"
                  style={rightInput}
                  disabled={prcpMode !== "custom"}
                  value={prcpDays}
                  onChange={(e) => set({ precipLookbackDays: e.target.value })}
                />
              </div>

              <div style={row}>
                <div className="form-check m-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="lb-prcp-da"
                    name="lb-prcp-mode"
                    checked={prcpMode === "da"}
                    onChange={() => set({ precipLookbackMode: "da" })}
                  />
                  <label className="form-check-label ms-1" htmlFor="lb-prcp-da">
                    {t("FloodTypeClass_Wizard_StepLookback_Lookback_Ceiling")}
                  </label>
                </div>
                <div className={rightLabel}>
                  {t("FloodTypeClass_Wizard_StepLookback_Lookback_DrainageArea")}
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-control form-control-sm"
                  style={rightInput}
                  disabled={prcpMode !== "da"}
                  value={prcpDA}
                  onChange={(e) => set({ precipDrainageArea: e.target.value })}
                />
              </div>
            </div>
          </div>
        </>
      );
    },
  };
}

/** ===== Review Inputs ===== */
export function makeReviewInputsStep({ GeneralInfoSummary }) {
  return {
    label: L("FloodTypeClass_Wizard_StepReview"),
    render: ({ name, description, selectedDataset, bag }) => (
      <div className="p-2">
        <h6 className="mb-3">{L("Wizard_Summary_Title")}</h6>

        <GeneralInfoSummary
          name={name}
          description={description}
          selectedDataset={selectedDataset}
        />

        <FlowDataSourceSummary bag={bag} />
        <FloodTypeSummary bag={bag} />
        <DataSourcesSummary bag={bag} />
        <ThresholdsSummary bag={bag} />
      </div>
    ),
  };
}

/** ===== Results ===== */
export function makeResultsStep() {
  return {
    label: L("FloodTypeClass_Wizard_StepResults"),
    render: () => (
      <div className="p-2">
        {L("FloodTypeClass_Results_Placeholder")}
      </div>
    ),
  };
}
