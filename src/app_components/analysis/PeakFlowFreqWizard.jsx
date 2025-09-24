import React from "react";
import GenericWizard from "./GenericWizard.jsx";
import Skew, { SkewSummary } from "./components/Skew.jsx";
import { TextStore } from "../../utils/TextStore.js";

const EXP_PROB = {
  doNotComp: TextStore.interface("PeakFlowFreqWizard_DoNotCompExpProb"),
  comp: TextStore.interface("PeakFlowFreqWizard_CompExpProb"),
};

export default function PeakFlowFreqWizard(props) {
  const steps = [
    // Step 2: Skew selection
    {
      label: TextStore.interface("AnalysisWizard_Skew_StepSkew"),
      render: ({ bag, setBag }) => (
        <Skew
          value={bag.skewChoice ?? ""}
          onChange={(val) => setBag((prev) => ({ ...prev, skewChoice: val }))}
          regionalSkew={bag.regionalSkew ?? ""}
          setRegionalSkew={(val) => setBag((prev) => ({ ...prev, regionalSkew: val }))}
          regionalSkewMSE={bag.regionalSkewMSE ?? ""}
          setRegionalSkewMSE={(val) => setBag((prev) => ({ ...prev, regionalSkewMSE: val }))}
          allowStation
          allowWeighted
          compact
        />
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
                checked={(bag.exProbChoice || "") === opt}
                onChange={e => setBag(prev => ({ ...prev, exProbChoice: e.target.value }))}
              />
              <label className="form-check-label font-xs" htmlFor={`step3_${opt}`}>
                {opt === "option1" ? EXP_PROB.doNotComp : EXP_PROB.comp}
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
        const freqList = (bag.step4Rows || []).filter(v => v !== "");
        return (
          <div>
            <h6 className="mb-3">{TextStore.interface("AnalysisWizard_Summary_Title")}</h6>

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

            <SkewSummary
              choice={bag.skewChoice}
              regionalSkew={bag.regionalSkew}
              regionalSkewMSE={bag.regionalSkewMSE}
            />

            <div className="mb-2">
              <strong>{TextStore.interface("PeakFlowFreqWizard_SummaryExpectedProbability")}</strong>
            </div>
            <ul className="list-unstyled mb-2 font-xs">
              <li>
                <strong>{TextStore.interface("PeakFlowFreqWizard_SummaryComputation")}</strong>{" "}
                {bag.exProbChoice === "option1" ? EXP_PROB.doNotComp
                  : bag.exProbChoice === "option2" ? EXP_PROB.comp
                    : null}
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
    if (stepIndex === 2 && (ctx.bag.skewChoice || "") === "option3") {
      return (ctx.bag.regionalSkew ?? "") !== "" && (ctx.bag.regionalSkewMSE ?? "") !== "";
    }
    return true;
  };

  const buildResult = (ctx) => ({
    name: ctx.name,
    description: ctx.description,
    selectedDataset: ctx.selectedDataset,
    skewChoiceValue:
      (ctx.bag.skewChoice === "option1" && TextStore.interface("AnalysisWizard_Skew_UseStationSkew")) ||
      (ctx.bag.skewChoice === "option2" && TextStore.interface("AnalysisWizard_Skew_UseWeightedSkew")) ||
      (ctx.bag.skewChoice === "option3" && TextStore.interface("AnalysisWizard_Skew_UseRegionalSkew")) ||
      "",
    regionalSkew: ctx.bag.regionalSkew,
    regionalSkewMSE: ctx.bag.regionalSkewMSE,
    exProbChoice:
      (ctx.bag.exProbChoice === "option1" && EXP_PROB.doNotComp) ||
      (ctx.bag.exProbChoice === "option2" && EXP_PROB.comp) ||
      "",
    frequencies: (ctx.bag.step4Rows || []).filter((v) => v !== ""),
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
