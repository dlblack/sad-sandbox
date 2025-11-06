import React from "react";
import type { WizardStep, WizardCtx } from "../../components/WizardRunner";
import { TextStore } from "../../../../utils/TextStore";

const L = (k: string) => TextStore.interface?.(k) ?? "";
const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 160px 220px",
    alignItems: "center",
    columnGap: 12,
    maxWidth: 760,
    marginBottom: 6,
};

export default function makeThresholdsStep(): WizardStep {
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

                    <div style={rowStyle}>
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
                    </div>

                    <div style={rowStyle}>
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
                    </div>

                    <div style={rowStyle}>
                        <label htmlFor="ft_thr_snowfrac">
                            {L("FloodTypeClass_Wizard_StepThresholds_SnowmeltFrac")}
                        </label>
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
                    </div>

                    <div style={rowStyle}>
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
                </div>
            );
        },
    };
}
