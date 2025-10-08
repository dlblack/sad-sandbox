import React from "react";
import WizardRunner from "../components/WizardRunner";
import { makeWizardGeneralInfoStep, GeneralInfoSummary } from "../components/steps/WizardGeneralInfo";
import { makeSkewStep, SkewSummary, skewChoiceToOptions } from "../components/steps/WizardSkew";
import { TextStore } from "../../../utils/TextStore";
import { Stack, Text, NumberInput, Radio } from "@mantine/core";

type Bag = Record<string, unknown>;
interface WizardCtx {
    name?: string;
    description?: string;
    selectedDataset?: string;
    bag: Bag;
}

export interface Bulletin17AnalysisWizardProps {
    [key: string]: unknown;
}

export default function Bulletin17AnalysisWizard(props: Bulletin17AnalysisWizardProps) {
    const steps = [
        makeWizardGeneralInfoStep(),

        {
            label: TextStore.interface("Bulletin17_Wizard_Method_Label"),
            render: ({ bag, setBag }: { bag: Bag; setBag: (fn: (prev: Bag) => Bag) => void }) => (
                <Stack gap="xs">
                    <Radio
                        name="b17method"
                        value="B17B"
                        disabled
                        checked={(String(bag.method || "B17C")) === "B17B"}
                        onChange={(e) => setBag((prev) => ({ ...prev, method: e.currentTarget.value }))}
                        label={
                            <>
                                {TextStore.interface("Bulletin17_Wizard_Method_B17B")} {""}
                                <Text size="xs" c="dimmed" component="span">(disabled)</Text>
                            </>
                        }
                    />
                    <Radio
                        name="b17method"
                        value="B17C"
                        checked={(String(bag.method || "B17C")) === "B17C"}
                        onChange={(e) => setBag((prev) => ({ ...prev, method: e.currentTarget.value }))}
                        label={TextStore.interface("Bulletin17_Wizard_Method_B17C")}
                    />
                </Stack>
            ),
        },

        makeSkewStep({ allowStation: false, allowWeighted: false, compact: true }),

        {
            label: TextStore.interface("Bulletin17_Wizard_Prob_Label"),
            render: ({ bag, setBag }: { bag: Bag; setBag: (fn: (prev: Bag) => Bag) => void }) => (
                <Stack gap="xs">
                    <Text>{TextStore.interface("Bulletin17_Wizard_Prob_Field")}</Text>
                    <NumberInput
                        id="b17prob"
                        step={0.0001}
                        min={0}
                        max={1}
                        value={typeof bag.probability === "number" ? bag.probability : 0.01}
                        onChange={(v) => setBag((prev) => ({ ...prev, probability: Number(v) }))}
                    />
                </Stack>
            ),
        },

        {
            label: TextStore.interface("Bulletin17_Wizard_Step_Summary"),
            render: ({ name, description, selectedDataset, bag }: WizardCtx) => (
                <Stack gap="sm">
                    <Text fw={600}>{TextStore.interface("Wizard_Summary_Title")}</Text>

                    <GeneralInfoSummary
                        name={name}
                        description={description}
                        selectedDataset={selectedDataset}
                    />

                    <Stack gap={2}>
                        <Text size="sm">
                            <strong>{TextStore.interface("Bulletin17_Wizard_Method_Label")}</strong> {String(bag.method || "B17C")}
                        </Text>
                        <Text size="sm">
                            <strong>{TextStore.interface("Bulletin17_Wizard_Prob_Field")}</strong> {String(bag.probability ?? 0.01)}
                        </Text>
                    </Stack>

                    <SkewSummary
                        choice={bag.skewChoice as string}
                        regionalSkew={bag.regionalSkew as number | string | undefined}
                        regionalSkewMSE={bag.regionalSkewMSE as number | string | undefined}
                    />
                </Stack>
            ),
        },
    ];

    const validateNext = (ctx: WizardCtx, stepIndex: number) => {
        if (stepIndex === 3 && String(ctx.bag.skewChoice || "") === "option3") {
            return String(ctx.bag.regionalSkew ?? "") !== "" && String(ctx.bag.regionalSkewMSE ?? "") !== "";
        }
        return true;
    };

    interface B17Result {
        name?: string;
        description?: string;
        selectedDataset: string;
        method: string;
        probability: number;
        datasetRef: string;
        options: unknown;
    }

    const buildResult = (ctx: WizardCtx): B17Result => {
        const opts = skewChoiceToOptions(
            String(ctx.bag.skewChoice || ""),
            ctx.bag.regionalSkew,
            ctx.bag.regionalSkewMSE
        );

        return {
            name: ctx.name,
            description: ctx.description,
            selectedDataset: ctx.selectedDataset || "",
            method: String(ctx.bag.method || "B17C"),
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
