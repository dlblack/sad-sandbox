import React from "react";
import type { WizardStep, WizardCtx } from "../../components/WizardRunner";
import { TextStore } from "../../../../utils/TextStore";
import {List, Stack, Text} from "@mantine/core";

const L = (k: string) => TextStore.interface?.(k) ?? "";

const PRESETS = [
    "FloodTypeClass_Wizard_StepFloodTypeClass_HumidEastDelawareRiver",
    "FloodTypeClass_Wizard_StepFloodTypeClass_HumidEastTrinityRiver",
    "FloodTypeClass_Wizard_StepFloodTypeClass_MountainousWestPugetSound",
    "FloodTypeClass_Wizard_StepFloodTypeClass_MountainousWestUpperColoradoRiver",
    "FloodTypeClass_Wizard_StepFloodTypeClass_CentralPlainsRedRiver",
    "FloodTypeClass_Wizard_StepFloodTypeClass_CentralPlainsIowaRiver"
];

export default function makeFloodTypeStep(): WizardStep {
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

export function FloodTypeSummary({ bag }: { bag: Record<string, unknown> }) {
    const none = <em>{TextStore.interface("Wizard_Summary_None")}</em>;
    return (
        <Stack gap="xs">
            <Text fw={600}>{L("FloodTypeClass_Wizard_StepFloodTypeClass")}</Text>
            <List>
                <List.Item>
                    <Text size="sm">
                        <strong>{L("FloodTypeClass_Wizard_StepFloodTypeClass")}</strong>{" "}
                        {(bag as any).floodTypePreset || none}
                    </Text>
                </List.Item>
            </List>
        </Stack>
    );
}
