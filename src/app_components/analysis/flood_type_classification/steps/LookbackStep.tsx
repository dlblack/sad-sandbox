import React from "react";
import type { WizardStep, WizardCtx } from "../../components/WizardRunner";
import { TextStore } from "../../../../utils/TextStore";

const L = (k: string) => TextStore.interface?.(k) ?? "";

export default function makeLookbackStep(): WizardStep {
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
                marginBottom: 6,
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
                                <div style={rightLabel}>
                                    {L("FloodTypeClass_Wizard_StepLookback_Lookback_DrainageArea")}
                                </div>
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
                                <div style={rightLabel}>
                                    {L("FloodTypeClass_Wizard_StepLookback_Lookback_DrainageArea")}
                                </div>
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
        },
    };
}
