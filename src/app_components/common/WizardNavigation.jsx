import React, { useCallback } from "react";
import { TextStore } from "../../utils/TextStore.js";
import { Button, Group } from "@mantine/core";

function WizardNavigation({
                            step,
                            setStep,
                            numSteps,
                            onFinish,
                            finishLabel,
                            disableNext,
                            onCancel,
                            backLabel = TextStore.interface("WIZARD_BACK"),
                            nextLabel = TextStore.interface("WIZARD_NEXT"),
                            cancelLabel = TextStore.interface("WIZARD_CANCEL"),
                            hideCancel = false,
                          }) {
  const isFirstStep = step === 1;
  const isLastStep = step === numSteps;

  const finishText = finishLabel || TextStore.interface("WIZARD_FINISH");

  const goBack = useCallback(() => setStep((s) => Math.max(1, s - 1)), [setStep]);
  const goNext = useCallback(() => setStep((s) => Math.min(numSteps, s + 1)), [setStep, numSteps]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        if (!isLastStep && !disableNext) goNext();
        else if (isLastStep) onFinish?.();
      } else if (e.key === "Escape" && !hideCancel) {
        onCancel?.();
      }
    },
    [disableNext, goNext, hideCancel, isLastStep, onCancel, onFinish]
  );

  return (
    <Group
      justify="space-between"
      align="center"
      onKeyDown={onKeyDown}
      style={{ padding: 8 }}
      data-testid="wizard-navigation"
    >
      {!hideCancel && (
        <Button
          type="button"
          variant="light"
          color="red"
          size="xs"
          onClick={onCancel}
          aria-label={cancelLabel}
        >
          {cancelLabel}
        </Button>
      )}

      <Group align="center" gap="xs">
        <Button
          type="button"
          variant="default"
          size="xs"
          onClick={goBack}
          disabled={isFirstStep}
          aria-disabled={isFirstStep}
          aria-label={backLabel}
        >
          {backLabel}
        </Button>

        {!isLastStep ? (
          <Button
            type="button"
            variant="filled"
            color="teal"
            size="xs"
            onClick={goNext}
            disabled={disableNext}
            aria-disabled={disableNext}
            aria-label={nextLabel}
          >
            {nextLabel}
          </Button>
        ) : (
          <Button
            type="submit"
            variant="filled"
            color="teal"
            size="xs"
            onClick={onFinish}
            aria-label={finishText}
          >
            {finishText}
          </Button>
        )}
      </Group>
    </Group>
  );
}

export default WizardNavigation;
