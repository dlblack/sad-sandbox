import React, { useContext, useState } from "react";
import { StyleContext } from "../../styles/StyleContext";
import WizardNavigation from "../common/WizardNavigation.jsx";
import { dockableTitles} from "@/utils/dockableTitles.js";

/**
 * GenericWizardTemplate
 * 
 * Props:
 * - onFinish: function(name, id) - called when the wizard completes.
 * - id: string - (optional) ID of this wizard instance.
 * 
 */
function VolumeFreqAnalysisWizard(props) {
  const { style } = useContext(StyleContext);
  const [step, setStep] = useState(1);

  // Example: Common fields for any wizard
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const displayType = dockableTitles[props.type] || props.type;
  const existingNames = (
    (props.analyses && props.analyses[displayType]) || []
  ).map(a => (a.name || "").trim().toLowerCase());
  const nameTrimmed = name.trim().toLowerCase();
  const isDuplicateName = 
    nameTrimmed.length > 0 &&
    existingNames.includes(nameTrimmed);

  // Wizard Steps Progress Indicator
  const progressSteps = [
    { label: "Step 1" },
    { label: "Step 2" },
    { label: "Step 3" },
    { label: "Summary" },
  ];

  // Handle Wizard Finish (calls parent handler and closes wizard)
  const handleWizardFinish = (e) => {
    e.preventDefault();
    if (props.onFinish) {
      props.onFinish(
        props.type,
        {
          name,
          description,
        },
        props.id                   // id: the unique id for this wizard
      );
    }    
  }; 

  // Example: Render step content
  function renderStep() {
    switch (step) {
      case 1:
        return (
          <>
            <legend>General Information</legend>
            <div className="form-group row align-items-center mb-2">
              <label htmlFor="field1" className="col-auto col-form-label font-xs" style={{ minWidth: 85 }}>
                Name:
              </label>
              <div className="col ps-0">
                <input
                  className="form-control form-control-sm font-xs"
                  type="text"
                  id="field1"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group row align-items-center mb-2">
              <label htmlFor="description" className="col-auto col-form-label font-xs" style={{ minWidth: 85 }}>
                Description:
              </label>
              <div className="col ps-0">
                <textarea
                  className="form-control font-xs"
                  id="description"
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <div>
            {/* TODO: Add step 2 content */}
            <p>Step 2 content goes here.</p>
          </div>
        );
      case 3:
        return (
          <div>
            {/* TODO: Add step 3 content */}
            <p>Step 3 content goes here.</p>
          </div>
        );
      case 4:
        return (
          <div>
            <h6 className="mb-3">Summary</h6>
            <ul className="list-unstyled mb-2 font-xs">
              <li><strong>Name:</strong> {name || <em>(None entered)</em>}</li>
              <li><strong>Description:</strong> {description || <em>(None entered)</em>}</li>
              {/* Add more summary fields as needed */}
            </ul>
          </div>
        );
      default:
        return null;
    }
  }

  const isFirstStep = step === 1;
  const isLastStep = step === progressSteps.length;

  function handleFormKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }

  return (
    <div className={`${style} wizard-fixed-size`}>
      <div className="wizard-step-area">
        <form
          className="card-text h-100 d-flex flex-column p-3"
          onSubmit={e => e.preventDefault()}
          onKeyDown={handleFormKeyDown}
        >
          {/* Progress Circles */}
          {progressSteps.length > 1 && (
            <div className="mb-4">
              <div className="wizard-circles-row">
                {progressSteps.map((stepObj, idx) => {
                  const isFilled = step === idx + 1;
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
                {progressSteps.map((stepObj, idx) => (
                  <div key={idx} className="wizard-label">
                    {stepObj.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step content */}
          <div className="flex-grow-1 d-flex flex-column">{renderStep()}</div>

          {/* Navigation buttons */}
          <WizardNavigation
            step={step}
            setStep={setStep}
            numSteps={progressSteps.length}
            onFinish={handleWizardFinish}
            disableNext={step === 1 && (isDuplicateName || !nameTrimmed)}
          />
        </form>
      </div>
    </div>
  );
}

export default VolumeFreqAnalysisWizard;
