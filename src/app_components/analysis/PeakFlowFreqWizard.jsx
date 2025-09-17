import React from "react";
import GenericWizard from "./GenericWizard.jsx";
import { TextStore } from "../../utils/TextStore.js";

const SKEW_OPTIONS = {
  option1: TextStore.interface("PeakFlowFreqWizard_UseStationSkew"),
  option2: TextStore.interface("PeakFlowFreqWizard_UseWeightedSkew"),
  option3: TextStore.interface("PeakFlowFreqWizard_UseRegionalSkew")
};

const EXPECTED_PROBABILITY_OPTIONS = {
  option1: TextStore.interface("PeakFlowFreqWizard_DoNotCompExpProb"),
  option2: TextStore.interface("PeakFlowFreqWizard_CompExpProb")
};

export default function PeakFlowFreqWizard(props) {
  const steps = [
    // Step 2: Skew selection
    {
      label: TextStore.interface("PeakFlowFreqWizard_StepSkew"),
      render: ({ bag, setBag }) => (
        <>
          <div className="mb-2">
            {["option1","option2","option3"].map((opt, i) => (
              <div className="form-check" key={opt}>
                <input
                  className="form-check-input font-xs"
                  type="radio"
                  name="step2Radio"
                  id={`step2_${opt}`}
                  value={opt}
                  checked={(bag.step2Value || "") === opt}
                  onChange={e => setBag(prev => ({ ...prev, step2Value: e.target.value }))}
                />
                <label className="form-check-label font-xs" htmlFor={`step2_${opt}`}>
                  {SKEW_OPTIONS[opt]}
                </label>
              </div>
            ))}
          </div>

          <div className="form-group row align-items-center mb-2">
            <label
              htmlFor="regionalSkew"
              className="col-auto col-form-label wizard-label-fixed"
            >
              {TextStore.interface("PeakFlowFreqWizard_RegionalSkew")}
            </label>
            <div className="col ps-0">
              <input
                type="number"
                className="form-control form-control-sm font-xs"
                id="regionalSkew"
                value={bag.regionalSkew ?? ""}
                onChange={e => setBag(prev => ({ ...prev, regionalSkew: e.target.value }))}
                disabled={(bag.step2Value || "") !== "option3"}
              />
            </div>
          </div>

          <div className="form-group row align-items-center mb-2">
            <label
              htmlFor="regionalSkewMSE"
              className="col-auto col-form-label wizard-label-fixed"
            >
              {TextStore.interface("PeakFlowFreqWizard_RegionalSkewMSE")}
            </label>
            <div className="col ps-0">
              <input
                type="number"
                className="form-control form-control-sm font-xs"
                id="regionalSkewMSE"
                value={bag.regionalSkewMSE ?? ""}
                onChange={e => setBag(prev => ({ ...prev, regionalSkewMSE: e.target.value }))}
                disabled={(bag.step2Value || "") !== "option3"}
              />
            </div>
          </div>
        </>
      )
    },

    // Step 3: Expected Probability
    {
      label: TextStore.interface("PeakFlowFreqWizard_StepExpProb"),
      render: ({ bag, setBag }) => (
        <div className="form-group">
          {["option1","option2"].map(opt => (
            <div className="form-check" key={opt}>
              <input
                className="form-check-input font-xs"
                type="radio"
                name="step3Radio"
                id={`step3_${opt}`}
                value={opt}
                checked={(bag.step3Value || "") === opt}
                onChange={e => setBag(prev => ({ ...prev, step3Value: e.target.value }))}
              />
              <label className="form-check-label font-xs" htmlFor={`step3_${opt}`}>
                {EXPECTED_PROBABILITY_OPTIONS[opt]}
              </label>
            </div>
          ))}
        </div>
      )
    },

    // Step 4: Output frequencies
    {
      label: TextStore.interface("PeakFlowFreqWizard_StepOutFreqOrd"),
      render: ({ bag, setBag }) => {
        const rows = Array.isArray(bag.step4Rows) ? bag.step4Rows : ["", "", "", "", ""];
        const onChangeRow = (idx, val) => {
          const updated = [...rows];
          updated[idx] = val;
          if (idx === rows.length - 1 && val !== "") updated.push("");
          setBag(prev => ({ ...prev, step4Rows: updated }));
        };
        return (
          <>
            <div className="font-sm mb-2">{TextStore.interface("PeakFlowFreqWizard_EditOutputFreqOrd")}</div>
            <table className="table table-sm compact-table wizard-frequency-table">
              <thead>
              <tr>
                <th>{TextStore.interface("PeakFlowFreqWizard_FreqInPercent")}</th>
              </tr>
              </thead>
              <tbody>
              {rows.map((value, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="number"
                      className="form-control wizard-frequency-input"
                      value={value}
                      onChange={e => onChangeRow(idx, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </>
        );
      }
    },

    // Step 5: Summary
    {
      label: TextStore.interface("PeakFlowFreqWizard_StepComplete"),
      render: ({ name, description, selectedDataset, bag }) => {
        const step2 = bag.step2Value || "";
        const freqList = (bag.step4Rows || []).filter(v => v !== "");
        return (
          <div>
            <h6 className="mb-3">{TextStore.interface("PeakFlowFreqWizard_Summary")}</h6>

            <div className="mb-2"><strong>{TextStore.interface("Wizard_GeneralInfo")}</strong></div>
            <ul className="list-unstyled mb-2 font-xs">
              <li><strong>{TextStore.interface("Wizard_Name")}</strong>{name || <em>(None entered)</em>}</li>
              <li>
                <strong>{TextStore.interface("Wizard_Description")}</strong>
                {description || <em>(None entered)</em>}
              </li>
              <li>
                <strong>{TextStore.interface("Wizard_Dataset")}</strong>
                {selectedDataset || <em>{TextStore.interface("PeakFlowFreqWizard_SummarySkewType_None")}</em>}
              </li>
            </ul>

            <div className="mb-2">
              <strong>{TextStore.interface("PeakFlowFreqWizard_SummarySkewSelection")}</strong>
            </div>
            <ul className="list-unstyled mb-2 font-xs">
              <li>
                <strong>{TextStore.interface("PeakFlowFreqWizard_SummarySkewType")}</strong>{" "}
                {step2 === "option1" ? SKEW_OPTIONS.option1
                  : step2 === "option2" ? SKEW_OPTIONS.option2
                    : step2 === "option3" ? SKEW_OPTIONS.option3
                      : <em>{TextStore.interface("PeakFlowFreqWizard_SummarySkewType_None")}</em>}
              </li>
              {step2 === "option3" && (
                <>
                  <li>
                    <strong>{TextStore.interface("PeakFlowFreqWizard_RegionalSkew")}</strong>
                    {bag.regionalSkew || <em>{TextStore.interface("PeakFlowFreqWizard_SummarySkewType_None")}</em>}
                  </li>
                  <li>
                    <strong>{TextStore.interface("PeakFlowFreqWizard_RegionalSkewMSE")}</strong>
                    {bag.regionalSkewMSE || <em>{TextStore.interface("PeakFlowFreqWizard_SummarySkewType_None")}</em>}
                  </li>
                </>
              )}
            </ul>

            <div className="mb-2">
              <strong>{TextStore.interface("PeakFlowFreqWizard_SummaryExpectedProbability")}</strong>
            </div>
            <ul className="list-unstyled mb-2 font-xs">
              <li>
                <strong>{TextStore.interface("PeakFlowFreqWizard_SummaryComputation")}</strong>{" "}
                {bag.step3Value === "option1" ? EXPECTED_PROBABILITY_OPTIONS.option1
                  : bag.step3Value === "option2" ? EXPECTED_PROBABILITY_OPTIONS.option2
                    : <em>{TextStore.interface("PeakFlowFreqWizard_SummarySkewType_None")}</em>}
              </li>
            </ul>

            <div className="mb-2">
              <strong>{TextStore.interface("PeakFlowFreqWizard_SummaryFrequencies")}</strong>
            </div>
            <ul className="list-unstyled mb-2 font-xs">
              {freqList.length > 0
                ? freqList.map((v, idx) => <li key={idx}>• {v}</li>)
                : <li><em>{TextStore.interface("PeakFlowFreqWizard_SummaryFrequencies_None")}</em></li>}
            </ul>
          </div>
        );
      }
    }
  ];

  const validateNext = (ctx, stepIndex) => {
    if (stepIndex === 2 && (ctx.bag.step2Value || "") === "option3") {
      return (ctx.bag.regionalSkew ?? "") !== "" && (ctx.bag.regionalSkewMSE ?? "") !== "";
    }
    return true;
  };

  const buildResult = (ctx) => ({
    name: ctx.name,
    description: ctx.description,
    selectedDataset: ctx.selectedDataset,
    step2Value: SKEW_OPTIONS[ctx.bag.step2Value] || "",
    regionalSkew: ctx.bag.regionalSkew,
    regionalSkewMSE: ctx.bag.regionalSkewMSE,
    step3Value: EXPECTED_PROBABILITY_OPTIONS[ctx.bag.step3Value] || "",
    frequencies: (ctx.bag.step4Rows || []).filter(v => v !== "")
  });

  return (
    <GenericWizard
      {...props}
      includeGeneralInfo
      steps={steps}
      buildResult={buildResult}
      validateNext={validateNext}
      defaultDatasetKey="Discharge"
    />
  );
}
