import React, { useMemo, useEffect, useState, useContext } from "react";
import WizardLayoutSidebar from "./WizardLayoutSidebar.jsx";
import WizardNavigation from "../../common/WizardNavigation.jsx";
import { componentMetadata } from "../../../utils/componentMetadata.js";
import { StyleContext } from "../../../styles/StyleContext.jsx";

/**
 * WizardRunner
 * Props:
 *  - type, id
 *  - data, analyses
 *  - defaultDatasetKey
 *  - steps: WizardStep[]
 *  - buildResult(ctx)
 *  - validateNext?(ctx, stepNumber)
 *  - onFinish(type, result, id)
 *  - onRemove()
 */
export default function WizardRunner(props) {
  const {
    type,
    id,
    data = {},
    analyses = {},
    defaultDatasetKey = "Discharge",
    steps = [],
    buildResult,
    validateNext,
    onFinish,
    onRemove,
  } = props;

  const { componentBackgroundStyle } = useContext(StyleContext);

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
      const found = datasetList.find((d) => d.name === selectedDataset);
      setDescription((prev) => (prev ? prev : (found?.description || "")));
    }
  }, [selectedDataset, datasetList]);

  const displayType = componentMetadata?.[type]?.entityName ?? type;
  const existingNames = useMemo(
    () => ((analyses && analyses[displayType]) || []).map((a) => (a.name || "").trim().toLowerCase()),
    [analyses, displayType]
  );

  const nameTrimmed = name.trim().toLowerCase();
  const isDuplicateName = nameTrimmed.length > 0 && existingNames.includes(nameTrimmed);

  const ctx = {
    step, setStep,
    name, setName,
    description, setDescription,
    selectedDataset, setSelectedDataset,
    datasetList,
    bag, setBag,
    type, id,
  };

  const current = steps[step - 1];
  const perStepInvalid = typeof current?.validate === "function" && !current.validate(ctx);

  const disableNext =
    (step === 1 && (isDuplicateName || !nameTrimmed)) ||
    perStepInvalid ||
    (typeof validateNext === "function" && !validateNext(ctx, step));

  function handleFinish(e) {
    e.preventDefault();
    if (typeof buildResult !== "function") return;
    const result = buildResult(ctx);
    onFinish?.(type, result, id);
    onRemove?.();
  }

  const sidebarSteps = steps.map((s) => ({ label: s.label }));
  const active0 = step - 1;

  const handleStepClick = (i) => {
    // basic rule: can go back freely; restrict forward if needed
    if (i <= active0) setStep(i + 1);
  };

  const footer = (
    <WizardNavigation
      step={step}
      setStep={setStep}
      numSteps={steps.length}
      onFinish={handleFinish}
      disableNext={!!disableNext}
      onCancel={() => onRemove?.(id)}
    />
  );

  return (
    <div className={`wizard-fixed-size card ${componentBackgroundStyle}`}>
      <WizardLayoutSidebar
        steps={sidebarSteps}
        active={active0}
        onStepClick={handleStepClick}
        footer={footer}
      >
        {current?.render(ctx)}
      </WizardLayoutSidebar>
    </div>
  );
}
