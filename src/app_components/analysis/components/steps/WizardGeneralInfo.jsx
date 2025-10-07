import React from "react";
import { TextStore } from "../../../../utils/TextStore.js";
import { Select, Stack, Text, Textarea, TextInput } from "@mantine/core";

/**
 * Input step for General Info (name, description, dataset).
 * Uses the same wizard-grid layout as other steps.
 */
export function makeWizardGeneralInfoStep() {
  const LABEL = TextStore.interface?.("Wizard_GeneralInfo");

  return {
    key: "general-info",
    label: LABEL,
    render: (ctx) => (
      <div className="wizard-grid">
        {/* Name */}
        <label htmlFor="wiz_name" className="wizard-grid-label">
          {TextStore.interface?.("Wizard_Name")}
        </label>
        <div className="wizard-grid-field">
          <TextInput
            id="wiz_name"
            size="xs"
            type="text"
            value={ctx.name}
            maxLength={20}
            onChange={(e) => ctx.setName(e.target.value)}
          />
        </div>

        {/* Description */}
        <label htmlFor="wiz_desc" className="wizard-grid-label align-start">
          {TextStore.interface?.("Wizard_Description")}
        </label>
        <div className="wizard-grid-field align-start">
          <Textarea
            id="wiz_desc"
            rows={3}
            size="xs"
            placeholder={TextStore.interface?.("Wizard_DescriptionPlaceholder")}
            value={ctx.description}
            onChange={(e) => ctx.setDescription(e.target.value)}
          />
        </div>

        {/* Dataset */}
        {Array.isArray(ctx.datasetList) && ctx.datasetList.length > 0 && (
          <>
            <label htmlFor="wiz_dataset" className="wizard-grid-label">
              {TextStore.interface?.("Wizard_Dataset")}
            </label>
            <div className="wizard-grid-field">
              <Select
                id="wiz_dataset"
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

/**
 * Summary block for General Info to embed in the final step.
 */
export function GeneralInfoSummary({ name, description, selectedDataset }) {
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
        <Text size="sm">
          <strong>{TextStore.interface("Wizard_Summary_Dataset")}</strong>{" "}
          {selectedDataset || <em>{TextStore.interface("Wizard_Summary_None")}</em>}
        </Text>
      </Stack>
    </Stack>
  );
}
