import React from "react";
import type { WizardStep, WizardCtx } from "../../components/WizardRunner";
import { TextStore } from "../../../../utils/TextStore";
import TimeField from "../../../common/TimeField";
import { DateInput } from "@mantine/dates";
import {List, Stack, Text} from "@mantine/core";

const L = (k: string) => TextStore.interface?.(k) ?? "";

export default function makeFlowDataSourceStep(): WizardStep {
    return {
        label: L("FloodTypeClass_Wizard_StepFlowData") || "Flow data",
        render: (ctx: WizardCtx) => {
            const { bag, setBag } = ctx as any;
            const inputNarrow: React.CSSProperties = { width: "50ch" };
            const set = (patch: Record<string, unknown>) =>
                setBag((prev: Record<string, unknown>) => ({ ...(prev as Record<string, unknown>), ...patch }));

            return (
                <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ fontWeight: 600, paddingBottom: 8 }}>
                        {L("FloodTypeClass_Wizard_StepFlowData_Label")}
                    </div>

                    <label htmlFor="ft_start_date">{L("FloodTypeClass_Wizard_StepFlowData_StartDate")}</label>
                    <DateInput
                        value={(bag as any).classStartDate ? new Date((bag as any).classStartDate) : null}
                        onChange={(d) => set({ classStartDate: d ? d.toString().slice(0, 10) : "" })}
                        placeholder="mm/dd/yyyy"
                        aria-label="Classification Start Date"
                        style={inputNarrow}
                    />

                    <label htmlFor="ft_start_time">{L("FloodTypeClass_Wizard_StepFlowData_StartTime")}</label>
                    <TimeField
                        id="ft_start_time"
                        style={inputNarrow}
                        value={((bag as any).classStartTime as string) ?? ""}
                        onValueChange={(val: string) => set({ classStartTime: val })}
                    />

                    <label htmlFor="ft_end_date">{L("FloodTypeClass_Wizard_StepFlowData_EndDate")}</label>
                    <DateInput
                        value={(bag as any).classEndDate ? new Date((bag as any).classEndDate) : null}
                        onChange={(d) => set({ classEndDate: d ? d.toString().slice(0, 10) : "" })}
                        placeholder="mm/dd/yyyy"
                        aria-label="Classification End Date"
                        style={inputNarrow}
                    />

                    <label htmlFor="ft_end_time">{L("FloodTypeClass_Wizard_StepFlowData_EndTime")}</label>
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

export function FlowDataSourceSummary({ bag }: { bag: Record<string, unknown> }) {
    const none = <em>{TextStore.interface("Wizard_Summary_None")}</em>;
    return (
        <Stack gap="xs">
            <Text fw={600}>{L("FloodTypeClass_Wizard_StepFlowData")}</Text>
            <List>
                <List.Item>
                    <Text size="sm">
                        <strong>{L("FloodTypeClass_Wizard_StepFlowData_StartDate")}</strong>{" "}
                        {(bag as any).classStartDate || none}
                    </Text>
                </List.Item>
                <List.Item>
                    <Text size="sm">
                        <strong>{L("FloodTypeClass_Wizard_StepFlowData_StartTime")}</strong>{" "}
                        {(bag as any).classStartTime || none}
                    </Text>
                </List.Item>
                <List.Item>
                    <Text size="sm">
                        <strong>{L("FloodTypeClass_Wizard_StepFlowData_EndDate")}</strong>{" "}
                        {(bag as any).classEndDate || none}
                    </Text>
                </List.Item>
                <List.Item>
                    <Text size="sm">
                        <strong>{L("FloodTypeClass_Wizard_StepFlowData_EndTime")}</strong>{" "}
                        {(bag as any).classEndTime || none}
                    </Text>
                </List.Item>
            </List>
        </Stack>
    );
}
