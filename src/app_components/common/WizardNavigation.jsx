import React from "react";

function WizardNavigation({step, setStep, numSteps, onFinish, finishLabel = "Finish", disableNext}) {
  const isFirstStep = step === 1;
  const isLastStep = step === numSteps;

  return (
    <div className="wizard-footer-inner d-flex justify-content-between">
      <button
        type="button"
        className="btn btn-secondary btn-compact"
        onClick={() => setStep(s => Math.max(1, s - 1))}
        disabled={isFirstStep}
      >
        Back
      </button>
      <button
        type="button"
        className={`btn btn-primary btn-compact${isLastStep ? " d-none" : ""}`}
        onClick={() => setStep(s => Math.min(numSteps, s + 1))}
        disabled={isLastStep || disableNext}
      >
        Next
      </button>
      {isLastStep && (
        <button
          type="submit"
          className="btn btn-primary btn-compact"
          onClick={onFinish}
        >
          {finishLabel}
        </button>
      )}
    </div>
  );
}

export default WizardNavigation;
