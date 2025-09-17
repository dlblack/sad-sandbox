import React, { useContext, useEffect, useMemo, useState } from "react";
import { StyleContext } from "../../styles/StyleContext";
import WizardNavigation from "../common/WizardNavigation.jsx";
import { componentMetadata } from "../../utils/componentMetadata";
import { TextStore } from "../../utils/TextStore.js";

export default function GenericWizard(props) {
  const { componentBackgroundStyle } = useContext(StyleContext);

  const {
    type,
    id,
    data = {},
    analyses = {},
    onFinish,
    onRemove,
    defaultDatasetKey = "Discharge",
    includeGeneralInfo = true,
    steps = [],
    buildResult,
    validateNext,
  } = props;

  const datasetList = data?.[defaultDatasetKey] || [];
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [bag, setBag] = useState({});

  useEffect(() => {
    if (datasetList.length > 0 && !selectedDataset) {
      setSelectedDataset(datasetList[0].name);
    }
  }, [datasetList, selectedDataset]);

  useEffect(() => {
    if (datasetList.length > 0 && selectedDataset) {
      const found = datasetList.find((item) => item.name === selectedDataset);
      setDescription((prev) => (prev && prev.length > 0 ? prev : (found?.description || "")));
    }
  }, [selectedDataset, datasetList]);

  const displayType = componentMetadata?.[type]?.entityName ?? type;
  const existingNames = useMemo(
    () => ((analyses && analyses[displayType]) || []).map((a) => (a.name || "").trim().toLowerCase()),
    [analyses, displayType]
  );

  const nameTrimmed = name.trim().toLowerCase();
  const isDuplicateName = nameTrimmed.length > 0 && existingNames.includes(nameTrimmed);

  const allSteps = useMemo(() => {
    if (!includeGeneralInfo) return steps;

    const generalInfoStep = {
      label: TextStore.interface?.("Wizard_GeneralInfo") || "General Info",
      render: (ctx) => (
        <div className="manual-entry-content">
          <legend>{TextStore.interface?.("Wizard_GeneralInfo") || "General Info"}</legend>
          <hr />

          {/* Name */}
          <div className="form-group row align-items-center mb-2">
            <label
              htmlFor="wiz_name"
              className="col-auto col-form-label wizard-label-fixed"
            >
              {TextStore.interface?.("Wizard_Name") || "Name"}
            </label>
            <div className="col">
              <input
                id="wiz_name"
                className="form-control form-control-sm font-xs"
                type="text"
                value={ctx.name}
                maxLength={20}
                onChange={(e) => ctx.setName(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group row align-items-center mb-2">
            <label
              htmlFor="wiz_desc"
              className="col-auto col-form-label wizard-label-fixed"
            >
              {TextStore.interface?.("Wizard_Description") || "Description"}
            </label>
            <div className="col">
              <textarea
                id="wiz_desc"
                className="form-control font-xs"
                rows={3}
                placeholder={TextStore.interface?.("Wizard_DescriptionPlaceholder") || "Describe this analysis..."}
                value={ctx.description}
                onChange={(e) => ctx.setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Dataset (if available) */}
          {datasetList.length > 0 && (
            <div className="form-group row align-items-center mb-2">
              <label
                htmlFor="wiz_dataset"
                className="col-auto col-form-label wizard-label-fixed"
              >
                {TextStore.interface?.("Wizard_Dataset") || "Dataset"}
              </label>
              <div className="col">
                <select
                  id="wiz_dataset"
                  className="form-select font-xs"
                  value={ctx.selectedDataset}
                  onChange={(e) => ctx.setSelectedDataset(e.target.value)}
                >
                  {datasetList.map((item, idx) => (
                    <option key={idx} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      ),
    };

    return [generalInfoStep, ...steps];
  }, [includeGeneralInfo, steps, datasetList]);

  const progressLabels = allSteps.map((s) => s.label);

  const disableNext =
    (step === 1 && includeGeneralInfo && (isDuplicateName || !nameTrimmed)) ||
    (typeof validateNext === "function" && !validateNext(getCtx(), step));

  function getCtx() {
    return {
      step,
      setStep,
      name,
      setName,
      description,
      setDescription,
      selectedDataset,
      setSelectedDataset,
      datasetList,
      isDuplicateName,
      bag,
      setBag,
      type,
      id,
    };
  }

  function handleFinish(e) {
    e.preventDefault();
    if (typeof buildResult !== "function") return;
    const result = buildResult(getCtx());
    onFinish?.(type, result, id);
    onRemove?.();
  }

  return (
    <div className={`wizard-fixed-size card p-3 ${componentBackgroundStyle}`}>
      <form className="d-flex flex-column h-100" onSubmit={(e) => e.preventDefault()}>
        {progressLabels.length > 1 && (
          <div className="mb-4">
            {/* Circles row */}
            <div className="wizard-circles-row">
              {progressLabels.map((_, idx) => {
                const isFilled = step === idx + 1;
                return (
                  <div key={idx} className="wizard-circle-container">
                    <div className={`wizard-circle ${isFilled ? "filled" : "unfilled"}`}>{idx + 1}</div>
                  </div>
                );
              })}
            </div>
            {/* Labels row */}
            <div className="wizard-labels-row">
              {progressLabels.map((label, idx) => (
                <div key={idx} className="wizard-label">
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="flex-grow-1 d-flex flex-column">
          {allSteps[step - 1]?.render(getCtx())}
        </div>

        <div className="wizard-footer">
          <WizardNavigation
            step={step}
            setStep={setStep}
            numSteps={allSteps.length}
            onFinish={handleFinish}
            disableNext={!!disableNext}
          />
        </div>
      </form>
    </div>
  );
}
