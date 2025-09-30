import React from "react";
import { TextStore } from "../../../../utils/TextStore.js";

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
          <input
            id="wiz_name"
            className="form-control form-control-sm font-xs"
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
          <textarea
            id="wiz_desc"
            className="form-control font-xs"
            rows={3}
            placeholder={
              TextStore.interface?.("Wizard_DescriptionPlaceholder")
            }
            value={ctx.description}
            onChange={(e) => ctx.setDescription(e.target.value)}
          />
        </div>

        {/* Dataset (if any) */}
        {Array.isArray(ctx.datasetList) && ctx.datasetList.length > 0 && (
          <>
            <label htmlFor="wiz_dataset" className="wizard-grid-label">
              {TextStore.interface?.("Wizard_Dataset")}
            </label>
            <div className="wizard-grid-field">
              <select
                id="wiz_dataset"
                className="form-select font-xs"
                value={ctx.selectedDataset}
                onChange={(e) => ctx.setSelectedDataset(e.target.value)}
              >
                {ctx.datasetList.map((item, idx) => (
                  <option key={idx} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
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
    <>
      <div className="mb-2">
        <strong>{TextStore.interface("Wizard_GeneralInfo")}</strong>
      </div>
      <ul className="list-unstyled mb-2 font-xs">
        <li>
          <strong>{TextStore.interface("Wizard_Summary_Name")}</strong>
          {name || <em>{TextStore.interface("Wizard_Summary_None")}</em>}
        </li>
        <li>
          <strong>{TextStore.interface("Wizard_Summary_Description")}</strong>
          {description || <em>{TextStore.interface("Wizard_Summary_None")}</em>}
        </li>
        <li>
          <strong>{TextStore.interface("Wizard_Summary_Dataset")}</strong>
          {selectedDataset || <em>{TextStore.interface("Wizard_Summary_None")}</em>}
        </li>
      </ul>
    </>
  );
}
