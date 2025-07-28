import React, {useContext, useEffect, useState} from "react";
import {StyleContext} from "../../styles/StyleContext";
import WizardNavigation from "../common/WizardNavigation.jsx";
import {dockableTitles} from "@/utils/dockableTitles.js";

function BalancedHydrographAnalysisWizard(props) {
  const {
    componentBackgroundStyle
  } = useContext(StyleContext);

  const {
    data = {},
    analyses = {},
    type,
    id,
    onFinish,
    onRemove,
    stepsConfig = [], // [{ label, content: JSX, validate?: fn }]
    defaultDatasetKey = "Discharge"
  } = props;

  const datasetList = data?.[defaultDatasetKey] || [];
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");

  useEffect(() => {
    if (datasetList.length > 0 && !selectedDataset) {
      setSelectedDataset(datasetList[0].name);
    }
  }, [datasetList, selectedDataset]);

  useEffect(() => {
    if (datasetList.length > 0 && selectedDataset) {
      const found = datasetList.find(item => item.name === selectedDataset);
      setDescription(found?.description || "");
    }
  }, [selectedDataset, datasetList]);

  const displayType = dockableTitles[type] || type;
  const existingNames = (analyses[displayType] || []).map(a => (a.name || "").trim().toLowerCase());
  const nameTrimmed = name.trim().toLowerCase();
  const isDuplicateName = nameTrimmed.length > 0 && existingNames.includes(nameTrimmed);

  const handleFinish = (e) => {
    e.preventDefault();
    onFinish?.(type, { name, description, selectedDataset }, id);
    onRemove?.();
  };

  return (
    <div className={`wizard-fixed-size card p-3 ${componentBackgroundStyle}`}>
      <form
        className="d-flex flex-column h-100"
        style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
        onSubmit={e => e.preventDefault()}
      >
        {step >= 2 && (
          <div className="mb-4">
            <div className="wizard-circles-row">
              {stepsConfig.map((stepObj, idx) => {
                const isFilled = step === idx + 2;
                return (
                  <div key={idx} className="wizard-circle-container">
                    <div className={`wizard-circle ${isFilled ? "filled" : "unfilled"}`}>
                      {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="wizard-labels-row">
              {stepsConfig.map((stepObj, idx) => (
                <div key={idx} className="wizard-label">
                  {stepObj.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
          {stepsConfig[step - 1]?.content({
            name,
            setName,
            description,
            setDescription,
            selectedDataset,
            setSelectedDataset,
            datasetList
          })}
        </div>

        <div className="wizard-footer">
          <WizardNavigation
            step={step}
            setStep={setStep}
            numSteps={stepsConfig.length}
            onFinish={handleFinish}
            disableNext={step === 1 && (isDuplicateName || !nameTrimmed)}
          />
        </div>
      </form>
    </div>
  );
}

export default BalancedHydrographAnalysisWizard;
