import React from "react";
import WizardRunner from "../components/WizardRunner.jsx";
import { makeWizardGeneralInfoStep, GeneralInfoSummary } from "../components/steps/WizardGeneralInfo.jsx";
import { makeSkewStep, SkewSummary, skewChoiceToOptions } from "../components/steps/WizardSkew.jsx";
import { TextStore } from "../../../utils/TextStore.js";
import { Stack, Text, NumberInput, Radio } from "@mantine/core";

export default function Bulletin17AnalysisWizard(props) {
  const steps = [
    makeWizardGeneralInfoStep(),

    {
      label: TextStore.interface("Bulletin17_Wizard_Method_Label"),
      render: ({ bag, setBag }) => (
        <Stack gap="xs">
          <Radio
            name="b17-method"
            value="B17B"
            disabled
            checked={(bag.method || "B17C") === "B17B"}
            onChange={(e) => setBag((prev) => ({ ...prev, method: e.currentTarget.value }))}
            label={
              <>
                {TextStore.interface("Bulletin17_Wizard_Method_B17B")}{" "}
                <Text size="xs" c="dimmed" component="span">(disabled)</Text>
              </>
            }
          />
          <Radio
            name="b17-method"
            value="B17C"
            checked={(bag.method || "B17C") === "B17C"}
            onChange={(e) => setBag((prev) => ({ ...prev, method: e.currentTarget.value }))}
            label={TextStore.interface("Bulletin17_Wizard_Method_B17C")}
          />
        </Stack>
      ),
    },

    makeSkewStep({ allowStation: false, allowWeighted: false, compact: true }),

    {
      label: TextStore.interface("Bulletin17_Wizard_Prob_Label"),
      render: ({ bag, setBag }) => (
        <Stack gap="xs">
          <Text>{TextStore.interface("Bulletin17_Wizard_Prob_Field")}</Text>
          <NumberInput
            id="b17-prob"
            step={0.0001}
            min={0}
            max={1}
            value={bag.probability ?? 0.01}
            onChange={(v) => setBag((prev) => ({ ...prev, probability: v }))}
          />
        </Stack>
      ),
    },

    {
      label: TextStore.interface("Bulletin17_Wizard_Step_Summary"),
      render: ({ name, description, selectedDataset, bag }) => (
        <Stack gap="sm">
          <Text fw={600}>{TextStore.interface("Wizard_Summary_Title")}</Text>

          <GeneralInfoSummary
            name={name}
            description={description}
            selectedDataset={selectedDataset}
          />

          <Stack gap={2}>
            <Text size="sm">
              <strong>{TextStore.interface("Bulletin17_Wizard_Method_Label")}</strong>{" "}
              {bag.method || "B17C"}
            </Text>
            <Text size="sm">
              <strong>{TextStore.interface("Bulletin17_Wizard_Prob_Field")}</strong>{" "}
              {bag.probability ?? 0.01}
            </Text>
          </Stack>

          <SkewSummary
            choice={bag.skewChoice}
            regionalSkew={bag.regionalSkew}
            regionalSkewMSE={bag.regionalSkewMSE}
          />
        </Stack>
      ),
    },
  ];

  const validateNext = (ctx, stepIndex) => {
    // Leaving Skew step: it is step 3 here
    if (stepIndex === 3 && (ctx.bag.skewChoice || "") === "option3") {
      return (ctx.bag.regionalSkew ?? "") !== "" && (ctx.bag.regionalSkewMSE ?? "") !== "";
    }
    return true;
  };

  const buildResult = (ctx) => {
    const opts = skewChoiceToOptions(
      ctx.bag.skewChoice || "",
      ctx.bag.regionalSkew,
      ctx.bag.regionalSkewMSE
    );

    return {
      name: ctx.name,
      description: ctx.description,
      selectedDataset: ctx.selectedDataset || "",
      method: ctx.bag.method || "B17C",
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
