import React from "react";
import WizardRunner from "../components/WizardRunner.jsx";
import { makeWizardGeneralInfoStep, GeneralInfoSummary } from "../components/steps/WizardGeneralInfo.jsx";
import { makeSkewStep, SkewSummary, skewChoiceToOptions } from "../components/steps/WizardSkew.jsx";
import { TextStore } from "../../../utils/TextStore.js";

export default function Bulletin17AnalysisWizard(props) {
  const steps = [
    makeWizardGeneralInfoStep(),

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

    makeSkewStep({ allowStation: false, allowWeighted: false, compact: true }),

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

    {
      label: TextStore.interface("Bulletin17_Wizard_Step_Summary"),
      render: ({ name, description, selectedDataset, bag }) => (
        <div className="p-2">
          <h6 className="mb-3">{TextStore.interface("Wizard_Summary_Title")}</h6>

          <GeneralInfoSummary
            name={name}
            description={description}
            selectedDataset={selectedDataset}
          />

          <ul className="list-unstyled mb-2 font-xs">
            <li>
              <strong>{TextStore.interface("Bulletin17_Wizard_Method_Label")}</strong>{" "}
              {bag.method || "B17C"}
            </li>
            <li>
              <strong>{TextStore.interface("Bulletin17_Wizard_Prob_Field")}</strong>{" "}
              {bag.probability ?? 0.01}
            </li>
          </ul>

          <SkewSummary
            choice={bag.skewChoice}
            regionalSkew={bag.regionalSkew}
            regionalSkewMSE={bag.regionalSkewMSE}
          />
        </div>
      ),
    },
  ];

  const validateNext = (ctx, stepIndex) => {
    // Leaving Skew step: it is step 3 here
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
    <WizardRunner
      {...props}
      steps={steps}
      validateNext={validateNext}
      buildResult={buildResult}
      defaultDatasetKey="Discharge"
    />
  );
}
