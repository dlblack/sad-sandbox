import React from "react";
import {TextStore} from "../../utils/TextStore.js";

function WizardNavigation({step, setStep, numSteps, onFinish, finishLabel, disableNext}) {
  const isFirstStep = step === 1;
  const isLastStep = step === numSteps;

  const finishText = finishLabel || TextStore.interface("WIZARD_FINISH");

  return (
    <div className="wizard-footer-inner d-flex justify-content-between">
      <button
        type="button"
        className="btn btn-secondary btn-compact"
        onClick={() => setStep(s => Math.max(1, s - 1))}
        disabled={isFirstStep}
      >
        {TextStore.interface("WIZARD_BACK")}
      </button>
      <button
        type="button"
        className={`btn btn-primary btn-compact${isLastStep ? " d-none" : ""}`}
        onClick={() => setStep(s => Math.min(numSteps, s + 1))}
        disabled={isLastStep || disableNext}
      >
        {TextStore.interface("WIZARD_NEXT")}
      </button>
      {isLastStep && (
        <button
          type="submit"
          className="btn btn-primary btn-compact"
          onClick={onFinish}
        >
          {finishText}
        </button>
      )}
    </div>
  );
}

export default WizardNavigation;
