import React from "react";
import GenericWizard from "./GenericWizard.jsx";
import Skew, { SkewSummary, skewChoiceToOptions } from "./components/Skew.jsx";
import { TextStore } from "../../utils/TextStore.js";

export default function Bulletin17AnalysisWizard(props) {
  const steps = [
    // Method (17B disabled)
    {
      label: TextStore.interface("Bulletin17_Wizard_Method_Label"),
      render: ({ bag, setBag }) => (
        <div className="p-2">
          <div className="form-check mb-1">
            <input
              className="form-check-input"
              type="radio"
              name="b17-method"
              id="b17b"
              value="B17B"
              disabled
              checked={(bag.method || "B17C") === "B17B"}
              onChange={(e) => setBag((prev) => ({ ...prev, method: e.target.value }))}
            />
            <label className="form-check-label" htmlFor="b17b">
              {TextStore.interface("Bulletin17_Wizard_Method_B17B")}
              <span className="ms-2 text-muted">(disabled)</span>
            </label>
          </div>

          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="b17-method"
              id="b17c"
              value="B17C"
              checked={(bag.method || "B17C") === "B17C"}
              onChange={(e) => setBag((prev) => ({ ...prev, method: e.target.value }))}
            />
            <label className="form-check-label" htmlFor="b17c">
              {TextStore.interface("Bulletin17_Wizard_Method_B17C")}
            </label>
          </div>
        </div>
      ),
    },

    // Skew
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
          allowStation={false}
          allowWeighted={false}
          compact
        />
      ),
    },

    // Probability
    {
      label: TextStore.interface("Bulletin17_Wizard_Prob_Label"),
      render: ({ bag, setBag }) => (
        <div className="p-2">
          <label htmlFor="b17-prob" className="form-label">
            {TextStore.interface("Bulletin17_Wizard_Prob_Field")}
          </label>
          <input
            id="b17-prob"
            type="number"
            step="0.0001"
            min="0"
            max="1"
            className="form-control"
            value={bag.probability ?? 0.01}
            onChange={(e) => setBag((prev) => ({ ...prev, probability: e.target.value }))}
          />
        </div>
      ),
    },

    // Summary
    {
      label: TextStore.interface("Bulletin17_Wizard_Step_Summary"),
      render: ({ name, description, selectedDataset, bag }) => {
        return (
          <div className="p-2">
            <h6 className="mb-3">{TextStore.interface("AnalysisWizard_Summary_Title")}</h6>

            <div className="mb-2"><strong>{TextStore.interface("Wizard_GeneralInfo")}</strong></div>
            <ul className="list-unstyled mb-2 font-xs">
              <li><strong>{TextStore.interface("Wizard_Name")}</strong>{name}</li>
              <li><strong>{TextStore.interface("Wizard_Description")}</strong>{description}</li>
              <li><strong>{TextStore.interface("Wizard_Dataset")}</strong>{selectedDataset}</li>
              <li><strong>{TextStore.interface("Bulletin17_Wizard_Method_Label")}</strong> {(bag.method || "B17C")}</li>
              <li><strong>{TextStore.interface("Bulletin17_Wizard_Prob_Field")}</strong> {(bag.probability ?? 0.01)}</li>
            </ul>

            <SkewSummary
              choice={bag.skewChoice}
              regionalSkew={bag.regionalSkew}
              regionalSkewMSE={bag.regionalSkewMSE}
            />
          </div>
        );
      },
    },
  ];

  // Leaving Skew step → stepIndex === 3
  const validateNext = (ctx, stepIndex) => {
    if (stepIndex === 3 && (ctx.bag.skewChoice || "") === "option3") {
      return (ctx.bag.regionalSkew ?? "") !== "" && (ctx.bag.regionalSkewMSE ?? "") !== "";
    }
    return true;
  };

  const buildResult = (ctx) => {
    const opts = skewChoiceToOptions(
      ctx.bag.skewChoice || "",
      ctx.bag.regionalSkew,
      ctx.bag.regionalSkewMSE
    );

    return {
      name: ctx.name,
      description: ctx.description,
      selectedDataset: ctx.selectedDataset || "",
      method: ctx.bag.method || "B17C",
      probability: Number(ctx.bag.probability ?? 0.01),
      datasetRef: ctx.selectedDataset || "",
      options: opts,
    };
  };

  return (
    <GenericWizard
      {...props}
      includeGeneralInfo
      steps={steps}
      validateNext={validateNext}
      buildResult={buildResult}
      defaultDatasetKey="Discharge"
    />
  );
}
