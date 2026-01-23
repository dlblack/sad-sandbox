import React from "react";
import { Stack, Text } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import type { WizardStep, WizardBag } from "../../_shared/WizardRunner";
import { GeneralInfoSummary } from "../../_shared/steps";
import { SkewSummary } from "../../_shared/steps";

type Bag = WizardBag;

function asStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x ?? ""));
  return [];
}

export default function makeSummaryStep(): WizardStep<Bag> {
  return {
    label: TextStore.interface("Bulletin17_Wizard_Step_Summary"),
    render: ({ name, description, selectedDataset, bag }) => {
      const probs = asStringArray(bag.probabilities)
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n));

      return (
        <Stack gap="sm">
          <Text fw={600}>{TextStore.interface("Wizard_Summary_Title")}</Text>

          <GeneralInfoSummary name={name} description={description} selectedDataset={selectedDataset} />

          <Stack gap={2}>
            <Text size="sm">
              <strong>Start Year:</strong> {bag.startYear as number}
            </Text>
            <Text size="sm">
              <strong>End Year:</strong> {bag.endYear as number}
            </Text>
            <Text size="sm">
              <strong>{TextStore.interface("Bulletin17_Wizard_Prob_Field")}</strong>{" "}
              {probs.length ? probs.map((p) => p.toFixed(1)).join(", ") : "—"}
            </Text>
          </Stack>

          <SkewSummary
            choice={bag.skewChoice as string}
            regionalSkew={bag.regionalSkew as number | string | undefined}
            regionalSkewMSE={bag.regionalSkewMSE as number | string | undefined}
          />
        </Stack>
      );
    },
  };
}
