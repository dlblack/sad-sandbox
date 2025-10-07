import React from "react";
import { TextStore } from "../../../../utils/TextStore.js";
import { Radio, NumberInput, Stack, Text } from "@mantine/core";

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
  const size = compact ? "xs" : "sm";

  const SKEW_OPTIONS_STEP = {
        option1: TextStore.interface("AnalysisWizard_Skew_UseStationSkew"),
        option2: TextStore.interface("AnalysisWizard_Skew_UseWeightedSkew"),
        option3: TextStore.interface("AnalysisWizard_Skew_UseRegionalSkew"),
      };

  return (
    <fieldset className="wizard-grid">
      <div className="mb-2">
        <Stack gap="xs">
          <Radio
            name="skew-choice"
            value="option1"
            checked={value === "option1"}
            onChange={(e) => onChange(e.currentTarget.value)}
            label={SKEW_OPTIONS_STEP.option1}
            disabled={!allowStation}
            size={size}
          />
          <Radio
            name="skew-choice"
            value="option2"
            checked={value === "option2"}
            onChange={(e) => onChange(e.currentTarget.value)}
            label={SKEW_OPTIONS_STEP.option2}
            disabled={!allowWeighted}
            size={size}
          />
          <Radio
            name="skew-choice"
            value="option3"
            checked={value === "option3"}
            onChange={(e) => onChange(e.currentTarget.value)}
            label={SKEW_OPTIONS_STEP.option3}
            size={size}
          />
        </Stack>
      </div>

      <div className="form-group row align-items-center mb-2">
        <label htmlFor="regionalSkew" className="col-auto col-form-label wizard-label-fixed">
          {TextStore.interface("AnalysisWizard_Skew_RegionalSkew")}
        </label>
        <div className="col ps-0">
          <NumberInput
            id="regionalSkew"
            size={size}
            step={0.0001}
            value={regionalSkew === "" || regionalSkew == null ? "" : Number(regionalSkew)}
            onChange={(v) =>
              setRegionalSkew(v === "" || v == null ? "" : String(v))
            }
            disabled={!isRegional}
            hideControls
          />
        </div>
      </div>

      <div className="form-group row align-items-center mb-1">
        <label htmlFor="regionalSkewMSE" className="col-auto col-form-label wizard-label-fixed">
          {TextStore.interface("AnalysisWizard_Skew_RegionalSkewMSE")}
        </label>
        <div className="col ps-0">
          <NumberInput
            id="regionalSkewMSE"
            size={size}
            step={0.0001}
            value={regionalSkewMSE === "" || regionalSkewMSE == null ? "" : Number(regionalSkewMSE)}
            onChange={(v) =>
              setRegionalSkewMSE(v === "" || v == null ? "" : String(v))
            }
            disabled={!isRegional}
            hideControls
          />
        </div>
      </div>

      {helpText ? <Text size="xs" mt="xs">{helpText}</Text> : null}
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
