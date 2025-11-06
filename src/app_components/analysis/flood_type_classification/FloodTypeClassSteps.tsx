import React from "react";
import type { WizardStep, WizardCtx } from "../components/WizardRunner";
import {
    FlowTimeSeriesComboBox,
    PrecipTimeSeriesComboBox,
    SweTimeSeriesComboBox
} from "../components/inputs/TimeSeriesComboBoxes";
import { TextStore } from "../../../utils/TextStore";
import TimeField from "../../common/TimeField";
import { DateInput } from '@mantine/dates';

const L = (k: string) => TextStore.interface?.(k) ?? "";

export function makeFlowDataSourceStep(): WizardStep {
    return {
        label: TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData") ?? "Flow data",
        render: (ctx: WizardCtx) => {
            const { bag, setBag} = ctx as any;
            const inputNarrow: React.CSSProperties = { width: "50ch" };


            const set = (patch: Record<string, unknown>) =>
                setBag((prev: Record<string, unknown>) => ({ ...(prev as Record<string, unknown>), ...patch }));

            return (
                <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ fontWeight: 600, paddingBottom: 8 }}>
                        {TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_Label")}
                    </div>

                    <label htmlFor="ft_start_date">{TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_StartDate")}</label>
                    <DateInput
                        value={(bag as any).classStartDate ? new Date((bag as any).classStartDate) : null}
                        onChange={(d) => set({ classStartDate: d ? d.toString().slice(0, 10) : "" })}
                        placeholder="mm/dd/yyyy"
                        aria-label="Classification Start Date"
                        style={inputNarrow}
                    />

                    <label htmlFor="ft_start_time">{TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_StartTime")}</label>
                    <TimeField
                        id="ft_start_time"
                        style={inputNarrow}
                        value={((bag as any).classStartTime as string) ?? ""}
                        onValueChange={(val: string) => set({ classStartTime: val })}
                    />

                    <label htmlFor="ft_end_date">{TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_EndDate")}</label>
                    <DateInput
                        value={(bag as any).classStartDate ? new Date((bag as any).classStartDate) : null}
                        onChange={(d) => set({ classStartDate: d ? d.toString().slice(0, 10) : "" })}
                        placeholder="mm/dd/yyyy"
                        aria-label="Classification End Date"
                        style={inputNarrow}
                    />

                    <label htmlFor="ft_end_time">{TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_EndTime")}</label>
                    <TimeField
                        id="ft_end_time"
                        style={inputNarrow}
                        value={((bag as any).classEndTime as string) ?? ""}
                        onValueChange={(val: string) => set({ classEndTime: val })}
                    />
                </div>
            );
        }
    };
}

const PRESETS = [
    "FloodTypeClass_Wizard_StepFloodTypeClass_HumidEastDelawareRiver",
    "FloodTypeClass_Wizard_StepFloodTypeClass_HumidEastTrinityRiver",
    "FloodTypeClass_Wizard_StepFloodTypeClass_MountainousWestPugetSound",
    "FloodTypeClass_Wizard_StepFloodTypeClass_MountainousWestUpperColoradoRiver",
    "FloodTypeClass_Wizard_StepFloodTypeClass_CentralPlainsRedRiver",
    "FloodTypeClass_Wizard_StepFloodTypeClass_CentralPlainsIowaRiver"
];

export function makeFloodTypeStep(): WizardStep {
    return {
        label: L("FloodTypeClass_Wizard_StepFloodTypeClass") || "Classification",
        render: (ctx: WizardCtx) => {
            const { bag, setBag } = ctx;
            const set = (patch: Record<string, unknown>) =>
                setBag((prev) => ({ ...(prev as Record<string, unknown>), ...patch }));
            const sel = ((bag as any).floodTypePreset as string) || "";

            return (
                <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontWeight: 600, paddingBottom: 8 }}>
                        {L("FloodTypeClass_Wizard_StepFloodTypeClass_Label")}
                    </div>

                    {PRESETS.map((key, i) => {
                        const labelText = L(key) || key;
                        const id = `ft_preset_${i}`;
                        return (
                            <label key={id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input
                                    type="radio"
                                    name="ft_preset"
                                    value={labelText}
                                    checked={sel === labelText}
                                    onChange={(e) => set({ floodTypePreset: e.target.value })}
                                />
                                <span>{labelText}</span>
                            </label>
                        );
                    })}
                </div>
            );
        }
    };
}

export function makeDataSourcesStep(): WizardStep {
    return {
        label: L("FloodTypeClass_Wizard_StepDataSources"),
        render: (ctx: WizardCtx) => {
            const { bag, setBag, data = {} as Record<string, unknown> } = ctx as any;
            const inputNarrow: React.CSSProperties = { width: "50ch" };
            const precipList = (data as any).Precipitation ?? [];
            const sweList = (data as any).SWE ?? (data as any)["Snow Water Equivalent"] ?? [];
            const datasets = (data as any)?.Discharge ?? [];

            const set = (patch: Record<string, unknown>) =>
                setBag((prev: Record<string, unknown>) => ({ ...(prev as Record<string, unknown>), ...patch }));

            return (
                <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ fontWeight: 600, paddingBottom: 8 }}>
                        {L("FloodTypeClass_Wizard_StepDataSources_Label")}
                    </div>

                    <label htmlFor="ft_flow_ts">{TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_TimeSeries")}</label>
                    <FlowTimeSeriesComboBox
                        id="ft_flow_ts"
                        style={inputNarrow}
                        datasets={datasets}
                        value={(bag as any).flowTimeSeries as string}
                        onChange={(val: string) => set({ flowTimeSeries: val })}
                    />

                    <label htmlFor="ft_precip">{L("FloodTypeClass_Wizard_StepDataSources_PrecipTS")}</label>
                    <PrecipTimeSeriesComboBox
                        id="ft_precip"
                        style={inputNarrow}
                        datasets={precipList}
                        value={(bag as any).precipTimeSeries as string}
                        onChange={(val: string) => set({ precipTimeSeries: val })}
                    />

                    <label htmlFor="ft_swe">{L("FloodTypeClass_Wizard_StepDataSources_SweTS")}</label>
                    <SweTimeSeriesComboBox
                        id="ft_swe"
                        style={inputNarrow}
                        datasets={sweList}
                        value={(bag as any).sweTimeSeries as string}
                        onChange={(val: string) => set({ sweTimeSeries: val })}
                    />
                </div>
            );
        }
    };
}

export function makeThresholdsStep(): WizardStep {
    return {
        label: L("FloodTypeClass_Wizard_StepThresholds") || "Thresholds",
        render: (ctx: WizardCtx) => {
            const { bag, setBag } = ctx;
            const inputNarrow: React.CSSProperties = { width: "10ch" };
            const set = (patch: Record<string, unknown>) =>
                setBag((prev) => ({ ...(prev as Record<string, unknown>), ...patch }));

            return (
                <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ fontWeight: 600, paddingBottom: 8 }}>
                        {L("FloodTypeClass_Wizard_StepThresholds_Label")}
                    </div>

                    <label htmlFor="ft_thr_precip">{L("FloodTypeClass_Wizard_StepThresholds_Precip")}</label>
                    <input
                        id="ft_thr_precip"
                        type="number"
                        step="0.0001"
                        min="0"
                        style={inputNarrow}
                        value={((bag as any).thrPrecipAccumIn as string) ?? ""}
                        onChange={(e) => set({ thrPrecipAccumIn: e.target.value })}
                    />

                    <label htmlFor="ft_thr_swe">{L("FloodTypeClass_Wizard_StepThresholds_SWE")}</label>
                    <input
                        id="ft_thr_swe"
                        type="number"
                        step="0.0001"
                        min="0"
                        style={inputNarrow}
                        value={((bag as any).thrSWEDepletionIn as string) ?? ""}
                        onChange={(e) => set({ thrSWEDepletionIn: e.target.value })}
                    />

                    <label htmlFor="ft_thr_snowfrac">{L("FloodTypeClass_Wizard_StepThresholds_SnowmeltFrac")}</label>
                    <input
                        id="ft_thr_snowfrac"
                        type="number"
                        step="0.0001"
                        min="0"
                        max="1"
                        style={inputNarrow}
                        value={((bag as any).thrSnowmeltFrac as string) ?? ""}
                        onChange={(e) => set({ thrSnowmeltFrac: e.target.value })}
                    />

                    <label htmlFor="ft_thr_rainfrac">{L("FloodTypeClass_Wizard_StepThresholds_RainFrac")}</label>
                    <input
                        id="ft_thr_rainfrac"
                        type="number"
                        step="0.0001"
                        min="0"
                        max="1"
                        style={inputNarrow}
                        value={((bag as any).thrRainFrac as string) ?? ""}
                        onChange={(e) => set({ thrRainFrac: e.target.value })}
                    />
                </div>
            );
        }
    };
}

export function makeLookbackStep(): WizardStep {
    return {
        label: L("FloodTypeClass_Wizard_StepLookback") || "Lookback",
        render: (ctx: WizardCtx) => {
            const { bag, setBag } = ctx;
            const set = (patch: Record<string, unknown>) =>
                setBag((prev) => ({ ...(prev as Record<string, unknown>), ...patch }));

            const flowMode = ((bag as any).flowLookbackMode as string) || "custom";
            const flowDays = ((bag as any).flowLookbackDays as string) ?? "";
            const flowDA = ((bag as any).flowDrainageArea as string) ?? "";

            const sweMode = ((bag as any).sweLookbackMode as string) || "custom";
            const sweDays = ((bag as any).sweLookbackDays as string) ?? "";
            const sweDA = ((bag as any).sweDrainageArea as string) ?? "";

            const prcpMode = ((bag as any).precipLookbackMode as string) || "custom";
            const prcpDays = ((bag as any).precipLookbackDays as string) ?? "";
            const prcpDA = ((bag as any).precipDrainageArea as string) ?? "";

            const rowsIndent: React.CSSProperties = { marginLeft: 24 };
            const row: React.CSSProperties = {
                display: "grid",
                gridTemplateColumns: "1fr 160px 220px",
                alignItems: "center",
                columnGap: 12,
                maxWidth: 760,
                marginBottom: 6
            };
            const rightLabel: React.CSSProperties = { justifySelf: "end", paddingRight: 4, textAlign: "right" };
            const rightInput: React.CSSProperties = { width: "20ch", justifySelf: "end" };

            return (
                <div style={{ display: "grid", gap: 16 }}>
                    <div style={{ fontWeight: 600 }}>{L("FloodTypeClass_Wizard_StepLookback_Label")}</div>

                    <div>
                        <div style={{ marginBottom: 6 }}>{L("FloodTypeClass_Wizard_StepLookback_Flow_Label")}</div>
                        <div style={rowsIndent}>
                            <div style={row}>
                                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <input
                                        type="radio"
                                        name="lb_flow_mode"
                                        checked={flowMode === "custom"}
                                        onChange={() => set({ flowLookbackMode: "custom" })}
                                    />
                                    <span>{L("FloodTypeClass_Wizard_StepLookback_Lookback_UserSpecified")}</span>
                                </label>
                                <div style={rightLabel}>{L("FloodTypeClass_Wizard_StepLookback_Lookback_Days")}</div>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    style={rightInput}
                                    disabled={flowMode !== "custom"}
                                    value={flowDays}
                                    onChange={(e) => set({ flowLookbackDays: e.target.value })}
                                />
                            </div>

                            <div style={row}>
                                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <input
                                        type="radio"
                                        name="lb_flow_mode"
                                        checked={flowMode === "da"}
                                        onChange={() => set({ flowLookbackMode: "da" })}
                                    />
                                    <span>{L("FloodTypeClass_Wizard_StepLookback_Lookback_Ceiling")}</span>
                                </label>
                                <div style={rightLabel}>{L("FloodTypeClass_Wizard_StepLookback_Lookback_DrainageArea")}</div>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    style={rightInput}
                                    disabled={flowMode !== "da"}
                                    value={flowDA}
                                    onChange={(e) => set({ flowDrainageArea: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ marginBottom: 6 }}>{L("FloodTypeClass_Wizard_StepLookback_SWELabel")}</div>
                        <div style={rowsIndent}>
                            <div style={row}>
                                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <input
                                        type="radio"
                                        name="lb_swe_mode"
                                        checked={sweMode === "custom"}
                                        onChange={() => set({ sweLookbackMode: "custom" })}
                                    />
                                    <span>{L("FloodTypeClass_Wizard_StepLookback_Lookback_UserSpecified")}</span>
                                </label>
                                <div style={rightLabel}>{L("FloodTypeClass_Wizard_StepLookback_Lookback_Days")}</div>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    style={rightInput}
                                    disabled={sweMode !== "custom"}
                                    value={sweDays}
                                    onChange={(e) => set({ sweLookbackDays: e.target.value })}
                                />
                            </div>

                            <div style={row}>
                                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <input
                                        type="radio"
                                        name="lb_swe_mode"
                                        checked={sweMode === "da"}
                                        onChange={() => set({ sweLookbackMode: "da" })}
                                    />
                                    <span>{L("FloodTypeClass_Wizard_StepLookback_Lookback_Ceiling")}</span>
                                </label>
                                <div style={rightLabel}>{L("FloodTypeClass_Wizard_StepLookback_Lookback_DrainageArea")}</div>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    style={rightInput}
                                    disabled={sweMode !== "da"}
                                    value={sweDA}
                                    onChange={(e) => set({ sweDrainageArea: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ marginBottom: 6 }}>{L("FloodTypeClass_Wizard_StepLookback_PrecipLabel")}</div>
                        <div style={rowsIndent}>
                            <div style={row}>
                                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <input
                                        type="radio"
                                        name="lb_prcp_mode"
                                        checked={prcpMode === "custom"}
                                        onChange={() => set({ precipLookbackMode: "custom" })}
                                    />
                                    <span>{L("FloodTypeClass_Wizard_StepLookback_Lookback_UserSpecified")}</span>
                                </label>
                                <div style={rightLabel}>{L("FloodTypeClass_Wizard_StepLookback_Lookback_Days")}</div>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    style={rightInput}
                                    disabled={prcpMode !== "custom"}
                                    value={prcpDays}
                                    onChange={(e) => set({ precipLookbackDays: e.target.value })}
                                />
                            </div>

                            <div style={row}>
                                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <input
                                        type="radio"
                                        name="lb_prcp_mode"
                                        checked={prcpMode === "da"}
                                        onChange={() => set({ precipLookbackMode: "da" })}
                                    />
                                    <span>{L("FloodTypeClass_Wizard_StepLookback_Lookback_Ceiling")}</span>
                                </label>
                                <div style={rightLabel}>{L("FloodTypeClass_Wizard_StepLookback_Lookback_DrainageArea")}</div>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    style={rightInput}
                                    disabled={prcpMode !== "da"}
                                    value={prcpDA}
                                    onChange={(e) => set({ precipDrainageArea: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    };
}

export function makeReviewInputsStep({
                                         GeneralInfoSummary
                                     }: {
    GeneralInfoSummary: React.ComponentType<{
        name?: string;
        description?: string;
        selectedDataset?: string;
    }>;
}): WizardStep {
    return {
        label: L("FloodTypeClass_Wizard_StepReview"),
        render: ({ name, description, selectedDataset, bag }: WizardCtx) => (
            <div style={{ display: "grid", gap: 12, padding: 8 }}>
                <h6 style={{ marginBottom: 12 }}>{L("Wizard_Summary_Title")}</h6>

                <GeneralInfoSummary name={name} description={description} selectedDataset={selectedDataset} />

                <ul style={{ listStyle: "none", paddingLeft: 0, fontSize: 12 }}>
                    <li>
                        <strong>{L("Wizard_Summary_Dataset")}</strong> {(bag as any).flowTimeSeries as string}
                    </li>
                    <li>
                        <strong>{L("FloodTypeClass_Wizard_StepFlowData_StartDate")}</strong> {(bag as any).classStartDate as string}
                    </li>
                    <li>
                        <strong>{L("FloodTypeClass_Wizard_StepFlowData_StartTime")}</strong> {(bag as any).classStartTime as string}
                    </li>
                    <li>
                        <strong>{L("FloodTypeClass_Wizard_StepFlowData_EndDate")}</strong> {(bag as any).classEndDate as string}
                    </li>
                    <li>
                        <strong>{L("FloodTypeClass_Wizard_StepFlowData_EndTime")}</strong> {(bag as any).classEndTime as string}
                    </li>
                    <li>
                        <strong>{L("FloodTypeClass_Wizard_StepFloodTypeClass")}</strong> {(bag as any).floodTypePreset as string}
                    </li>
                    <li>
                        <strong>{L("FloodTypeClass_Wizard_StepDataSources_PrecipTS")}</strong>{" "}
                        {(bag as any).precipTimeSeries as string}
                    </li>
                    <li>
                        <strong>{L("FloodTypeClass_Wizard_StepDataSources_SweTS")}</strong> {(bag as any).sweTimeSeries as string}
                    </li>
                    <li>
                        <strong>{L("FloodTypeClass_Wizard_StepLookback_PrecipLabel")}</strong>{" "}
                        {(bag as any).thrPrecipAccumIn as string}
                    </li>
                    <li>
                        <strong>{L("FloodTypeClass_Wizard_StepLookback_SWELabel")}</strong>{" "}
                        {(bag as any).thrSWEDepletionIn as string}
                    </li>
                    <li>
                        <strong>{L("FloodTypeClass_Wizard_StepThresholds_SnowmeltFrac")}</strong>{" "}
                        {(bag as any).thrSnowmeltFrac as string}
                    </li>
                    <li>
                        <strong>{L("FloodTypeClass_Wizard_StepThresholds_RainFrac")}</strong>{" "}
                        {(bag as any).thrRainFrac as string}
                    </li>
                </ul>
            </div>
        )
    };
}

export function makeResultsStep(): WizardStep {
    return {
        label: L("FloodTypeClass_Wizard_StepResults"),
        render: () => <div style={{ padding: 8 }}>{L("FloodTypeClass_Results_Placeholder")}</div>
    };
}
