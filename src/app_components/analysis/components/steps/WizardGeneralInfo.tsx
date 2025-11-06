import React from "react";
import { TextStore } from "../../../../utils/TextStore";
import { Select, Stack, Text, Textarea, TextInput } from "@mantine/core";

type Ctx = {
  name?: string;
  description?: string;
  selectedDataset?: string;
  datasetList?: { name: string }[];
  setName: (v: string) => void;
  setDescription: (v: string) => void;
  setSelectedDataset: (v: string) => void;
};

type GeneralInfoOptions = {
    includeDataset?: boolean;
};

export function makeWizardGeneralInfoStep(options?: GeneralInfoOptions) {
    const includeDataset = options?.includeDataset !== false;
    const LABEL = TextStore.interface?.("Wizard_GeneralInfo");

return {
    key: "generalinfo",
    label: LABEL,
    render: (ctx: Ctx) => (
      <div className="wizard-grid">
        <label htmlFor="wizname" className="wizard-grid-label">
          {TextStore.interface?.("Wizard_Name")}
        </label>
        <div className="wizard-grid-field">
          <TextInput
            id="wizname"
            size="xs"
            type="text"
            value={ctx.name || ""}
            maxLength={20}
            onChange={(e) => ctx.setName(e.target.value)}
          />
        </div>

        <label htmlFor="wizdesc" className="wizard-grid-label align-start">
          {TextStore.interface?.("Wizard_Description")}
        </label>
        <div className="wizard-grid-field align-start">
          <Textarea
            id="wizdesc"
            rows={3}
            size="xs"
            placeholder={TextStore.interface?.("Wizard_DescriptionPlaceholder")}
            value={ctx.description || ""}
            onChange={(e) => ctx.setDescription(e.target.value)}
          />
        </div>

        {includeDataset && Array.isArray(ctx.datasetList) && ctx.datasetList.length > 0 && (
          <>
            <label htmlFor="wizdataset" className="wizard-grid-label">
              {TextStore.interface?.("Wizard_Dataset")}
            </label>
            <div className="wizard-grid-field">
              <Select
                id="wizdataset"
                size="xs"
                value={ctx.selectedDataset}
                onChange={(v) => ctx.setSelectedDataset(v || "")}
                data={ctx.datasetList.map((item) => ({
                  label: item.name,
                  value: item.name,
                }))}
              />
            </div>
          </>
        )}
      </div>
    ),
  };
}

export function GeneralInfoSummary({
                                     name,
                                     description,
                                     selectedDataset,
                                     showDataset = true,
                                   }: {
  name?: string;
  description?: string;
  selectedDataset?: string;
  showDataset?: boolean;
}) {
  return (
    <Stack gap="xs">
      <Text fw={600}>{TextStore.interface("Wizard_GeneralInfo")}</Text>
      <Stack gap={2}>
        <Text size="sm">
          <strong>{TextStore.interface("Wizard_Summary_Name")}</strong>{" "}
          {name || <em>{TextStore.interface("Wizard_Summary_None")}</em>}
        </Text>
        <Text size="sm">
          <strong>{TextStore.interface("Wizard_Summary_Description")}</strong>{" "}
          {description || <em>{TextStore.interface("Wizard_Summary_None")}</em>}
        </Text>
      {showDataset && (
        <Text size="sm">
          <strong>{TextStore.interface("Wizard_Summary_Dataset")}</strong>{" "}
            {selectedDataset || <em>{TextStore.interface("Wizard_Summary_None")}</em>}
        </Text>
        )}
      </Stack>
    </Stack>
  );
}
