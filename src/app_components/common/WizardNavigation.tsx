import React, { useCallback } from "react";
import { TextStore } from "../../utils/TextStore.js";
import { Button, Group, Flex, Box } from "@mantine/core";

export interface WizardNavigationProps {
    step: number;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    numSteps: number;
    onFinish?: (
        e?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>
    ) => void;
    finishLabel?: string;
    disableNext?: boolean;
    onCancel?: () => void;
    backLabel?: string;
    nextLabel?: string;
    cancelLabel?: string;
    hideCancel?: boolean;
}

export default function WizardNavigation({
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
                                         }: WizardNavigationProps) {
    const isFirstStep = step === 1;
    const isLastStep = step === numSteps;

    const finishText = finishLabel || TextStore.interface("WIZARD_FINISH");

    const goBack = useCallback(() => {
        setStep((s) => Math.max(1, s - 1));
    }, [setStep]);

    const goNext = useCallback(() => {
        setStep((s) => Math.min(numSteps, s + 1));
    }, [setStep, numSteps]);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter") {
                if (!isLastStep && !disableNext) {
                    goNext();
                } else if (isLastStep) {
                    onFinish?.(e);
                }
            } else if (e.key === "Escape" && !hideCancel) {
                onCancel?.();
            }
        },
        [disableNext, goNext, hideCancel, isLastStep, onCancel, onFinish]
    );

    return (
        <Flex
            align="center"
            onKeyDown={onKeyDown}
            p="xs"
            w="100%"
            data-testid="wizard-navigation"
        >
            <Box>
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
            </Box>

            <Group gap="xs" ml="auto">
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
                        disabled={!!disableNext}
                        aria-disabled={!!disableNext}
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
                        onClick={(e) => onFinish?.(e)}
                        aria-label={finishText}
                    >
                        {finishText}
                    </Button>
                )}
            </Group>
        </Flex>
    );
}
