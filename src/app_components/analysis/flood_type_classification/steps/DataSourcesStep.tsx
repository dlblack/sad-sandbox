import React from "react";
import type { WizardStep, WizardCtx } from "../../components/WizardRunner";
import {
    FlowTimeSeriesComboBox,
    PrecipTimeSeriesComboBox,
    SweTimeSeriesComboBox,
} from "../../components/inputs/TimeSeriesComboBoxes";
import { TextStore } from "../../../../utils/TextStore";

const L = (k: string) => TextStore.interface?.(k) ?? "";

export default function makeDataSourcesStep(): WizardStep {
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

                    <label htmlFor="ft_flow_ts">
                        {TextStore.interface?.("FloodTypeClass_Wizard_StepFlowData_TimeSeries")}
                    </label>
                    <FlowTimeSeriesComboBox
                        id="ft_flow_ts"
                        style={inputNarrow}
                        datasets={datasets}
                        value={(bag as any).flowTimeSeries as string}
                        onChange={(val: string) => set({ flowTimeSeries: val })}
                    />

                    <label htmlFor="ft_precip">
                        {L("FloodTypeClass_Wizard_StepDataSources_PrecipTS")}
                    </label>
                    <PrecipTimeSeriesComboBox
                        id="ft_precip"
                        style={inputNarrow}
                        datasets={precipList}
                        value={(bag as any).precipTimeSeries as string}
                        onChange={(val: string) => set({ precipTimeSeries: val })}
                    />

                    <label htmlFor="ft_swe">
                        {L("FloodTypeClass_Wizard_StepDataSources_SweTS")}
                    </label>
                    <SweTimeSeriesComboBox
                        id="ft_swe"
                        style={inputNarrow}
                        datasets={sweList}
                        value={(bag as any).sweTimeSeries as string}
                        onChange={(val: string) => set({ sweTimeSeries: val })}
                    />
                </div>
            );
        },
    };
}
