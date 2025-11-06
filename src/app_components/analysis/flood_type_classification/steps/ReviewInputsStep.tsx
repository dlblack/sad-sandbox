import React from "react";
import type { WizardStep, WizardCtx } from "../../components/WizardRunner";
import { TextStore } from "../../../../utils/TextStore";
import { Stack, Title } from "@mantine/core";

const L = (k: string) => TextStore.interface?.(k) ?? "";

export default function makeReviewInputsStep({
                                                 GeneralInfoSummary,
                                                 FlowDataSourceSummary,
                                                 FloodTypeSummary,
                                                 DataSourcesSummary,
                                                 LookbackSummary,
                                                 ThresholdsSummary
                                             }: {
    GeneralInfoSummary: React.ComponentType<{
        name?: string;
        description?: string;
        selectedDataset?: string;
    }>;
    FlowDataSourceSummary: React.ComponentType<{ bag: Record<string, unknown> }>;
    FloodTypeSummary: React.ComponentType<{ bag: Record<string, unknown> }>;
    DataSourcesSummary: React.ComponentType<{ bag: Record<string, unknown> }>;
    LookbackSummary: React.ComponentType<{ bag: Record<string, unknown> }>;
    ThresholdsSummary: React.ComponentType<{ bag: Record<string, unknown> }>;
}): WizardStep {
    return {
        label: L("FloodTypeClass_Wizard_StepReview"),
        render: ({ name, description, selectedDataset, bag }: WizardCtx) => (
            <Stack gap="md" p={8}>
                <Title order={6}>{L("Wizard_Summary_Title")}</Title>

                <GeneralInfoSummary
                    name={name}
                    description={description}
                    selectedDataset={selectedDataset}
                />

                <FlowDataSourceSummary bag={bag as any} />
                <FloodTypeSummary bag={bag as any} />
                <DataSourcesSummary bag={bag as any} />
                <LookbackSummary bag={bag as any} />
                <ThresholdsSummary bag={bag as any} />
            </Stack>
        )
    };
}
