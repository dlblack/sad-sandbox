import React, { useContext, useEffect, useState } from "react";
import { StyleContext } from "../../styles/StyleContext";
import WizardNavigation from "./WizardNavigation";
import { componentDisplayNames } from "../../utils/componentDisplayNames";

function PeakFlowFreqWizard(props) {
  const dischargeData = 
    props.data?.Discharge || props.data?.discharge || [];

  const SKEW_OPTIONS = {
    option1: "Use Station Skew",
    option2: "Use Weighted Skew",
    option3: "Use Regional Skew"
  };
  
  const EXPECTED_PROBABILITY_OPTIONS = {
    option1: "Do Not Compute Expected Probability",
    option2: "Compute Expected Probability Curve using Numerical Integration (EMA)"
  };

  const { style } = useContext(StyleContext);
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");

  useEffect(() => {
    if (dischargeData.length > 0 && !selectedDataset) {
      setSelectedDataset(dischargeData[0].name);
    }
  }, [dischargeData, selectedDataset]);

  useEffect(() => {
    if (dischargeData.length > 0 && selectedDataset) {
      const found = dischargeData.find(item => item.name === selectedDataset);
      setDescription(found?.description || "");
    }
  }, [selectedDataset, dischargeData]);

  const displayType = componentDisplayNames[props.type] || props.type;
  const existingNames = (
    (props.analyses && props.analyses[displayType]) || []
  ).map(a => (a.name || "").trim().toLowerCase());
  const nameTrimmed = name.trim().toLowerCase();
  const isDuplicateName = 
    nameTrimmed.length > 0 &&
    existingNames.includes(nameTrimmed);
  
  // Step 2
  const [step2Value, setStep2Value] = useState("");
  const [regionalSkew, setRegionalSkew] = useState("");
  const [regionalSkewMSE, setRegionalSkewMSE] = useState("");

  // Step 3
  const [step3Value, setStep3Value] = useState("");

  //Step 4
  const [step4Rows, setStep4Rows] = useState(["", "", "", "", ""]);

  //Step 5
  const handleWizardFinish = (e) => {
    e.preventDefault();
    if (props.onFinish) {
      props.onFinish(
        props.type,
        {
          name,
          description,
          selectedDataset,
          step2Value: SKEW_OPTIONS[step2Value] || "",
          regionalSkew,
          regionalSkewMSE,
          step3Value: EXPECTED_PROBABILITY_OPTIONS[step3Value] || "",
          frequencies: step4Rows.filter(v => v !== "")
        },
        props.id                   // id: the unique id for this wizard
      );
    }    
  };    

  const progressSteps = [
    { label: "Skew" },
    { label: "Expected Probability" },
    { label: "Output Frequency Ordinates" },
    { label: "Complete" }
  ];  

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <>
            <legend>General Information</legend>
            <div className="form-group row align-items-center mb-2">
              <label 
                htmlFor="field1" 
                className="col-auto col-form-label font-xs" 
                style={{ minWidth: 85 }}
              > 
                Name:
              </label>
              <div className="col ps-0">
                <input
                  className="form-control form-control-sm font-xs"
                  type="text"
                  id="field1"
                  value={name}
                  maxLength={20}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group row align-items-center mb-2">
              <label 
                htmlFor="description" 
                className="col-auto col-form-label font-xs" 
                style={{ minWidth: 85}}
              >
                Description:
              </label>
              <div className="col ps-0">
                <textarea
                  className="form-control font-xs"
                  id="description"
                  rows={4}
                  placeholder="(Optional))"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group row align-items-center mb-2">
              <label 
                htmlFor="combo1" 
                className="col-auto col-form-label font-xs" 
                style={{ minWidth: 85 }}
                value={selectedDataset}
                onChange={e => setSelectedDataset(e.target.value)}
              >
                Dataset:
              </label>
              <div className="col ps-0">
                <select 
                  className="form-select font-xs" 
                  id="combo1"
                  value={selectedDataset}
                  onChange={e => setSelectedDataset(e.target.value)}
                >
                  {dischargeData.map((item, idx) => (
                    <option key={idx}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        );
        case 2:
          return (
            <>
              <div className="mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input font-xs"
                    type="radio"
                    name="step2Radio"
                    id="step2Option1"
                    value="option1"
                    checked={step2Value === "option1"}
                    onChange={e => setStep2Value(e.target.value)}
                  />
                  <label
                    className="form-check-label font-xs"
                    htmlFor="step2Option1"
                  >
                    Use Station Skew
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input font-xs"
                    type="radio"
                    name="step2Radio"
                    id="step2Option2"
                    value="option2"
                    checked={step2Value === "option2"}
                    onChange={e => setStep2Value(e.target.value)}
                  />
                  <label
                    className="form-check-label font-xs"
                    htmlFor="step2Option2"
                  >
                    Use Weighted Skew
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input font-xs"
                    type="radio"
                    name="step2Radio"
                    id="step2Option3"
                    value="option3"
                    checked={step2Value === "option3"}
                    onChange={e => setStep2Value(e.target.value)}
                  />
                  <label
                    className="form-check-label font-xs"
                    htmlFor="step2Option3"
                  >
                    Use Regional Skew
                  </label>
                </div>
              </div>
              {/* Numerical Inputs for Option 3, horizontally aligned */}
              <div className="form-group row align-items-center mb-2">
                <label htmlFor="regionalSkew" className="col-auto col-form-label" style={{ fontSize: "12px", minWidth: 110 }}>
                  Regional Skew:
                </label>
                <div className="col ps-0">
                  <input
                    type="number"
                    className="form-control form-control-sm font-xs"
                    id="regionalSkew"
                    value={regionalSkew}
                    onChange={e => setRegionalSkew(e.target.value)}
                    disabled={step2Value !== "option3"}
                  />
                </div>
              </div>
              <div className="form-group row align-items-center mb-2">
                <label htmlFor="regionalSkewMSE" className="col-auto col-form-label" style={{ fontSize: "12px", minWidth: 110 }}>
                  Regional Skew MSE:
                </label>
                <div className="col ps-0">
                  <input
                    type="number"
                    className="form-control form-control-sm font-xs"
                    id="regionalSkewMSE"
                    value={regionalSkewMSE}
                    onChange={e => setRegionalSkewMSE(e.target.value)}
                    disabled={step2Value !== "option3"}
                  />
                </div>
              </div>
            </>
          );
        
      case 3:
        return (
          <>
            <div className="form-group">
              <div className="form-check">
                <input
                  className="form-check-input font-xs"
                  type="radio"
                  name="step3Radio"
                  id="step3Option1"
                  value="option1"
                  checked={step3Value === "option1"}
                  onChange={e => setStep3Value(e.target.value)}
                />
                <label className="form-check-label font-xs" htmlFor="step2Option1">
                  Do Not Compute Expected Probability
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input font-xs"
                  type="radio"
                  name="step3Radio"
                  id="step3Option2"
                  value="option2"
                  checked={step3Value === "option2"}
                  onChange={e => setStep3Value(e.target.value)}
                />
                <label className="form-check-label font-xs" htmlFor="step3Option2">
                  Compute Expected Probability Curve using Numerical Integration (EMA)
                </label>
              </div>
            </div>
          </>
        );
        case 4:
          return (
            <>
              <div className="mb-2"><strong>Edit the frequencies in the table below.</strong></div>
              <table className="table table-sm table-striped compact-table wizard-frequency-table">
                <thead>
                  <tr>
                    <th>
                      Frequency in Percent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {step4Rows.map((value, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="number"
                          className="form-control wizard-frequency-input"
                          value={value}
                          onChange={e => {
                            const newRows = [...step4Rows];
                            newRows[idx] = e.target.value;
                            setStep4Rows(newRows);
                            if (
                              idx === step4Rows.length - 1 &&
                              e.target.value !== ""
                            ) {
                              setStep4Rows([...newRows, ""]);
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          );
          case 5:
            return (
              <div>
                <h6 className="mb-3">Summary</h6>
                <div className="mb-2"><strong>General Information</strong></div>
                <ul className="list-unstyled mb-2 font-xs">
                  <li><strong>Name:</strong> {name || <em>(None entered)</em>}</li>
                  <li><strong>Description:</strong> {description || <em>(None entered)</em>}</li>
                  <li><strong>Dataset:</strong> {selectedDataset || <em>(None selected)</em>}</li>
                </ul>
                <div className="mb-2"><strong>Skew Selection</strong></div>
                <ul className="list-unstyled mb-2 font-xs">
                  <li>
                    <strong>Type:</strong> {
                      step2Value === "option1" ? "Use Station Skew" :
                      step2Value === "option2" ? "Use Weighted Skew" :
                      step2Value === "option3" ? "Use Regional Skew" :
                      <em>(None selected)</em>
                    }
                  </li>
                  {step2Value === "option3" && (
                    <>
                      <li><strong>Regional Skew:</strong> {regionalSkew || <em>(None entered)</em>}</li>
                      <li><strong>Regional Skew MSE:</strong> {regionalSkewMSE || <em>(None entered)</em>}</li>
                    </>
                  )}
                </ul>
                <div className="mb-2"><strong>Expected Probability</strong></div>
                <ul className="list-unstyled mb-2 font-xs">
                  <li>
                    <strong>Computation:</strong> {
                      step3Value === "option1" ? "Do Not Compute Expected Probability" :
                      step3Value === "option2" ? "Compute Expected Probability Curve using Numerical Integration (EMA)" :
                      <em>(None selected)</em>
                    }
                  </li>
                </ul>
                <div className="mb-2"><strong>Frequencies</strong></div>
                <ul className="list-unstyled mb-2 font-xs">
                  {step4Rows
                    .filter(v => v !== "")
                    .map((v, idx) => (
                      <li key={idx}>• {v}</li>
                    ))}
                  {step4Rows.filter(v => v !== "").length === 0 && (
                    <li><em>(No values entered)</em></li>
                  )}
                </ul>
              </div>
            );
          
        default:
        return null;
    }
  }

  const isFirstStep = step === 1;
  const isLastStep = step === 5;

  return (
    <div className={`${style} wizard-fixed-size`}>
      <div className="wizard-step-area">
        <form 
          className="card-text h-100 d-flex flex-column p-3"
          onSubmit={e => e.preventDefault()}
        >
          {step >= 2 && (
            <div className="mb-4">
              {/* Circles row */}
              <div className="wizard-circles-row">
                {progressSteps.map((stepObj, idx) => {
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
              {/* Labels row */}
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
            numSteps={progressSteps.length + 1}
            onFinish={handleWizardFinish}
            disableNext={step === 1 && (isDuplicateName || !nameTrimmed)}
          />
        </form>
      </div>
    </div>
  );
}

export default PeakFlowFreqWizard;
