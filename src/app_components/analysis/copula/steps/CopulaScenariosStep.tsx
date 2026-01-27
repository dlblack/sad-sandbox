import React, { useState, useEffect } from "react";
import { Box, Text, Table, TextInput, Select } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import type { WizardStep, WizardCtx } from "../../_shared/WizardRunner";

// Dummy data for the select dropdowns
const DUMMY_DATASETS = [
  { value: "MarshalltownAMS", label: "MarshalltownAMS" },
  { value: "MarengoAMS", label: "MarengoAMS" },
  { value: "MarengoCoincident", label: "MarengoCoincident" },
  { value: "MarshalltownCoincident", label: "MarshalltownCoincident" },
];

type ScenarioRow = {
  name: string;
  conditioningDataset: string | null;
  nonConditionedDataset: string | null;
};

function ScenariosPanel({ bag, setBag }: Pick<WizardCtx, "bag" | "setBag">) {
  const [scenarios, setScenarios] = useState<ScenarioRow[]>(() => {
    const savedScenarios = (bag as any)?.scenarios;
    if (Array.isArray(savedScenarios) && savedScenarios.length > 0) {
      return savedScenarios;
    }

    return [
      {
        name: "",
        conditioningDataset: "MarshalltownAMS",
        nonConditionedDataset: "MarengoCoincident",
      },
      {
        name: "",
        conditioningDataset: "MarengoAMS",
        nonConditionedDataset: "MarshalltownCoincident",
      },
    ];
  });

  // Save scenarios to bag whenever they change
  useEffect(() => {
    setBag((prev) => ({
      ...(prev as Record<string, unknown>),
      scenarios: scenarios,
    }));
  }, [scenarios, setBag]);

  const updateScenario = (
    index: number,
    field: keyof ScenarioRow,
    value: string | null
  ) => {
    setScenarios((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <Box>
      <Text size="sm" mb="md">
        {TextStore.interface("Copula_Wizard_StepScenarios_Label")}
      </Text>

      <Table withTableBorder withColumnBorders striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Scenario Name</Table.Th>
            <Table.Th>Conditioning Variable Dataset</Table.Th>
            <Table.Th>Non-Conditioned Variable Dataset</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {scenarios.map((scenario, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <TextInput
                  value={scenario.name}
                  onChange={(e) =>
                    updateScenario(index, "name", e.currentTarget.value)
                  }
                  variant="unstyled"
                  styles={{
                    input: {
                      padding: "8px",
                    },
                  }}
                />
              </Table.Td>
              <Table.Td>
                <Select
                  value={scenario.conditioningDataset}
                  onChange={(value) =>
                    updateScenario(index, "conditioningDataset", value)
                  }
                  data={DUMMY_DATASETS}
                  variant="filled"
                  styles={{
                    input: {
                      border: "1px solid var(--mantine-color-dark-4)",
                      borderRadius: "4px",
                    },
                  }}
                />
              </Table.Td>
              <Table.Td>
                <Select
                  value={scenario.nonConditionedDataset}
                  onChange={(value) =>
                    updateScenario(index, "nonConditionedDataset", value)
                  }
                  data={DUMMY_DATASETS}
                  variant="filled"
                  styles={{
                    input: {
                      border: "1px solid var(--mantine-color-dark-4)",
                      borderRadius: "4px",
                    },
                  }}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}

export default function makeScenariosStep(): WizardStep {
  return {
    label: TextStore.interface("Copula_Wizard_StepScenarios"),
    render: (ctx: WizardCtx) => (
      <Box p="sm">
        <ScenariosPanel bag={ctx.bag} setBag={ctx.setBag} />
      </Box>
    ),
  };
}