import React from "react";
import { TextStore } from "../../../../utils/TextStore";
import { Radio, NumberInput, Stack, Text } from "@mantine/core";

/** Minimal fields this step needs from the wizard's bag */
export type SkewBag = {
    skewChoice?: string;
    regionalSkew?: string | number;
    regionalSkewMSE?: string | number;
};

/** Context shapes used by the step factory */
type RenderCtx<B extends SkewBag> = {
    bag: B;
    setBag: (fn: (prev: B) => B) => void;
};

type ValidateCtx<B extends SkewBag> = {
    bag: B;
};

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
                                   }: {
    value: string;
    onChange: (v: string) => void;
    regionalSkew?: string | number;
    setRegionalSkew: (v: string) => void;
    regionalSkewMSE?: string | number;
    setRegionalSkewMSE: (v: string) => void;
    allowStation?: boolean;
    allowWeighted?: boolean;
    helpText?: string;
    compact?: boolean;
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
                        name="skewchoice"
                        value="option1"
                        checked={value === "option1"}
                        onChange={(e) => onChange(e.currentTarget.value)}
                        label={SKEW_OPTIONS_STEP.option1}
                        disabled={!allowStation}
                        size={size}
                    />
                    <Radio
                        name="skewchoice"
                        value="option2"
                        checked={value === "option2"}
                        onChange={(e) => onChange(e.currentTarget.value)}
                        label={SKEW_OPTIONS_STEP.option2}
                        disabled={!allowWeighted}
                        size={size}
                    />
                    <Radio
                        name="skewchoice"
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
                        onChange={(v) => setRegionalSkew(v === "" || v == null ? "" : String(v))}
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
                        onChange={(v) => setRegionalSkewMSE(v === "" || v == null ? "" : String(v))}
                        disabled={!isRegional}
                        hideControls
                    />
                </div>
            </div>

            {helpText ? <Text size="xs" mt="xs">{helpText}</Text> : null}
        </fieldset>
    );
}

export function skewChoiceToOptions(choice: string, regionalSkew?: unknown, regionalSkewMSE?: unknown) {
    const useRegional = choice === "option3";
    return {
        useRegionalSkew: useRegional,
        regionalSkew: useRegional ? Number(regionalSkew) : undefined,
        regionalSkewMSE: useRegional ? Number(regionalSkewMSE) : undefined,
    };
}

function summaryChoiceLabel(choice?: string) {
    if (choice === "option1") return TextStore.interface("AnalysisWizard_Skew_Summary_UseStationSkew");
    if (choice === "option2") return TextStore.interface("AnalysisWizard_Skew_Summary_UseWeightedSkew");
    if (choice === "option3") return TextStore.interface("AnalysisWizard_Skew_Summary_UseRegionalSkew");
    return "";
}

export function SkewSummary({
                                choice,
                                regionalSkew,
                                regionalSkewMSE,
                            }: {
    choice?: string;
    regionalSkew?: string | number;
    regionalSkewMSE?: string | number;
}) {
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

                {choice === "option3" && regionalSkew !== "" && regionalSkew != null && (
                    <li>
                        <strong>{TextStore.interface("AnalysisWizard_Skew_Summary_RegionalSkew")}</strong>{" "}
                        {regionalSkew}
                    </li>
                )}

                {choice === "option3" && regionalSkewMSE !== "" && regionalSkewMSE != null && (
                    <li>
                        <strong>{TextStore.interface("AnalysisWizard_Skew_Summary_RegionalSkewMSE")}</strong>{" "}
                        {regionalSkewMSE}
                    </li>
                )}
            </ul>
        </>
    );
}

/** Generic, reusable step factory */
export function makeSkewStep<B extends SkewBag>({
                                                    allowStation = false,
                                                    allowWeighted = false,
                                                    compact = false,
                                                    key = "skew",
                                                }: {
    allowStation?: boolean;
    allowWeighted?: boolean;
    compact?: boolean;
    key?: string;
} = {}) {
    const label = TextStore.interface("AnalysisWizard_Skew_StepSkew");

    const validate = (ctx: ValidateCtx<B>) => {
        const choice = (ctx.bag.skewChoice as string) || "";
        if (choice === "option3") {
            return (ctx.bag.regionalSkew ?? "") !== "" && (ctx.bag.regionalSkewMSE ?? "") !== "";
        }
        return true;
    };

    const render = ({ bag, setBag }: RenderCtx<B>) => (
        <WizardSkew
            value={String(bag.skewChoice ?? "")}
            onChange={(val) => setBag((prev) => ({ ...prev, skewChoice: val }))}
            regionalSkew={(bag.regionalSkew as string | number) ?? ""}
            setRegionalSkew={(val) => setBag((prev) => ({ ...prev, regionalSkew: val }))}
            regionalSkewMSE={(bag.regionalSkewMSE as string | number) ?? ""}
            setRegionalSkewMSE={(val) => setBag((prev) => ({ ...prev, regionalSkewMSE: val }))}
            allowStation={allowStation}
            allowWeighted={allowWeighted}
            compact={compact}
        />
    );

    const summary = ({ bag }: { bag: B }) => (
        <SkewSummary
            choice={bag.skewChoice as string}
            regionalSkew={bag.regionalSkew as string | number | undefined}
            regionalSkewMSE={bag.regionalSkewMSE as string | number | undefined}
        />
    );

    return { key, label, render, validate, summary };
}
