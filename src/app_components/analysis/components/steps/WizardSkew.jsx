import React from "react";
import { TextStore } from "../../../../utils/TextStore.js";

export default function WizardSkew({
                               value,
                               onChange,
                               regionalSkew,
                               setRegionalSkew,
                               regionalSkewMSE,
                               setRegionalSkewMSE,
                               allowStation = false,
                               allowWeighted = false,
                               helpText = "",
                               compact = false,
                             }) {
  const isRegional = value === "option3";
  const cls = compact ? "form-control form-control-sm font-xs" : "form-control";

  const SKEW_OPTIONS_STEP = {
        option1: TextStore.interface("AnalysisWizard_Skew_UseStationSkew"),
        option2: TextStore.interface("AnalysisWizard_Skew_UseWeightedSkew"),
        option3: TextStore.interface("AnalysisWizard_Skew_UseRegionalSkew"),
      };

      return (
        <fieldset className="wizard-grid">
            <div className="mb-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="skew-choice"
                  id="skew_option1"
                  value="option1"
                  disabled={!allowStation}
                  checked={value === "option1"}
                  onChange={(e) => onChange(e.target.value)}
                />
                <label className="form-check-label" htmlFor="skew_option1">
                  {SKEW_OPTIONS_STEP.option1}
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="skew-choice"
                  id="skew_option2"
                  value="option2"
                  disabled={!allowWeighted}
                  checked={value === "option2"}
                  onChange={(e) => onChange(e.target.value)}
                />
                <label className="form-check-label" htmlFor="skew_option2">
                  {SKEW_OPTIONS_STEP.option2}
                </label>
              </div>

              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="skew-choice"
                  id="skew_option3"
                  value="option3"
                  checked={value === "option3"}
                  onChange={(e) => onChange(e.target.value)}
                />
                <label className="form-check-label" htmlFor="skew_option3">
                  {SKEW_OPTIONS_STEP.option3}
                </label>
              </div>
            </div>

            <div className="form-group row align-items-center mb-2">
              <label htmlFor="regionalSkew" className="col-auto col-form-label wizard-label-fixed">
                {TextStore.interface("AnalysisWizard_Skew_RegionalSkew")}
              </label>
              <div className="col ps-0">
                <input
                  id="regionalSkew"
                  type="number"
                  step="0.0001"
                  className={cls}
                  value={regionalSkew ?? ""}
                  onChange={(e) => setRegionalSkew(e.target.value)}
                  disabled={!isRegional}
                />
              </div>
            </div>

            <div className="form-group row align-items-center mb-1">
              <label htmlFor="regionalSkewMSE" className="col-auto col-form-label wizard-label-fixed">
                {TextStore.interface("AnalysisWizard_Skew_RegionalSkewMSE")}
              </label>
              <div className="col ps-0">
                <input
                  id="regionalSkewMSE"
                  type="number"
                  step="0.0001"
                  className={cls}
                  value={regionalSkewMSE ?? ""}
                  onChange={(e) => setRegionalSkewMSE(e.target.value)}
                  disabled={!isRegional}
                />
              </div>
            </div>

            {helpText ? <div className="form-text mt-1">{helpText}</div> : null}
          </fieldset>
      );
  }

  export function skewChoiceToOptions(choice, regionalSkew, regionalSkewMSE) {
    const useRegional = choice === "option3";
    return {
        useRegionalSkew: useRegional,
        regionalSkew: useRegional ? Number(regionalSkew) : undefined,
        regionalSkewMSE: useRegional ? Number(regionalSkewMSE) : undefined,
      };
  }

  function summaryChoiceLabel(choice) {
      if (choice === "option1") return TextStore.interface("AnalysisWizard_Skew_Summary_UseStationSkew");
      if (choice === "option2") return TextStore.interface("AnalysisWizard_Skew_Summary_UseWeightedSkew");
      if (choice === "option3") return TextStore.interface("AnalysisWizard_Skew_Summary_UseRegionalSkew");
      return "";
    }

export function SkewSummary({ choice, regionalSkew, regionalSkewMSE }) {
    const summarySel = TextStore.interface("AnalysisWizard_Skew_Summary_SkewSelection");
    const summaryType = TextStore.interface("AnalysisWizard_Skew_Summary_SkewType");
    const label = summaryChoiceLabel(choice);

    return (
      <>
        <div className="mb-2">
          <strong>{summarySel}</strong>
        </div>
        <ul className="list-unstyled mb-2 font-xs">
          <li>
            <strong>{summaryType}</strong>{" "}
            {label}
          </li>

          {choice === "option3" && regionalSkew !== "" && (
            <li>
                <strong>{TextStore.interface("AnalysisWizard_Skew_Summary_RegionalSkew")}</strong> {regionalSkew}
              </li>
          )}

          {choice === "option3" && regionalSkewMSE !== "" && (
            <li>
                <strong>{TextStore.interface("AnalysisWizard_Skew_Summary_RegionalSkewMSE")}</strong> {regionalSkewMSE}
              </li>
          )}
        </ul>
      </>
    );
  }

// ---- Reusable Skew step -----------------
export function makeSkewStep({
                               allowStation = false,
                               allowWeighted = false,
                               compact = false,
                               key = "skew",
                             } = {}) {
  const label = TextStore.interface("AnalysisWizard_Skew_StepSkew");

  const validate = (ctx) => {
    const choice = ctx.bag.skewChoice || "";
    if (choice === "option3") {
      return (ctx.bag.regionalSkew ?? "") !== "" && (ctx.bag.regionalSkewMSE ?? "") !== "";
    }
    return true;
  };

  const render = ({ bag, setBag }) => (
    <WizardSkew
      value={bag.skewChoice ?? ""}
      onChange={(val) => setBag((prev) => ({ ...prev, skewChoice: val }))}
      regionalSkew={bag.regionalSkew ?? ""}
      setRegionalSkew={(val) => setBag((prev) => ({ ...prev, regionalSkew: val }))}
      regionalSkewMSE={bag.regionalSkewMSE ?? ""}
      setRegionalSkewMSE={(val) => setBag((prev) => ({ ...prev, regionalSkewMSE: val }))}
      allowStation={allowStation}
      allowWeighted={allowWeighted}
      compact={compact}
    />
  );

  const summary = ({ bag }) => (
    <SkewSummary
      choice={bag.skewChoice}
      regionalSkew={bag.regionalSkew}
      regionalSkewMSE={bag.regionalSkewMSE}
    />
  );

  return { key, label, render, validate, summary };
}
