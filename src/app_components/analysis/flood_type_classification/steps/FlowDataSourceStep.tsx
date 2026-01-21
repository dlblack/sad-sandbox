import React from "react";
import type { WizardStep, WizardCtx } from "../../_shared/WizardRunner";
import { FlowTimeSeriesComboBox } from "../../_shared/inputs";
import { TextStore } from "../../../../utils/TextStore";
import TimeField from "../../../common/TimeField";
import { DateInput } from "@mantine/dates";

const L = (k: string) => TextStore.interface?.(k) ?? "";

function toIsoDate(d: Date | string | null) {
  if (!d) return "";

  if (typeof d === "string") {
    const s = d.trim();
    if (!s) return "";

    const dt = new Date(s);
    if (!Number.isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);

    return s.length >= 10 ? s.slice(0, 10) : s;
  }

  return d.toISOString().slice(0, 10);
}

function toDate(v: unknown) {
  if (!v) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === "string" || typeof v === "number") {
    const dt = new Date(v);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

export default function makeFlowDataSourceStep(): WizardStep {
  return {
    label: L("FloodTypeClass_Wizard_StepFlowData") || "Flow data",
    render: (ctx: WizardCtx) => {
      const { bag, setBag, data = {} as Record<string, unknown> } = ctx as any;
      const inputNarrow: React.CSSProperties = { width: "50ch" };
      const datasets = (data as any)?.Discharge ?? [];

      const set = (patch: Record<string, unknown>) =>
        setBag((prev: Record<string, unknown>) => ({ ...(prev as Record<string, unknown>), ...patch }));

      return (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 600, paddingBottom: 8 }}>
            {L("FloodTypeClass_Wizard_StepFlowData_Label")}
          </div>

          <label htmlFor="ft_flow_ts">{L("FloodTypeClass_Wizard_StepFlowData_TimeSeries")}</label>
          <FlowTimeSeriesComboBox
            id="ft_flow_ts"
            style={inputNarrow}
            datasets={datasets}
            value={(bag as any).flowTimeSeries as string}
            onChange={(val: string) => set({ flowTimeSeries: val })}
          />

          <label htmlFor="ft_start_date">{L("FloodTypeClass_Wizard_StepFlowData_StartDate")}</label>
          <DateInput
            value={toDate((bag as any).classStartDate)}
            onChange={(d) => set({ classStartDate: toIsoDate(d) })}
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
            value={toDate((bag as any).classEndDate)}
            onChange={(d) => set({ classEndDate: toIsoDate(d) })}
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
    },
  };
}
