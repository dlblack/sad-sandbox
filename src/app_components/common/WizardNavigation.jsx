import React from "react";
import { TextStore } from "../../utils/TextStore.js";

function WizardNavigation({
                            step,
                            setStep,
                            numSteps,
                            onFinish,
                            finishLabel,
                            disableNext,
                            onCancel,          // new
                          }) {
  const isFirstStep = step === 1;
  const isLastStep = step === numSteps;

  const finishText = finishLabel || TextStore.interface("WIZARD_FINISH");

  return (
    <div className="wizard-footer-inner d-flex justify-content-between align-items-center">
      {/* Left side: Cancel */}
      <div>
        <button
          type="button"
          className="btn btn-danger btn-compact me-2"
          onClick={onCancel}
        >
          {TextStore.interface("WIZARD_CANCEL")}
        </button>
      </div>

      {/* Right side: Back + Next/Finish */}
      <div className="d-flex align-items-center">
        <button
          type="button"
          className="btn btn-secondary btn-compact me-2"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={isFirstStep}
        >
          {TextStore.interface("WIZARD_BACK")}
        </button>

        {!isLastStep ? (
          <button
            type="button"
            className="btn btn-primary btn-compact"
            onClick={() => setStep((s) => Math.min(numSteps, s + 1))}
            disabled={disableNext}
          >
            {TextStore.interface("WIZARD_NEXT")}
          </button>
        ) : (
          <button
            type="submit"
            className="btn btn-primary btn-compact"
            onClick={onFinish}
          >
            {finishText}
          </button>
        )}
      </div>
    </div>
  );
}

export default WizardNavigation;
