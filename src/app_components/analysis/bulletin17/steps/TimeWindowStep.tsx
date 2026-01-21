import React from "react";
import { Stack, Text, NumberInput } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import type { WizardStep, WizardBag } from "../../_shared/WizardRunner";

type Bag = WizardBag;

export default function makeTimeWindowStep(): WizardStep<Bag> {
  return {
    label: TextStore.interface("Bulletin17_Wizard_TimeWindow_Label"),
    render: ({ bag, setBag }) => (
      <Stack gap="xs">
        <Text size="sm" fw={500}>
          {TextStore.interface("Bulletin17_Wizard_TimeWindow_Description")}
        </Text>

        <NumberInput
          label={TextStore.interface("Bulletin17_Wizard_TimeWindow_StartYear")}
          value={typeof bag.startYear === "number" ? (bag.startYear as number) : undefined}
          onChange={(v) => setBag((prev) => ({ ...prev, startYear: Number(v) || undefined }))}
          min={1800}
          max={2100}
          step={1}
          allowDecimal={false}
          hideControls={false}
          style={{ width: "25%" }}
        />

        <NumberInput
          label={TextStore.interface("Bulletin17_Wizard_TimeWindow_EndYear")}
          value={typeof bag.endYear === "number" ? (bag.endYear as number) : undefined}
          onChange={(v) => setBag((prev) => ({ ...prev, endYear: Number(v) || undefined }))}
          min={0}
          max={9999}
          step={1}
          allowDecimal={false}
          hideControls={false}
          style={{ width: "25%" }}
        />
      </Stack>
    ),
  };
}
